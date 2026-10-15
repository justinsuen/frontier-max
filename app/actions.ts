"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AVATAR_COLORS, MAX_PROFILES, PROFILE_COOKIE, getAccount, safeNext, type AvatarColor } from "@/lib/account";
import { CHARACTER_AVATAR_IDS } from "@/lib/avatars";
import { RATINGS, getRatingCounts, type Rating, type RatingCounts } from "@/lib/ratings";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

// ---- Signing in and out ----

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error:
        error.code === "email_not_confirmed"
          ? "Confirm your email first. Check your inbox for the link we sent."
          : "That email and password don't match an account.",
    };
  }
  redirect(`/profiles?next=${encodeURIComponent(safeNext(formData.get("next")))}`);
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  if (!name || name.length > 40) return { error: "Enter a name of up to 40 characters." };
  if (!email) return { error: "Enter your email." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name }, emailRedirectTo: `${origin}/auth/confirm?next=/profiles` },
  });
  if (error) return { error: error.message };

  // With email confirmation on, there's no session until the link is clicked.
  if (!data.session) return { message: `Almost done. We sent a confirmation link to ${email}.` };
  redirect("/profiles");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(PROFILE_COOKIE);
  redirect("/");
}

// ---- Profiles ----

function readProfileForm(
  formData: FormData
): { name: string; avatar_color: AvatarColor; avatar: string | null } | string {
  const name = text(formData, "name");
  const color = text(formData, "avatar_color");
  const avatar = text(formData, "avatar");
  if (!name || name.length > 40) return "Enter a name of up to 40 characters.";
  if (!(AVATAR_COLORS as readonly string[]).includes(color)) return "Pick a color.";
  if (avatar && !CHARACTER_AVATAR_IDS.includes(avatar)) return "Pick a picture from the list.";
  return { name, avatar_color: color as AvatarColor, avatar: avatar || null };
}

export async function createProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user, profiles } = await getAccount();
  if (!user) redirect("/login");
  if (profiles.length >= MAX_PROFILES) return { error: `An account can have up to ${MAX_PROFILES} profiles.` };

  const fields = readProfileForm(formData);
  if (typeof fields === "string") return { error: fields };
  const { error } = await supabase.from("profiles").insert({ account_id: user.id, ...fields });
  if (error) return { error: "Couldn't add that profile. Try again." };
  redirect("/profiles?manage=1");
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await getAccount();
  if (!user) redirect("/login");

  const fields = readProfileForm(formData);
  if (typeof fields === "string") return { error: fields };
  const { error } = await supabase.from("profiles").update(fields).eq("id", text(formData, "id"));
  if (error) return { error: "Couldn't save that profile. Try again." };
  redirect("/profiles?manage=1");
}

export async function deleteProfile(formData: FormData) {
  const { supabase, user, profiles } = await getAccount();
  if (!user) redirect("/login");
  // Keep at least one profile so the account stays usable.
  if (profiles.length > 1) {
    const id = text(formData, "id");
    await supabase.from("profiles").delete().eq("id", id);
    const store = await cookies();
    if (store.get(PROFILE_COOKIE)?.value === id) store.delete(PROFILE_COOKIE);
  }
  redirect("/profiles?manage=1");
}

export async function selectProfile(formData: FormData) {
  const { user, profiles } = await getAccount();
  if (!user) redirect("/login");
  const id = text(formData, "id");
  if (profiles.some((p) => p.id === id)) {
    (await cookies()).set(PROFILE_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  redirect(safeNext(formData.get("next")));
}

// ---- Watchlist and progress (called from client components) ----

export async function setInWatchlist(titleId: number, saved: boolean) {
  const { supabase, profile } = await getAccount();
  if (!profile || !Number.isInteger(titleId)) return;
  if (saved) {
    await supabase.from("watchlist").upsert({ profile_id: profile.id, title_id: titleId }, { ignoreDuplicates: true });
  } else {
    await supabase.from("watchlist").delete().eq("profile_id", profile.id).eq("title_id", titleId);
  }
}

export async function saveProgress(input: {
  titleId: number;
  episodeId: number | null;
  position: number;
  duration: number | null;
  completed: boolean;
}) {
  const { supabase, profile } = await getAccount();
  if (!profile) return;
  const { titleId, episodeId, completed } = input;
  const position = Math.max(0, Math.round(input.position));
  const duration = input.duration && input.duration > 0 ? Math.round(input.duration) : null;
  if (!Number.isInteger(titleId) || (episodeId !== null && !Number.isInteger(episodeId)) || !Number.isFinite(position)) {
    return;
  }

  await supabase.from("watch_progress").upsert(
    {
      profile_id: profile.id,
      title_id: titleId,
      episode_id: episodeId,
      position_seconds: position,
      duration_seconds: duration,
      completed: Boolean(completed),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,title_id,episode_id" }
  );
}

// Sets this profile's rating for a title (episodeId null) or an episode; null clears it.
// Returns the updated totals once the profile has a rating, so they can be revealed.
export async function setRating(
  titleId: number,
  episodeId: number | null,
  rating: Rating | null
): Promise<RatingCounts | null> {
  const { supabase, profile } = await getAccount();
  if (!profile || !Number.isInteger(titleId) || (episodeId !== null && !Number.isInteger(episodeId))) return null;
  if (rating !== null && !RATINGS.includes(rating)) return null;

  if (rating === null) {
    let query = supabase.from("ratings").delete().eq("profile_id", profile.id).eq("title_id", titleId);
    query = episodeId === null ? query.is("episode_id", null) : query.eq("episode_id", episodeId);
    await query;
    return null;
  }

  const { error } = await supabase.from("ratings").upsert(
    { profile_id: profile.id, title_id: titleId, episode_id: episodeId, rating, updated_at: new Date().toISOString() },
    { onConflict: "profile_id,title_id,episode_id" }
  );
  if (error) return null;
  return getRatingCounts(supabase, titleId, episodeId);
}
