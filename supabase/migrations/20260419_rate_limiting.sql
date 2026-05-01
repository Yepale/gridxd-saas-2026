-- GridXD Rate Limiting Migration
-- Moves daily usage tracking from client localStorage to server-side Supabase
-- This prevents trivial bypass via DevTools

-- Add rate limiting columns to subscribers table
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS daily_uses INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);

-- Function: Check usage limit and auto-increment atomically
-- Returns TRUE if the operation is allowed (within limits), FALSE if rate-limited
CREATE OR REPLACE FUNCTION check_and_increment_usage(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier        TEXT;
  v_daily_uses  INTEGER;
  v_last_reset  DATE;
  v_limit       INTEGER;
BEGIN
  -- Fetch current subscriber record
  SELECT plan, daily_uses, last_reset_date
  INTO   v_tier, v_daily_uses, v_last_reset
  FROM   subscribers
  WHERE  user_id = p_user_id;

  -- If no subscriber record exists, treat as free tier, create it
  IF NOT FOUND THEN
    INSERT INTO subscribers (user_id, plan, daily_uses, last_reset_date)
    VALUES (p_user_id, 'free', 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN TRUE;
  END IF;

  -- Auto-reset daily counter when day changes
  IF v_last_reset < CURRENT_DATE THEN
    UPDATE subscribers
    SET    daily_uses = 1,
           last_reset_date = CURRENT_DATE
    WHERE  user_id = p_user_id;
    RETURN TRUE;
  END IF;

  -- Determine tier limit
  v_limit := CASE v_tier
    WHEN 'free'    THEN 3
    WHEN 'pro'     THEN 100
    WHEN 'proplus' THEN 999999
    ELSE 3
  END;

  -- Check limit
  IF v_daily_uses >= v_limit THEN
    RETURN FALSE;  -- Rate limited
  END IF;

  -- Increment atomically
  UPDATE subscribers
  SET    daily_uses = daily_uses + 1
  WHERE  user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION check_and_increment_usage(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID) TO authenticated;

-- RLS policy: users can only see their own subscriber record
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscribers' AND policyname = 'Users can view own subscription'
  ) THEN
    ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view own subscription"
      ON subscribers FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END;
$$;
