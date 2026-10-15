import type { Metadata } from "next";
import { Suspense } from "react";
import { requireProfileIfSignedIn } from "@/lib/account";
import { seasonCount } from "@/lib/catalog";
import type { Title } from "../browse";
import SiteHeader from "../components/site-header";
import SearchView from "./search-view";

export const metadata: Metadata = { title: "Search · Frontier Max" };
export const dynamic = "force-dynamic";

type TitleRow = Omit<Title, "genres" | "seasons"> & {
  genres: { name: string }[] | null;
  episodes: { season_number: number }[] | null;
};

export default async function SearchPage() {
  const { supabase } = await requireProfileIfSignedIn("/search");
  const { data } = await supabase
    .from("titles")
    .select("id, type, name, release_year, poster_url, backdrop_url, logo_url, genres(name), episodes(season_number)")
    .order("name")
    .returns<TitleRow[]>();
  const titles: Title[] = (data ?? []).map(({ episodes, ...t }) => ({
    ...t,
    genres: (t.genres ?? []).map((g) => g.name),
    seasons: seasonCount(episodes),
  }));

  return (
    <>
      <SiteHeader />
      <div className="topbar-spacer" />
      <Suspense>
        <SearchView titles={titles} />
      </Suspense>
    </>
  );
}
