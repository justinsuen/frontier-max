// The publishable (or legacy anon) key is safe to expose; Row Level Security protects the data.
// Vercel's Supabase integration sets the ANON_KEY name, so accept either.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Supabase isn't configured. Set the environment variables listed in .env.example.");
}

export const supabaseUrl = url;
export const supabaseKey = key;
