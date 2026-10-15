import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The publishable (or legacy anon) key is safe to expose; Row Level Security protects the data.
// Vercel's Supabase integration sets the ANON_KEY name, so accept either.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabase(): SupabaseClient | null {
  return url && key ? createClient(url, key) : null;
}
