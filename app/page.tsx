import { getSupabase } from "@/lib/supabase";
import Browse, { type Title } from "./browse";

// Read the catalog on every request so rows added in Supabase show up right away.
export const dynamic = "force-dynamic";

type TitleRow = Omit<Title, "genres"> & { genres: { name: string }[] | null };

export default async function HomePage() {
  const supabase = getSupabase();
  if (!supabase) {
    return <Browse titles={[]} message="Supabase isn't connected yet. Set the environment variables listed in .env.example." />;
  }

  const { data, error } = await supabase
    .from("titles")
    .select("id, type, name, release_year, poster_url, genres(name)")
    .order("name")
    .returns<TitleRow[]>();

  if (error) {
    return <Browse titles={[]} message={`Couldn't load titles: ${error.message}`} />;
  }

  const titles = data.map((t) => ({ ...t, genres: (t.genres ?? []).map((g) => g.name) }));
  return <Browse titles={titles} />;
}
