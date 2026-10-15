import type { SupabaseClient } from "@supabase/supabase-js";

// Shared between the server action and the title page.
export const RATINGS = ["not_for_me", "liked", "loved"] as const;
export type Rating = (typeof RATINGS)[number];

export const RATING_LABELS: Record<Rating, string> = {
  not_for_me: "Not for me",
  liked: "I liked this",
  loved: "I loved this",
};

export type RatingCounts = Record<Rating, number>;
export const NO_RATINGS: RatingCounts = { not_for_me: 0, liked: 0, loved: 0 };

export type RatingSummaryRow = { episode_id: number | null } & RatingCounts;

// Totals for every rated item of a title, from the public rating_summary() function.
export async function getRatingSummary(supabase: SupabaseClient, titleId: number): Promise<RatingSummaryRow[]> {
  const { data } = await supabase.rpc("rating_summary", { target_title: titleId });
  return ((data ?? []) as RatingSummaryRow[]).map((r) => ({
    episode_id: r.episode_id,
    not_for_me: Number(r.not_for_me),
    liked: Number(r.liked),
    loved: Number(r.loved),
  }));
}

export async function getRatingCounts(supabase: SupabaseClient, titleId: number, episodeId: number | null) {
  const rows = await getRatingSummary(supabase, titleId);
  const row = rows.find((r) => r.episode_id === episodeId);
  return row ? { not_for_me: row.not_for_me, liked: row.liked, loved: row.loved } : NO_RATINGS;
}
