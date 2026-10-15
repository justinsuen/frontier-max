import { requireProfileIfSignedIn } from "@/lib/account";
import AccountNav from "./components/account-nav";
import Browse, { type Collection, type ContinueItem, type Title } from "./browse";
import type { FeaturedItem } from "./featured";

// The special section whose titles rotate in the banner instead of forming a row.
const FEATURED_SLUG = "featured";

// Read the catalog on every request so rows added in Supabase show up right away.
export const dynamic = "force-dynamic";

type TitleRow = Omit<Title, "genres"> & { genres: { name: string }[] | null; description: string | null };
type CollectionRow = {
  slug: string;
  name: string;
  description: string | null;
  collection_titles: { title_id: number; position: number }[];
};
type ProgressRow = {
  title_id: number;
  position_seconds: number;
  duration_seconds: number | null;
  episodes: { season_number: number; episode_number: number; name: string | null } | null;
};

export default async function HomePage() {
  const { supabase, user, profile } = await requireProfileIfSignedIn("/");

  const [{ data, error }, { data: collectionRows }] = await Promise.all([
    supabase
      .from("titles")
      .select("id, type, name, description, release_year, poster_url, backdrop_url, logo_url, genres(name)")
      .order("name")
      .returns<TitleRow[]>(),
    supabase
      .from("collections")
      .select("slug, name, description, collection_titles(title_id, position)")
      .order("sort_order")
      .returns<CollectionRow[]>(),
  ]);

  if (error) {
    return <Browse titles={[]} message={`Couldn't load titles: ${error.message}`} accountNav={<AccountNav />} />;
  }
  const descriptions = new Map(data.map((t) => [t.id, t.description]));
  const titles: Title[] = data.map(({ description: _description, ...t }) => ({
    ...t,
    genres: (t.genres ?? []).map((g) => g.name),
  }));
  const byId = new Map(titles.map((t) => [t.id, t]));

  // Sections with their titles in order; empty ones are skipped.
  const collections: Collection[] = (collectionRows ?? []).flatMap((c) => {
    const members = [...c.collection_titles]
      .sort((a, b) => a.position - b.position)
      .flatMap((ct) => byId.get(ct.title_id) ?? []);
    return members.length ? [{ slug: c.slug, name: c.name, description: c.description, titles: members }] : [];
  });
  const featuredTitles = collections.find((c) => c.slug === FEATURED_SLUG)?.titles.slice(0, 5) ?? [];
  const rows = collections.filter((c) => c.slug !== FEATURED_SLUG);

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

  // "Resume" on the banner when this profile is partway through a featured title.
  const resumeLabels = new Map(continueWatching.map((c) => [c.title.id, c.label]));
  const featured: FeaturedItem[] = featuredTitles.map((title) => ({
    title,
    description: descriptions.get(title.id) ?? null,
    playLabel: resumeLabels.has(title.id)
      ? `Resume${resumeLabels.get(title.id) ? ` ${resumeLabels.get(title.id)!.split(" · ").slice(0, 2).join(" · ")}` : ""}`
      : "Play",
  }));

  return (
    <Browse
      titles={titles}
      collections={rows}
      featured={featured}
      signedIn={Boolean(user)}
      continueWatching={continueWatching}
      myList={profile ? myList : undefined}
      profileName={profile?.name}
      accountNav={<AccountNav />}
    />
  );
}
