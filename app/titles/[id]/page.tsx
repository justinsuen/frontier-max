import { notFound } from "next/navigation";
import { cache } from "react";
import { getAccount, requireProfileIfSignedIn } from "@/lib/account";
import AccountNav from "../../components/account-nav";
import type { Rating } from "@/lib/ratings";
import Watch, { type Episode, type Progress, type RatingSummaryRow, type TitleDetail } from "./watch";

export const dynamic = "force-dynamic";

type TitleRow = Omit<TitleDetail, "genres" | "episodes"> & {
  genres: { name: string }[] | null;
  episodes: Episode[] | null;
};

const SELECT =
  "id, type, name, description, release_year, poster_url, video_url, genres(name), " +
  "episodes(id, season_number, episode_number, name, description, video_url, thumbnail_url, watch_url)";

// cache() lets generateMetadata and the page share one query per request.
const getTitle = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) return null;
  const { supabase } = await getAccount();
  const { data, error } = await supabase.from("titles").select(SELECT).eq("id", id).maybeSingle<TitleRow>();
  if (error) throw new Error(`Couldn't load title: ${error.message}`);
  if (!data) return null;

  const episodes = [...(data.episodes ?? [])].sort(
    (a, b) => a.season_number - b.season_number || a.episode_number - b.episode_number
  );
  return { ...data, genres: (data.genres ?? []).map((g) => g.name), episodes };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const title = await getTitle((await params).id);
  return { title: title ? `${title.name} · Frontier Max` : "Frontier Max" };
}

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await requireProfileIfSignedIn(`/titles/${id}`);
  const title = await getTitle(id);
  if (!title) notFound();

  // Everyone sees the totals; only the active profile's own ratings are loaded as "mine".
  const { data: summaryData } = await supabase.rpc("rating_summary", { target_title: title.id });
  const ratingSummary = (summaryData ?? []) as RatingSummaryRow[];

  let progress: Progress[] = [];
  let inWatchlist = false;
  let myRatings: { episode_id: number | null; rating: Rating }[] = [];
  if (profile) {
    const [progressResult, watchlistResult, ratingsResult] = await Promise.all([
      supabase
        .from("watch_progress")
        .select("episode_id, position_seconds, duration_seconds, completed, updated_at")
        .eq("profile_id", profile.id)
        .eq("title_id", title.id)
        .returns<Progress[]>(),
      supabase
        .from("watchlist")
        .select("title_id", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .eq("title_id", title.id),
      supabase
        .from("ratings")
        .select("episode_id, rating")
        .eq("profile_id", profile.id)
        .eq("title_id", title.id)
        .returns<{ episode_id: number | null; rating: Rating }[]>(),
    ]);
    progress = progressResult.data ?? [];
    inWatchlist = (watchlistResult.count ?? 0) > 0;
    myRatings = ratingsResult.data ?? [];
  }

  return (
    <Watch
      key={profile?.id ?? "guest"}
      title={title}
      progress={progress}
      canTrack={Boolean(profile)}
      signedIn={Boolean(user)}
      inWatchlist={inWatchlist}
      ratingSummary={ratingSummary}
      myRatings={myRatings}
      accountNav={<AccountNav />}
    />
  );
}
