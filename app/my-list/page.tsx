import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/account";
import { seasonCount } from "@/lib/catalog";
import type { Title } from "../browse";
import SiteHeader from "../components/site-header";
import { TitleCard } from "../components/title-card";

export const metadata: Metadata = { title: "My List · Frontier Max" };

type Row = { titles: (Omit<Title, "genres" | "seasons"> & { episodes: { season_number: number }[] | null }) | null };

export default async function MyListPage() {
  const { supabase, user, profile } = await getAccount();
  if (!user) redirect("/login?next=/my-list");
  if (!profile) redirect("/profiles?next=/my-list");

  const { data } = await supabase
    .from("watchlist")
    .select("titles(id, type, name, release_year, poster_url, backdrop_url, logo_url, episodes(season_number))")
    .eq("profile_id", profile.id)
    .order("added_at", { ascending: false })
    .returns<Row[]>();
  const titles: Title[] = (data ?? []).flatMap((r) => {
    if (!r.titles) return [];
    const { episodes, ...t } = r.titles;
    return [{ ...t, genres: [], seasons: seasonCount(episodes) }];
  });

  return (
    <>
      <SiteHeader />
      <div className="topbar-spacer" />
      <main className="list-main">
        <p className="eyebrow">{profile.name}</p>
        <h1 className="title-name">My List</h1>
        {titles.length === 0 ? (
          <p className="status">
            Nothing saved yet. Use “+ My List” on any title, or the + on the banner, to save it here.{" "}
            <Link href="/">Browse titles</Link>
          </p>
        ) : (
          <ul className="grid">
            {titles.map((title) => (
              <TitleCard key={title.id} title={title} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
