import { requireProfileIfSignedIn } from "@/lib/account";
import AccountNav from "./components/account-nav";
import Browse, { type ContinueItem, type Title } from "./browse";

// Read the catalog on every request so rows added in Supabase show up right away.
export const dynamic = "force-dynamic";

type TitleRow = Omit<Title, "genres"> & { genres: { name: string }[] | null };
type ProgressRow = {
  title_id: number;
  position_seconds: number;
  duration_seconds: number | null;
  episodes: { season_number: number; episode_number: number; name: string | null } | null;
};

export default async function HomePage() {
  const { supabase, profile } = await requireProfileIfSignedIn("/");

  const { data, error } = await supabase
    .from("titles")
    .select("id, type, name, release_year, poster_url, genres(name)")
    .order("name")
    .returns<TitleRow[]>();

  if (error) {
    return <Browse titles={[]} message={`Couldn't load titles: ${error.message}`} accountNav={<AccountNav />} />;
  }
  const titles = data.map((t) => ({ ...t, genres: (t.genres ?? []).map((g) => g.name) }));
  const byId = new Map(titles.map((t) => [t.id, t]));

  let continueWatching: ContinueItem[] = [];
  let myList: Title[] = [];
  if (profile) {
    const [progress, watchlist] = await Promise.all([
      supabase
        .from("watch_progress")
        .select("title_id, position_seconds, duration_seconds, episodes(season_number, episode_number, name)")
        .eq("profile_id", profile.id)
        .eq("completed", false)
        .gte("position_seconds", 10)
        .order("updated_at", { ascending: false })
        .limit(50)
        .returns<ProgressRow[]>(),
      supabase
        .from("watchlist")
        .select("title_id")
        .eq("profile_id", profile.id)
        .order("added_at", { ascending: false }),
    ]);

    // Most recent unfinished video per title.
    const seen = new Set<number>();
    for (const row of progress.data ?? []) {
      const title = byId.get(row.title_id);
      if (!title || seen.has(row.title_id)) continue;
      seen.add(row.title_id);
      const ep = row.episodes;
      continueWatching.push({
        title,
        label: ep ? `S${ep.season_number} · E${ep.episode_number}${ep.name ? ` · ${ep.name}` : ""}` : null,
        percent: row.duration_seconds ? Math.min(100, (row.position_seconds / row.duration_seconds) * 100) : 0,
      });
    }
    continueWatching = continueWatching.slice(0, 12);
    myList = (watchlist.data ?? []).flatMap((w) => byId.get(w.title_id) ?? []);
  }

  return (
    <Browse
      titles={titles}
      continueWatching={continueWatching}
      myList={profile ? myList : undefined}
      profileName={profile?.name}
      accountNav={<AccountNav />}
    />
  );
}
