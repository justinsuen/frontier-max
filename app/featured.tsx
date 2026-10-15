"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { setInWatchlist } from "./actions";
import type { Title } from "./browse";

export type FeaturedItem = {
  title: Title;
  description: string | null;
  // "Play", or "Resume S1 · E3" when this profile is partway through it.
  playLabel: string;
};

const ADVANCE_MS = 7000;

// The large rotating banner at the top of the home page. It advances on its own,
// but pauses while the pointer or keyboard focus is on it, while the tab is hidden,
// and entirely for people who ask their system for reduced motion.
export default function Featured({
  items,
  savedIds,
  canSave,
  signedIn,
}: {
  items: FeaturedItem[];
  // Titles already in this profile's My List.
  savedIds: number[];
  canSave: boolean;
  signedIn: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % items.length);
      else setCycle((c) => c + 1);
    }, ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [index, paused, cycle, items.length]);

  if (items.length === 0) return null;

  return (
    <section
      className="featured"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      {items.map((item, i) => (
        <Slide
          key={item.title.id}
          item={item}
          active={i === index}
          position={`${i + 1} of ${items.length}`}
          initiallySaved={savedIds.includes(item.title.id)}
          canSave={canSave}
          signedIn={signedIn}
        />
      ))}

      {items.length > 1 && (
        <div className="featured-dots" role="group" aria-label="Choose a featured title">
          {items.map((item, i) => (
            <button
              key={item.title.id}
              className={`featured-dot${i === index ? " is-active" : ""}`}
              aria-label={item.title.name}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            >
              {/* Fills up while the slide is showing, as a countdown to the next one. */}
              {i === index && !paused && <span key={`${index}-${cycle}`} className="featured-dot-fill" />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Slide({
  item,
  active,
  position,
  initiallySaved,
  canSave,
  signedIn,
}: {
  item: FeaturedItem;
  active: boolean;
  position: string;
  initiallySaved: boolean;
  canSave: boolean;
  signedIn: boolean;
}) {
  const { title } = item;
  const meta = [title.type === "series" ? "Series" : "Movie", title.release_year, ...title.genres.slice(0, 2)]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`featured-slide${active ? " is-active" : ""}`}
      aria-roledescription="slide"
      aria-label={`${title.name}, ${position}`}
      aria-hidden={!active}
      inert={!active}
    >
      {title.backdrop_url && <img className="featured-image" src={largeImage(title.backdrop_url)} alt="" />}
      <div className="featured-content">
        {title.logo_url ? (
          <img className="featured-logo" src={title.logo_url} alt={title.name} />
        ) : (
          <h2 className="featured-name">{title.name}</h2>
        )}
        <p className="featured-meta">{meta}</p>
        {item.description && <p className="featured-description">{item.description}</p>}
        <div className="featured-actions">
          <Link href={`/titles/${title.id}`} className="featured-play">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
            {item.playLabel}
          </Link>
          <SaveButton titleId={title.id} initial={initiallySaved} canSave={canSave} signedIn={signedIn} name={title.name} />
        </div>
      </div>
    </article>
  );
}

function SaveButton({
  titleId,
  initial,
  canSave,
  signedIn,
  name,
}: {
  titleId: number;
  initial: boolean;
  canSave: boolean;
  signedIn: boolean;
  name: string;
}) {
  const [saved, setSaved] = useState(initial);
  const [, startTransition] = useTransition();
  const icon = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {saved ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 5v14M5 12h14" />}
    </svg>
  );

  if (!canSave) {
    return (
      <Link
        href={signedIn ? `/profiles?next=/titles/${titleId}` : `/login?next=/titles/${titleId}`}
        className="featured-save"
        aria-label={`Add ${name} to My List`}
      >
        {icon}
      </Link>
    );
  }
  return (
    <button
      className={`featured-save${saved ? " is-saved" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from My List` : `Add ${name} to My List`}
      onClick={() => {
        const next = !saved;
        setSaved(next);
        startTransition(() => setInWatchlist(titleId, next));
      }}
    >
      {icon}
    </button>
  );
}

// TMDB serves several sizes; the banner needs a larger one than the cards.
function largeImage(url: string) {
  return url.replace("image.tmdb.org/t/p/w780/", "image.tmdb.org/t/p/w1280/");
}
