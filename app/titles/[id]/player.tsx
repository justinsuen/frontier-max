"use client";

import { useEffect, useRef } from "react";
import type { VideoSource } from "@/lib/video";

export type PlaybackReport = { position: number; duration: number | null; ended: boolean; paused: boolean };

// The small part of YouTube's IFrame Player API that we use.
type YTPlayer = { getCurrentTime(): number; getDuration(): number; getPlayerState(): number };
type YTNamespace = {
  Player: new (
    el: HTMLIFrameElement,
    opts: { events: { onReady?(e: { target: YTPlayer }): void; onStateChange(e: { data: number }): void } }
  ) => YTPlayer;
};
const YT_PLAYING = 1;
const YT_ENDED = 0;
const YT_PAUSED = 2;

let youtubeApi: Promise<YTNamespace> | null = null;
function loadYouTubeApi(): Promise<YTNamespace> {
  youtubeApi ??= new Promise((resolve) => {
    const w = window as unknown as { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };
    if (w.YT?.Player) return resolve(w.YT);
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(w.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
  return youtubeApi;
}

const POLL_MS = 5000;

export default function Player({
  source,
  label,
  onReport,
  onStart,
  onEnd,
}: {
  source: VideoSource | null;
  label: string;
  // Called every few seconds while playing, and on pause and end. Omit to skip tracking.
  onReport?: (report: PlaybackReport) => void;
  // Called once, when the video actually starts playing.
  onStart?: () => void;
  // Called when the video plays through to the end.
  onEnd?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reportRef = useRef(onReport);
  const startRef = useRef(onStart);
  const endRef = useRef(onEnd);
  useEffect(() => {
    reportRef.current = onReport;
    startRef.current = onStart;
    endRef.current = onEnd;
  });

  // YouTube needs its API attached to save progress and to tell us when playback starts or ends.
  const trackYouTube =
    source?.kind === "embed" && source.provider === "youtube" && Boolean(onReport || onStart || onEnd);
  const src = source?.src;

  useEffect(() => {
    if (!trackYouTube || !iframeRef.current) return;
    const iframe = iframeRef.current;
    let player: YTPlayer | null = null;
    let cancelled = false;
    let startedPlaying = false;
    const started = () => {
      if (startedPlaying) return;
      startedPlaying = true;
      startRef.current?.();
    };

    const send = (ended = false, paused = false) => {
      if (!player) return;
      const duration = player.getDuration() || null;
      reportRef.current?.({ position: ended && duration ? duration : player.getCurrentTime(), duration, ended, paused });
    };

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      player = new YT.Player(iframe, {
        events: {
          // Autoplay may already be under way by the time the API attaches.
          onReady: (e) => {
            if (e.target.getPlayerState() === YT_PLAYING) started();
          },
          onStateChange: (e) => {
            if (e.data === YT_PLAYING) started();
            else if (e.data === YT_ENDED) {
              send(true);
              endRef.current?.();
            }
            else if (e.data === YT_PAUSED) send(false, true);
          },
        },
      });
    });
    const timer = setInterval(() => {
      if (player?.getPlayerState?.() === YT_PLAYING) send();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (player?.getPlayerState?.() === YT_PLAYING) send(false, true);
    };
  }, [trackYouTube, src]);

  if (!source) return <p className="player-empty">No video for this title yet.</p>;

  if (source.kind === "embed") {
    return (
      <iframe
        ref={iframeRef}
        key={source.src}
        src={source.src}
        title={label}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <FilePlayer
      key={source.src}
      src={source.src}
      startAt={source.startAt}
      autoplay={source.autoplay}
      reportRef={reportRef}
      startRef={startRef}
      endRef={endRef}
    />
  );
}

function FilePlayer({
  src,
  startAt,
  autoplay,
  reportRef,
  startRef,
  endRef,
}: {
  src: string;
  startAt: number;
  autoplay: boolean;
  reportRef: React.RefObject<((r: PlaybackReport) => void) | undefined>;
  startRef: React.RefObject<(() => void) | undefined>;
  endRef: React.RefObject<(() => void) | undefined>;
}) {
  const lastSent = useRef(0);
  const send = (v: HTMLVideoElement, ended = false, paused = false) => {
    lastSent.current = Date.now();
    reportRef.current?.({
      position: v.currentTime,
      duration: Number.isFinite(v.duration) ? v.duration : null,
      ended,
      paused,
    });
  };

  return (
    <video
      src={src}
      controls
      playsInline
      autoPlay={autoplay}
      onLoadedMetadata={(e) => {
        if (startAt > 0) e.currentTarget.currentTime = startAt;
      }}
      onTimeUpdate={(e) => {
        if (Date.now() - lastSent.current >= POLL_MS) send(e.currentTarget);
      }}
      onPause={(e) => {
        if (!e.currentTarget.ended) send(e.currentTarget, false, true);
      }}
      onEnded={(e) => {
        send(e.currentTarget, true);
        endRef.current?.();
      }}
      onPlaying={() => startRef.current?.()}
    />
  );
}
