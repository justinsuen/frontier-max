import { notFound } from "next/navigation";
import { cache } from "react";
import { getSupabase } from "@/lib/supabase";
import Watch, { type Episode, type TitleDetail } from "./watch";

export const dynamic = "force-dynamic";

type TitleRow = Omit<TitleDetail, "genres" | "episodes"> & {
  genres: { name: string }[] | null;
  episodes: Episode[] | null;
};

const SELECT =
  "id, type, name, description, release_year, poster_url, video_url, genres(name), " +
  "episodes(id, season_number, episode_number, name, video_url)";

// cache() lets generateMetadata and the page share one query per request.
const getTitle = cache(async (id: string) => {
  const supabase = getSupabase();
  if (!supabase || !/^\d+$/.test(id)) return null;
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
  const title = await getTitle((await params).id);
  if (!title) notFound();
  return <Watch title={title} />;
}
