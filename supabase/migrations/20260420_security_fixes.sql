-- GridXD: Security Hardening & Bug Fixes
-- Date: 2026-04-20

-- 1. Secure check_and_increment_usage
-- Prevents users from incrementing other users' usage counts (DoS vector)
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(p_user_id UUID)
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
  v_caller_role TEXT;
  v_caller_id   UUID;
BEGIN
  -- Get caller context
  v_caller_role := auth.role();
  v_caller_id := auth.uid();

  -- Enforcement: 'authenticated' users can only update their own record.
  -- 'service_role' (the backend) can update any record.
  IF v_caller_role = 'authenticated' AND v_caller_id <> p_user_id THEN
    RAISE EXCEPTION 'Security Error: You can only track your own usage.';
  END IF;

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

-- 2. Fix bug in get_admin_metrics (incorrect column name)
CREATE OR REPLACE FUNCTION public.get_admin_metrics()
RETURNS TABLE (
  total_users BIGINT,
  total_extractions BIGINT,
  total_images BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_email TEXT;
  extracted_count BIGINT;
  images_count BIGINT;
  users_count BIGINT;
BEGIN
  -- Verify admin identity
  SELECT email INTO caller_email FROM auth.users WHERE id = auth.uid();
  
  IF caller_email <> 'iberusdelasierra@gmail.com' THEN
    RAISE EXCEPTION 'Access denied. Admin account required.';
  END IF;

  -- Fix: using correct column name 'icon_count' instead of 'processed_images'
  SELECT COALESCE(SUM(icon_count), 0) INTO extracted_count FROM processing_history;
  
  -- Total number of processing sessions
  SELECT COUNT(*) INTO images_count FROM processing_history;

  -- Total registered users
  SELECT COUNT(*) INTO users_count FROM auth.users;

  RETURN QUERY SELECT users_count, extracted_count, images_count;
END;
$$;
