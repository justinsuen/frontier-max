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
