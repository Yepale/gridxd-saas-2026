import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIERS: Record<string, string> = {
  prod_USRjoaufxAp5xI: "pro",      // Pro en Stripe
  prod_USRjibmMxLKW3g: "proplus",  // Pro+ en Stripe
};


serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError?.message || "User not found");
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log(`Checking subscription for user: ${user.id} (${user.email})`);

    // Query 'subscribers' table instead of Stripe for speed
    const { data: subData, error: subError } = await supabaseClient
      .from("subscribers")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) {
      console.error("Database error fetching subscriber:", subError.message);
      throw subError;
    }

    if (!subData || (subData.status !== "active" && subData.status !== "trialing")) {
      console.log(`User ${user.id} has no active subscription. Returning free plan.`);
      return new Response(JSON.stringify({ subscribed: false, plan: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`User ${user.id} has active plan: ${subData.plan}`);
    return new Response(
      JSON.stringify({
        subscribed: true,
        plan: subData.plan,
        subscription_end: subData.current_period_end,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Uncaught exception in check-subscription:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

