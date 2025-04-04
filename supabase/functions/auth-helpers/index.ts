// Supabase Edge Function for authentication helpers
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Create a Supabase client with the Admin key
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    // Route the request based on the action
    switch (action) {
      case "validateSession":
        return await validateSession(payload);
      case "getUserProfile":
        return await getUserProfile(payload);
      case "updateUserProfile":
        return await updateUserProfile(payload);
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Validate a user session and return user data
async function validateSession({ session }) {
  if (!session?.access_token) {
    throw new Error("Invalid session");
  }

  // Verify the session using the admin client
  const { data, error } = await supabase.auth.getUser(session.access_token);

  if (error) {
    throw new Error(`Session validation failed: ${error.message}`);
  }

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Get user profile data including preferences and settings
async function getUserProfile({ userId }) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Get user data from the users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError) {
    throw new Error(`Failed to get user profile: ${userError.message}`);
  }

  // Get user lists counts
  const { data: listsData, error: listsError } = await supabase
    .from("user_anime_lists")
    .select("list_type, count")
    .eq("user_id", userId)
    .group("list_type");

  if (listsError) {
    throw new Error(`Failed to get user lists: ${listsError.message}`);
  }

  // Format the response
  const profile = {
    ...userData,
    lists: {
      watchlist: 0,
      favorites: 0,
      history: 0,
    },
  };

  // Add list counts
  if (listsData) {
    listsData.forEach((item) => {
      if (item.list_type in profile.lists) {
        profile.lists[item.list_type] = parseInt(item.count);
      }
    });
  }

  return new Response(JSON.stringify({ profile }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Update user profile data
async function updateUserProfile({ userId, profileData }) {
  if (!userId || !profileData) {
    throw new Error("User ID and profile data are required");
  }

  // Update user data in the users table
  const { data, error } = await supabase
    .from("users")
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return new Response(JSON.stringify({ profile: data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
