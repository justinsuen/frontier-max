import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Which of the account's profiles is watching. Ownership is re-checked against
// the account's own profiles on every request, so a forged value is ignored.
export const PROFILE_COOKIE = "fm_profile";

export const AVATAR_COLORS = ["navy", "brass", "green", "rose", "slate"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export const MAX_PROFILES = 5;

// avatar: a character picture id from lib/avatars.ts, or null for the coloured initial.
export type Profile = { id: string; name: string; avatar_color: AvatarColor; avatar: string | null };

// Shared by every component in one request, so the session is read once.
export const getAccount = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { supabase, user: null, profiles: [] as Profile[], profile: null };

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar_color, avatar")
    .order("created_at")
    .returns<Profile[]>();
  const activeId = (await cookies()).get(PROFILE_COOKIE)?.value;

  return {
    supabase,
    user: { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null },
    profiles: profiles ?? [],
    profile: profiles?.find((p) => p.id === activeId) ?? null,
  };
});

// For pages that work signed out but need a profile picked once someone signs in.
export async function requireProfileIfSignedIn(next: string) {
  const account = await getAccount();
  if (account.user && !account.profile) redirect(`/profiles?next=${encodeURIComponent(next)}`);
  return account;
}

// Only follow redirects to paths on this site.
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback = "/") {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
