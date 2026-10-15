// Small helpers for shaping catalog rows from Supabase.

// Number of seasons a series has, from its episodes' season numbers (0 for movies).
export function seasonCount(episodes: { season_number: number }[] | null | undefined) {
  return new Set((episodes ?? []).map((e) => e.season_number)).size;
}
