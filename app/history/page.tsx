import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/account";
import AccountNav from "../components/account-nav";

export const metadata: Metadata = { title: "Watch history · Frontier Max" };

type HistoryRow = {
  id: number;
  position_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  updated_at: string;
  titles: { id: number; name: string; poster_url: string | null } | null;
  episodes: { season_number: number; episode_number: number; name: string | null } | null;
};

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function HistoryPage() {
  const { supabase, user, profile } = await getAccount();
  if (!user) redirect("/login?next=/history");
  if (!profile) redirect("/profiles?next=/history");

  const { data } = await supabase
    .from("watch_progress")
    .select(
      "id, position_seconds, duration_seconds, completed, updated_at, " +
        "titles(id, name, poster_url), episodes(season_number, episode_number, name)"
    )
    .eq("profile_id", profile.id)
    .order("updated_at", { ascending: false })
    .limit(100)
    .returns<HistoryRow[]>();
  const rows = (data ?? []).filter((r) => r.titles);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="logo">
          Frontier <span>Max</span>
        </Link>
        <nav className="header-nav">
          <Link href="/" className="back-link">
            ← Browse
          </Link>
          <AccountNav />
        </nav>
      </header>
      <main className="history-main">
        <p className="eyebrow">{profile.name}</p>
        <h1 className="title-name">Watch history</h1>
        {rows.length === 0 ? (
          <p className="status">Nothing watched yet. Anything you play will show up here.</p>
        ) : (
          <ol className="history-list">
            {rows.map((r) => {
              const ep = r.episodes;
              const pct = r.completed
                ? 100
                : r.duration_seconds
                  ? Math.round((r.position_seconds / r.duration_seconds) * 100)
                  : null;
              return (
                <li key={r.id}>
                  <Link href={`/titles/${r.titles!.id}`} className="history-item">
                    <span className="history-name">{r.titles!.name}</span>
                    {ep && (
                      <span className="history-episode">
                        S{ep.season_number} · E{ep.episode_number}
                        {ep.name ? ` · ${ep.name}` : ""}
                      </span>
                    )}
                    <span className="history-meta">
                      {dateFormat.format(new Date(r.updated_at))}
                      {" · "}
                      {r.completed ? "Watched" : pct !== null ? `${pct}% watched` : "Started"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </>
  );
}
