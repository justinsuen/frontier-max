"use client";

import Link from "next/link";
import { useEffect, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import { parseHttpUrl, videoSource, videoThumbnail } from "@/lib/video";
import { RATINGS, RATING_LABELS, type Rating, type RatingCounts, type RatingSummaryRow } from "@/lib/ratings";
import { saveProgress, setInWatchlist, setRating } from "../../actions";
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
  // Wide image without title text, used as the page's background.
  backdrop_url: string | null;
  // Transparent title logo shown over the background; the name in text is the fallback.
  logo_url: string | null;
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
const FULLSCREEN_FALLBACK_MS = 2500;

export default function Watch({
  title,
  progress: initialProgress,
  canTrack,
  signedIn,
  inWatchlist,
  ratingSummary,
  myRatings,
}: {
  title: TitleDetail;
  progress: Progress[];
  // True when a profile is active, so progress and My List can be saved.
  canTrack: boolean;
  signedIn: boolean;
  inWatchlist: boolean;
  ratingSummary: RatingSummaryRow[];
  myRatings: { episode_id: number | null; rating: Rating }[];
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
  // The video plays in a full-screen "theater" over the page, opened by Play,
  // Resume, Restart, Trailer or picking an episode.
  const [started, setStarted] = useState(false);
  // True once the playing video reaches its end, to offer the next episode.
  const [ended, setEnded] = useState(false);
  const lastSaved = useRef<Record<string, number>>({});
  // Totals for items this profile has rated; the server sends no others.
  const [counts, setCounts] = useState<Record<string, RatingCounts>>(() =>
    Object.fromEntries(
      ratingSummary.map(({ episode_id, not_for_me, liked, loved }) => [
        keyOf(episode_id),
        { not_for_me: Number(not_for_me), liked: Number(liked), loved: Number(loved) },
      ])
    )
  );
  const [mine, setMine] = useState<Record<string, Rating>>(() =>
    Object.fromEntries(myRatings.map((r) => [keyOf(r.episode_id), r.rating]))
  );

  const latestVote = useRef<Record<string, number>>({});

  // Clicking the rating you already gave clears it (and hides the totals again).
  function rate(episodeId: number | null, choice: Rating) {
    const key = keyOf(episodeId);
    const previous = mine[key];
    const next = previous === choice ? null : choice;
    setMine((m) => {
      const copy = { ...m };
      if (next) copy[key] = next;
      else delete copy[key];
      return copy;
    });
    // Changing a vote we already have totals for can update them right away.
    if (previous && next) {
      setCounts((c) => {
        if (!c[key]) return c;
        const updated = { ...c[key] };
        updated[previous] = Math.max(0, updated[previous] - 1);
        updated[next] += 1;
        return { ...c, [key]: updated };
      });
    }
    // The server's totals are the real ones; ignore replies to superseded clicks.
    const vote = (latestVote.current[key] ?? 0) + 1;
    latestVote.current[key] = vote;
    setRating(title.id, episodeId, next)
      .then((fresh) => {
        if (fresh && latestVote.current[key] === vote) setCounts((c) => ({ ...c, [key]: fresh }));
      })
      .catch(() => {});
  }

  const source = videoSource(current ? current.video_url : title.video_url, selection.resumeAt, started);
  // The episode after the current one that can be played here.
  const playable = episodes.filter((e) => videoSource(e.video_url));
  const nextEpisode = current ? playable[playable.findIndex((e) => e.id === current.id) + 1] : undefined;
  const nextThumb = nextEpisode && parseHttpUrl(nextEpisode.thumbnail_url ?? videoThumbnail(nextEpisode.video_url));

  const playingTrailer = selection.key === "main" && title.type === "series";
  const nowPlaying = current
    ? episodeLabel(current)
    : title.type === "series" && title.video_url
      ? "Trailer"
      : null;

  // True while the theater is fullscreen because we asked for it.
  const wentFullscreen = useRef(false);
  // Movies and episodes go fullscreen once the video starts. Asking in the click itself
  // would use up the click, and Chrome then blocks the video from starting with sound.
  // A browser still allows fullscreen for a few seconds after a click, so it's requested
  // when playback begins, or after FULLSCREEN_FALLBACK_MS if the video is slow to start.
  const fullscreenPending = useRef(false);
  const fullscreenTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function requestPendingFullscreen() {
    clearTimeout(fullscreenTimer.current);
    if (!fullscreenPending.current) return;
    fullscreenPending.current = false;
    enterFullscreen().then((ok) => (wentFullscreen.current = ok));
  }

  // `from` overrides the saved position (Restart passes 0). A series' trailer opens in
  // the theater without fullscreen.
  function play(key: string, from?: number) {
    setSelection({ key, resumeAt: from ?? resumePoint(progress[key]) });
    setStarted(true);
    setEnded(false);
    const trailer = key === "main" && title.type === "series";
    // Moving on to the next episode while already fullscreen stays fullscreen.
    fullscreenPending.current = !trailer && !fullscreenElement();
    clearTimeout(fullscreenTimer.current);
    if (fullscreenPending.current) {
      fullscreenTimer.current = setTimeout(requestPendingFullscreen, FULLSCREEN_FALLBACK_MS);
    }
  }

  function playNext() {
    if (!nextEpisode) return;
    setSeason(nextEpisode.season_number);
    play(keyOf(nextEpisode.id), 0);
  }

  function closePlayer() {
    fullscreenPending.current = false;
    clearTimeout(fullscreenTimer.current);
    setStarted(false);
    setEnded(false);
    if (wentFullscreen.current) {
      wentFullscreen.current = false;
      exitFullscreen();
    }
  }

  // Esc closes the theater, leaving fullscreen closes it too, and the page behind it
  // doesn't scroll while it's open.
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePlayer();
    };
    const onFullscreenChange = () => {
      if (!fullscreenElement() && wentFullscreen.current) {
        wentFullscreen.current = false;
        setStarted(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.body.style.overflow = overflow;
    };
    // closePlayer only touches state setters and a ref, so it needn't be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  const resumeFrom = resumePoint(progress[selection.key]);
  const episodeTag = current ? episodeShortLabel(current) : null;
  const primaryLabel =
    resumeFrom > 0
      ? `Resume${episodeTag ? ` ${episodeTag}` : ""}`
      : episodeTag
        ? `Play ${episodeTag}`
        : selection.key === "main" && title.type === "series"
          ? "Play trailer"
          : "Play";
  const seasonsCount = seasons.length;
  const meta = [
    title.type === "series" ? "Series" : "Movie",
    title.release_year,
    title.type === "series" && seasonsCount ? `${seasonsCount} ${seasonsCount === 1 ? "season" : "seasons"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const signInHref = signedIn ? `/profiles?next=/titles/${title.id}` : `/login?next=/titles/${title.id}`;

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
      <section className="title-hero">
        {title.backdrop_url && (
          <img className="title-hero-bg" src={largeImage(title.backdrop_url)} alt="" />
        )}
        <div className="title-hero-content">
          {title.logo_url ? (
            <>
              <img className="title-hero-logo" src={title.logo_url} alt="" />
              <h1 className="sr-only">{title.name}</h1>
            </>
          ) : (
            <h1 className="title-hero-name">{title.name}</h1>
          )}
          <p className="title-hero-meta">{meta}</p>

          {source ? (
            <div className="hero-buttons">
              <button className="hero-play" onClick={() => play(selection.key)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 4.5v15l13-7.5z" />
                </svg>
                {primaryLabel}
              </button>
              {resumeFrom > 0 && (
                <button className="hero-restart" onClick={() => play(selection.key, 0)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5" />
                  </svg>
                  Restart
                </button>
              )}
            </div>
          ) : (
            <p className="status">No video for this title yet.</p>
          )}

          <div className="hero-icons">
            <WatchlistButton titleId={title.id} initial={inWatchlist} canSave={canTrack} signedIn={signedIn} />
            <RatePopover>
              <RatingPanel
                heading={title.type === "series" ? "Rate the series" : "Rate this movie"}
                mine={mine.main}
                counts={counts.main}
                onRate={canTrack ? (r) => rate(null, r) : undefined}
                signInHref={signInHref}
              />
              {current && (
                <RatingPanel
                  heading={`Rate ${episodeLabel(current)}`}
                  mine={mine[keyOf(current.id)]}
                  counts={counts[keyOf(current.id)]}
                  onRate={canTrack ? (r) => rate(current.id, r) : undefined}
                  signInHref={signInHref}
                />
              )}
            </RatePopover>
            {title.type === "series" && title.video_url && (
              <button className="icon-action" onClick={() => play("main")}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.5 9.5h17v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1zM3.5 9.5l2.7-5 14 0-2.7 5M9.5 4.5l-2.7 5M15 4.5l-2.7 5" />
                </svg>
                <span>Trailer</span>
              </button>
            )}
          </div>

          {current && (
            <p className="hero-episode">
              {episodeTag}
              {episodeTitle(current) ? `: ${episodeTitle(current)}` : ""}
            </p>
          )}
          {(current?.description ?? title.description) && (
            <p className="hero-description">{current?.description ?? title.description}</p>
          )}
          {title.genres.length > 0 && <p className="hero-genres">{title.genres.join("  ·  ")}</p>}
        </div>
      </section>

      {started && source && (
        <div className="theater" role="dialog" aria-modal="true" aria-label={`${title.name}${nowPlaying ? `: ${nowPlaying}` : ""}`}>
          <button className="theater-close" onClick={closePlayer} aria-label="Close player" autoFocus>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="theater-frame player">
            <Player
              source={source}
              label={nowPlaying ? `${title.name}: ${nowPlaying}` : title.name}
              onReport={canTrack ? onReport : undefined}
              onStart={requestPendingFullscreen}
              onEnd={() => setEnded(true)}
            />
            {/* The end card: rate what just finished (not a trailer), then go on to the next episode. */}
            {ended && !playingTrailer && (
              <div className="up-next">
                <div className="up-next-inner">
                  {nextEpisode ? (
                    <div className="up-next-card">
                      {nextThumb && <img className="up-next-thumb" src={nextThumb.toString()} alt="" />}
                      <div className="up-next-text">
                        <p className="up-next-kicker">Up next</p>
                        <p className="up-next-name">{episodeLabel(nextEpisode)}</p>
                        <div className="up-next-buttons">
                          <button className="hero-play" onClick={playNext} autoFocus>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M7 4.5v15l13-7.5z" />
                            </svg>
                            Next episode
                          </button>
                          <button className="hero-restart" onClick={closePlayer}>
                            Back to episodes
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="up-next-text">
                      <p className="up-next-kicker">{current ? "That's the last episode" : "The end"}</p>
                      <p className="up-next-name">{current ? episodeLabel(current) : title.name}</p>
                      <div className="up-next-buttons">
                        <button className="hero-restart" onClick={closePlayer} autoFocus>
                          {current ? "Back to episodes" : "Close"}
                        </button>
                      </div>
                    </div>
                  )}
                  <RatingPanel
                    heading={current ? "Rate this episode" : "Rate this movie"}
                    mine={mine[selection.key]}
                    onRate={canTrack ? (r) => rate(current?.id ?? null, r) : undefined}
                    signInHref={signInHref}
                    hideTotals
                  />
                </div>
              </div>
            )}
          </div>
          <p className="theater-label">
            {title.name}
            {nowPlaying ? ` · ${nowPlaying}` : ""}
          </p>
        </div>
      )}

      {title.type === "series" && (
        <main className="title-main">
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

            {/* The trailer isn't listed here; it has its own button by Rate. */}
            <ol className="episode-list">
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
        </main>
      )}
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
  const icon = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {optimistic ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 5v14M5 12h14" />}
    </svg>
  );

  if (!canSave) {
    return (
      <Link href={signedIn ? `/profiles?next=/titles/${titleId}` : `/login?next=/titles/${titleId}`} className="icon-action">
        {icon}
        <span>My List</span>
      </Link>
    );
  }

  return (
    <button
      className={`icon-action${optimistic ? " is-on" : ""}`}
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
      {icon}
      <span>{optimistic ? "In My List" : "My List"}</span>
    </button>
  );
}

// "Rate" opens a small panel with the rating buttons; clicking elsewhere closes it.
function RatePopover({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  return (
    <div className="rate-popover-wrap" ref={box}>
      <button className={`icon-action${open ? " is-on" : ""}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        <span>Rate</span>
      </button>
      {open && <div className="rate-popover">{children}</div>}
    </div>
  );
}

const RATING_ICONS: Record<Rating, ReactNode> = {
  not_for_me: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.7a2 2 0 0 0-2 1.7l-1.4 9a2 2 0 0 0 2 2.3H10zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
    </svg>
  ),
  liked: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  loved: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ),
};

// Shown best-first in totals.
const TALLY_ORDER: Rating[] = ["loved", "liked", "not_for_me"];
const TALLY_WORDS: Record<Rating, string> = { loved: "loved it", liked: "liked it", not_for_me: "not for them" };

function RatingPanel({
  heading,
  mine,
  counts,
  onRate,
  signInHref,
  hideTotals = false,
}: {
  heading: string;
  mine?: Rating;
  // Only known once this profile has rated; totals stay hidden until then.
  counts?: RatingCounts;
  // Missing when no profile is active; the buttons then lead to sign-in.
  onRate?: (rating: Rating) => void;
  signInHref: string;
  // The end card asks for a rating without showing how others rated it.
  hideTotals?: boolean;
}) {
  return (
    <section className="rating-panel" aria-label={heading}>
      <h2 className="rating-heading">{heading}</h2>
      <div className="rating-buttons">
        {RATINGS.map((r) =>
          onRate ? (
            <button
              key={r}
              className={`rating-button${mine === r ? " is-selected" : ""}`}
              aria-pressed={mine === r}
              onClick={() => onRate(r)}
            >
              {RATING_ICONS[r]}
              {RATING_LABELS[r]}
            </button>
          ) : (
            <Link key={r} href={signInHref} className="rating-button">
              {RATING_ICONS[r]}
              {RATING_LABELS[r]}
            </Link>
          )
        )}
      </div>
      {hideTotals ? (
        !onRate && <p className="rating-totals">Sign in to rate.</p>
      ) : !mine ? (
        <p className="rating-totals">
          {onRate ? "Rate it to see how others rated it." : "Sign in to rate and see how others rated it."}
        </p>
      ) : !counts ? (
        <p className="rating-totals">Counting votes…</p>
      ) : (
        <div className="rating-summary">
          <span className="rating-bar" aria-hidden="true">
            {TALLY_ORDER.map((r) =>
              counts[r] > 0 ? <span key={r} data-rating={r} style={{ flexGrow: counts[r] }} /> : null
            )}
          </span>
          <p className="rating-totals">
            {TALLY_ORDER.filter((r) => counts[r] > 0)
              .map((r) => `${counts[r]} ${TALLY_WORDS[r]}`)
              .join(" · ")}
          </p>
        </div>
      )}
    </section>
  );
}

// TMDB serves several sizes; the background needs a large one.
function largeImage(url: string) {
  return url.replace(/\/t\/p\/w\d+\//, "/t/p/w1280/");
}

// An episode's own title, without an "Episodes 1 & 2: " prefix.
function episodeTitle(e: Episode) {
  return e.name?.replace(/^Episodes? \d+( & \d+)?:\s*/, "") || null;
}

// "S1 E2", or "S1 E1–2" style labels already in the name ("Episodes 1 & 2: …").
function episodeShortLabel(e: Episode) {
  const pair = e.name?.match(/^Episodes (\d+) & (\d+)/);
  return pair ? `S${e.season_number} E${pair[1]}–${pair[2]}` : `S${e.season_number} E${e.episode_number}`;
}

// Fullscreen helpers, including Safari's prefixed versions. Fullscreen covers the
// whole page, so the theater (already covering the window) fills the screen.
type FullscreenDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
type FullscreenEl = HTMLElement & { webkitRequestFullscreen?: () => void };

function fullscreenElement() {
  const d = document as FullscreenDoc;
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

async function enterFullscreen(): Promise<boolean> {
  const el = document.documentElement as FullscreenEl;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else return false; // e.g. iPhone Safari: the theater still fills the window
    return Boolean(fullscreenElement());
  } catch {
    return false;
  }
}

function exitFullscreen() {
  const d = document as FullscreenDoc;
  if (!fullscreenElement()) return;
  if (d.exitFullscreen) d.exitFullscreen().catch(() => {});
  else d.webkitExitFullscreen?.();
}
