// Turns a catalog video link into something the player can show.
export type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string };

export function videoSource(url: string | null): VideoSource | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const host = u.hostname.replace(/^www\.|^m\./, "");
  const youtubeId =
    host === "youtu.be"
      ? u.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
        : undefined;
  if (youtubeId && /^[\w-]{11}$/.test(youtubeId)) {
    const start = parseInt(u.searchParams.get("t") ?? u.searchParams.get("start") ?? "", 10);
    const params = new URLSearchParams({ rel: "0", ...(start > 0 ? { start: String(start) } : {}) });
    return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${youtubeId}?${params}` };
  }

  const vimeoId = host === "vimeo.com" ? u.pathname.match(/^\/(\d+)/)?.[1] : undefined;
  if (vimeoId) return { kind: "embed", src: `https://player.vimeo.com/video/${vimeoId}` };

  // Anything else is treated as a direct video file (e.g. .mp4 in Supabase Storage).
  return { kind: "file", src: u.toString() };
}
