import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In production/build time, provide fallback to prevent build failures
  // But still log warnings
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error("Missing Supabase environment variables!");
      console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "Set" : "Missing");
      console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Set" : "Missing");
    }
    
    // Use placeholder values to prevent build failures
    // These will be caught at runtime in the app
    const fallbackUrl = supabaseUrl || 'https://placeholder.supabase.co';
    const fallbackKey = supabaseAnonKey || 'placeholder-key';
    
    return createBrowserClient(fallbackUrl, fallbackKey);
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

