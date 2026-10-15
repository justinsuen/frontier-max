// Turns a catalog video link into something the player can show.
export type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string };

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

export function videoSource(url: string | null): VideoSource | null {
  const u = parseHttpUrl(url);
  if (!u) return null;

  const ytId = youtubeId(u);
  if (ytId) {
    const start = parseInt(u.searchParams.get("t") ?? u.searchParams.get("start") ?? "", 10);
    const params = new URLSearchParams({ rel: "0", ...(start > 0 ? { start: String(start) } : {}) });
    return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${ytId}?${params}` };
  }

  const vimeoId = u.hostname.replace(/^www\./, "") === "vimeo.com" ? u.pathname.match(/^\/(\d+)/)?.[1] : undefined;
  if (vimeoId) return { kind: "embed", src: `https://player.vimeo.com/video/${vimeoId}` };

  // Anything else is treated as a direct video file (e.g. .mp4 in Supabase Storage).
  return { kind: "file", src: u.toString() };
}
