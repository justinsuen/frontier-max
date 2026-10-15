"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { videoSource } from "@/lib/video";

export type Episode = {
  id: number;
  season_number: number;
  episode_number: number;
  name: string | null;
  video_url: string;
};

export type TitleDetail = {
  id: number;
  type: "movie" | "series";
  name: string;
  description: string | null;
  release_year: number | null;
  poster_url: string | null;
  video_url: string | null;
  genres: string[];
  episodes: Episode[];
};

// What the player is showing: the title's own video (a movie, or a series trailer) or one episode.
type Selection = { kind: "main" } | { kind: "episode"; id: number };

export default function Watch({ title }: { title: TitleDetail }) {
  const { episodes } = title;
  const seasons = [...new Set(episodes.map((e) => e.season_number))];

  const [selection, setSelection] = useState<Selection>(
    episodes.length > 0 ? { kind: "episode", id: episodes[0].id } : { kind: "main" }
  );
  const [season, setSeason] = useState(seasons[0] ?? 1);
  const playerRef = useRef<HTMLDivElement>(null);

  const current = selection.kind === "episode" ? episodes.find((e) => e.id === selection.id) : undefined;
  const source = videoSource(current ? current.video_url : title.video_url);
  const nowPlaying = current
    ? episodeLabel(current)
    : title.type === "series" && title.video_url
      ? "Trailer"
      : null;

  function play(next: Selection) {
    setSelection(next);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <header className="site-header">
        <Link href="/" className="logo">
          Frontier <span>Max</span>
        </Link>
        <Link href="/" className="back-link">
          ← Browse
        </Link>
      </header>

      <div className="player-wrap" ref={playerRef}>
        <div className="player">
          {source?.kind === "embed" ? (
            <iframe
              key={source.src}
              src={source.src}
              title={nowPlaying ? `${title.name}: ${nowPlaying}` : title.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : source?.kind === "file" ? (
            <video key={source.src} src={source.src} controls playsInline />
          ) : (
            <p className="player-empty">No video for this title yet.</p>
          )}
        </div>
      </div>

      <main className="title-main">
        <section className="title-info">
          <p className="eyebrow">
            {[title.type === "series" ? "Series" : "Movie", title.release_year, ...title.genres]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <h1 className="title-name">{title.name}</h1>
          {nowPlaying && <p className="now-playing">Now playing: {nowPlaying}</p>}
          {title.description && <p className="title-description">{title.description}</p>}
        </section>

        {title.type === "series" && (
          <section className="episodes" aria-label="Episodes">
            <div className="episodes-head">
              <h2>Episodes</h2>
              {seasons.length > 1 && (
                <div className="tabs" role="tablist">
                  {seasons.map((s) => (
                    <button
                      key={s}
                      className={`tab${season === s ? " is-active" : ""}`}
                      role="tab"
                      aria-selected={season === s}
                      onClick={() => setSeason(s)}
                    >
                      Season {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ol className="episode-list">
              {title.video_url && (
                <EpisodeRow
                  label="Trailer"
                  active={selection.kind === "main"}
                  onPlay={() => play({ kind: "main" })}
                />
              )}
              {episodes
                .filter((e) => e.season_number === season)
                .map((e) => (
                  <EpisodeRow
                    key={e.id}
                    number={e.name?.startsWith("Episode") ? undefined : e.episode_number}
                    label={e.name ?? `Episode ${e.episode_number}`}
                    active={selection.kind === "episode" && selection.id === e.id}
                    onPlay={() => play({ kind: "episode", id: e.id })}
                  />
                ))}
            </ol>
            {episodes.length === 0 && <p className="status">No episodes yet. Add them in Supabase.</p>}
          </section>
        )}
      </main>
    </>
  );
}

function EpisodeRow({
  number,
  label,
  active,
  onPlay,
}: {
  number?: number;
  label: string;
  active: boolean;
  onPlay: () => void;
}) {
  return (
    <li>
      <button className={`episode${active ? " is-active" : ""}`} aria-current={active} onClick={onPlay}>
        <span className="episode-number">{number ?? "▶"}</span>
        <span className="episode-name">{label}</span>
        {active && <span className="episode-state">Playing</span>}
      </button>
    </li>
  );
}

function episodeLabel(e: Episode) {
  // Names like "Episodes 1 & 2: …" already say which episode they are.
  if (e.name?.startsWith("Episode")) return `S${e.season_number} · ${e.name}`;
  return `S${e.season_number} · E${e.episode_number}${e.name ? `: ${e.name}` : ""}`;
}
