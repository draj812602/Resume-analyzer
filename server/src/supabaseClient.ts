import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as
      | string
      | undefined;

    // Debug logging
    console.log("🔍 Environment variables check:");
    console.log("SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
    console.log(
      "SUPABASE_SERVICE_KEY:",
      supabaseServiceKey ? "✅ Set" : "❌ Missing"
    );
    console.log("SERVICE_KEY length:", supabaseServiceKey?.length || 0);
    console.log(
      "SERVICE_KEY first 20 chars:",
      supabaseServiceKey?.substring(0, 20) || "none"
    );
    console.log(
      "All env vars:",
      Object.keys(process.env).filter((key) => key.includes("SUPABASE"))
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment."
      );
    }

    console.log("✅ Creating Supabase client with service key");
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseClient;
}
