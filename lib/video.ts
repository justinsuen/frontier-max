// Turns a catalog video link into something the player can show.
// "youtube" embeds can report playback position through YouTube's player API; Vimeo embeds can't (yet).
export type VideoSource =
  | { kind: "embed"; provider: "youtube" | "vimeo"; src: string }
  | { kind: "file"; src: string; startAt: number; autoplay: boolean };

export function parseHttpUrl(url: string | null): URL | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u : null;
  } catch {
    return null;
  }
}

function youtubeId(u: URL): string | null {
  const host = u.hostname.replace(/^www\.|^m\./, "");
  const id =
    host === "youtu.be"
      ? u.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
        : undefined;
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

// YouTube serves a thumbnail for every video, so YouTube episodes need no image of their own.
export function videoThumbnail(url: string | null): string | null {
  const u = parseHttpUrl(url);
  const id = u && youtubeId(u);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

// `resumeAt` (seconds) overrides any start time in the link, to continue where a viewer left off.
// `autoplay` starts playback as soon as the player loads (used after the viewer presses play).
export function videoSource(url: string | null, resumeAt = 0, autoplay = false): VideoSource | null {
  const u = parseHttpUrl(url);
  if (!u) return null;
  const linkStart = parseInt(u.searchParams.get("t") ?? u.searchParams.get("start") ?? "", 10) || 0;
  const start = Math.floor(resumeAt > 0 ? resumeAt : linkStart);

  const ytId = youtubeId(u);
  if (ytId) {
    const params = new URLSearchParams({
      rel: "0",
      enablejsapi: "1",
      ...(start > 0 ? { start: String(start) } : {}),
      ...(autoplay ? { autoplay: "1" } : {}),
    });
    return { kind: "embed", provider: "youtube", src: `https://www.youtube-nocookie.com/embed/${ytId}?${params}` };
  }

  const vimeoId = u.hostname.replace(/^www\./, "") === "vimeo.com" ? u.pathname.match(/^\/(\d+)/)?.[1] : undefined;
  if (vimeoId) {
    return {
      kind: "embed",
      provider: "vimeo",
      src: `https://player.vimeo.com/video/${vimeoId}${autoplay ? "?autoplay=1" : ""}${start > 0 ? `#t=${start}s` : ""}`,
    };
  }

  // Anything else is treated as a direct video file (e.g. .mp4 in Supabase Storage).
  return { kind: "file", src: u.toString(), startAt: start, autoplay };
}
