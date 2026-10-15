"use client";

import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import { parseHttpUrl, videoSource, videoThumbnail } from "@/lib/video";
import { saveProgress, setInWatchlist } from "../../actions";
import Player, { type PlaybackReport } from "./player";

export type Episode = {
  id: number;
  season_number: number;
  episode_number: number;
  name: string | null;
  description: string | null;
  // Episodes without a video are listed but can't be played here.
  video_url: string | null;
  thumbnail_url: string | null;
  watch_url: string | null;
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

// One saved position for this profile: episode_id is null for the title's own video.
export type Progress = {
  episode_id: number | null;
  position_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  updated_at: string;
};

// What the player is showing ("main" is the title's own video: a movie, or a series trailer),
// and where it started. resumeAt is fixed when chosen so saving progress never reloads the player.
type Selection = { key: string; resumeAt: number };

const keyOf = (episodeId: number | null) => (episodeId === null ? "main" : `e${episodeId}`);
const SAVE_EVERY_MS = 15000;

export default function Watch({
  title,
  progress: initialProgress,
  canTrack,
  signedIn,
  inWatchlist,
  accountNav,
}: {
  title: TitleDetail;
  progress: Progress[];
  // True when a profile is active, so progress and My List can be saved.
  canTrack: boolean;
  signedIn: boolean;
  inWatchlist: boolean;
  accountNav: ReactNode;
}) {
  const { episodes } = title;
  const seasons = [...new Set(episodes.map((e) => e.season_number))];
  const [progress, setProgress] = useState(() =>
    Object.fromEntries(initialProgress.map((p) => [keyOf(p.episode_id), p]))
  );
  const [selection, setSelection] = useState<Selection>(() => initialSelection(title, initialProgress));
  const current = episodes.find((e) => keyOf(e.id) === selection.key);
  const [season, setSeason] = useState(
    current?.season_number ?? episodes.find((e) => videoSource(e.video_url))?.season_number ?? seasons[0] ?? 1
  );
  const playerRef = useRef<HTMLDivElement>(null);
  const lastSaved = useRef<Record<string, number>>({});

  const source = videoSource(current ? current.video_url : title.video_url, selection.resumeAt);
  const nowPlaying = current
    ? episodeLabel(current)
    : title.type === "series" && title.video_url
      ? "Trailer"
      : null;

  function play(key: string) {
    setSelection({ key, resumeAt: resumePoint(progress[key]) });
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onReport({ position, duration, ended, paused }: PlaybackReport) {
    if (position < 1 && !ended) return;
    const key = selection.key;
    const episodeId = current?.id ?? null;
    const completed = ended || Boolean(duration && position / duration >= 0.95);
    setProgress((p) => ({
      ...p,
      [key]: {
        episode_id: episodeId,
        position_seconds: Math.round(position),
        duration_seconds: duration ? Math.round(duration) : null,
        completed,
        updated_at: new Date().toISOString(),
      },
    }));

    const now = Date.now();
    if (!ended && !paused && now - (lastSaved.current[key] ?? 0) < SAVE_EVERY_MS) return;
    lastSaved.current[key] = now;
    saveProgress({ titleId: title.id, episodeId, position, duration, completed }).catch(() => {});
  }

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
          {accountNav}
        </nav>
      </header>

      <div className="player-wrap" ref={playerRef}>
        <div className="player">
          <Player
            source={source}
            label={nowPlaying ? `${title.name}: ${nowPlaying}` : title.name}
            onReport={canTrack ? onReport : undefined}
          />
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
          <WatchlistButton titleId={title.id} initial={inWatchlist} canSave={canTrack} signedIn={signedIn} />
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
                  thumbnail={videoThumbnail(title.video_url)}
                  active={selection.key === "main"}
                  progress={progress.main}
                  onPlay={() => play("main")}
                />
              )}
              {episodes
                .filter((e) => e.season_number === season)
                .map((e) => (
                  <EpisodeRow
                    key={e.id}
                    number={e.name?.startsWith("Episode") ? undefined : e.episode_number}
                    label={e.name ?? `Episode ${e.episode_number}`}
                    description={e.description}
                    thumbnail={e.thumbnail_url ?? videoThumbnail(e.video_url)}
                    active={selection.key === keyOf(e.id)}
                    progress={progress[keyOf(e.id)]}
                    onPlay={videoSource(e.video_url) ? () => play(keyOf(e.id)) : undefined}
                    watchUrl={e.watch_url}
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
  description,
  thumbnail,
  active,
  progress,
  onPlay,
  watchUrl,
}: {
  number?: number;
  label: string;
  description?: string | null;
  thumbnail: string | null;
  active: boolean;
  progress?: Progress;
  // Missing when the episode can't be played here.
  onPlay?: () => void;
  watchUrl?: string | null;
}) {
  const thumb = parseHttpUrl(thumbnail);
  const external = parseHttpUrl(watchUrl ?? null);
  const content = (
    <>
      <span className="episode-thumb">
        {thumb && <img src={thumb.toString()} alt="" loading="lazy" />}
        {onPlay && <span className="episode-play" aria-hidden="true">▶</span>}
        {progress && <ProgressBar progress={progress} />}
      </span>
      <span className="episode-text">
        <span className="episode-name">
          {number !== undefined && <span className="episode-number">{number}</span>}
          {label}
        </span>
        {description && <span className="episode-description">{description}</span>}
        {active ? (
          <span className="episode-state">Playing</span>
        ) : (
          progress?.completed && <span className="episode-state is-muted">Watched</span>
        )}
        {!onPlay &&
          (external ? (
            <a className="episode-external" href={external.toString()} target="_blank" rel="noopener noreferrer">
              Watch on {serviceName(external)} ↗
            </a>
          ) : (
            <span className="episode-state is-muted">Not available here</span>
          ))}
      </span>
    </>
  );

  if (onPlay) {
    return (
      <li>
        <button className={`episode${active ? " is-active" : ""}`} aria-current={active} onClick={onPlay}>
          {content}
        </button>
      </li>
    );
  }
  return (
    <li>
      <div className="episode is-unavailable">{content}</div>
    </li>
  );
}

function serviceName(u: URL) {
  const host = u.hostname.replace(/^www\./, "");
  if (host === "primevideo.com" || host.endsWith("amazon.com")) return "Prime Video";
  if (host.endsWith("thechosen.tv")) return "The Chosen";
  return host;
}

function episodeLabel(e: Episode) {
  // Names like "Episodes 1 & 2: …" already say which episode they are.
  if (e.name?.startsWith("Episode")) return `S${e.season_number} · ${e.name}`;
  return `S${e.season_number} · E${e.episode_number}${e.name ? `: ${e.name}` : ""}`;
}

// Start where this profile left off: its most recent unfinished video, or the
// episode after its most recently finished one.
function initialSelection(title: TitleDetail, progress: Progress[]): Selection {
  const playable = title.episodes.filter((e) => videoSource(e.video_url));
  const canPlay = (episodeId: number | null) =>
    episodeId === null ? Boolean(videoSource(title.video_url)) : playable.some((e) => e.id === episodeId);
  const latest = [...progress]
    .filter((p) => canPlay(p.episode_id))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];

  if (latest && !latest.completed) return { key: keyOf(latest.episode_id), resumeAt: resumePoint(latest) };
  if (latest?.completed && latest.episode_id !== null) {
    const next = playable[playable.findIndex((e) => e.id === latest.episode_id) + 1];
    if (next) {
      const saved = progress.find((p) => p.episode_id === next.id);
      return { key: keyOf(next.id), resumeAt: resumePoint(saved) };
    }
  }
  return playable[0] ? { key: keyOf(playable[0].id), resumeAt: 0 } : { key: "main", resumeAt: 0 };
}

// Back up a few seconds for context; start over if it was finished or barely started.
function resumePoint(p: Progress | undefined) {
  if (!p || p.completed || p.position_seconds < 10) return 0;
  if (p.duration_seconds && p.position_seconds > p.duration_seconds - 15) return 0;
  return Math.max(0, p.position_seconds - 3);
}

function ProgressBar({ progress }: { progress: Progress }) {
  const pct = progress.completed
    ? 100
    : progress.duration_seconds
      ? Math.min(100, (progress.position_seconds / progress.duration_seconds) * 100)
      : 0;
  if (pct <= 0) return null;
  return (
    <span className="progress-bar" aria-hidden="true">
      <span style={{ width: `${pct}%` }} />
    </span>
  );
}

function WatchlistButton({
  titleId,
  initial,
  canSave,
  signedIn,
}: {
  titleId: number;
  initial: boolean;
  canSave: boolean;
  signedIn: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();

  if (!canSave) {
    return (
      <Link
        href={signedIn ? `/profiles?next=/titles/${titleId}` : `/login?next=/titles/${titleId}`}
        className="button-outline watchlist-button"
      >
        + My List
      </Link>
    );
  }

  return (
    <button
      className={`button-outline watchlist-button${optimistic ? " is-saved" : ""}`}
      aria-pressed={optimistic}
      onClick={() =>
        startTransition(async () => {
          const next = !optimistic;
          setOptimistic(next);
          await setInWatchlist(titleId, next);
          setSaved(next);
        })
      }
    >
      {optimistic ? "✓ In My List" : "+ My List"}
    </button>
  );
}
