"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Artwork } from "./components/title-card";
import Featured, { type FeaturedItem } from "./featured";

export type Title = {
  id: number;
  type: "movie" | "series";
  name: string;
  release_year: number | null;
  poster_url: string | null;
  // Wide 16:9 image used for the cards; the poster is the fallback.
  backdrop_url: string | null;
  // Transparent title logo laid over the backdrop; the name in text is the fallback.
  logo_url: string | null;
  genres: string[];
  // Series only: how many seasons are listed.
  seasons?: number;
};

export type Collection = { slug: string; name: string; description: string | null; titles: Title[] };

export type ContinueItem = { title: Title; label: string | null; percent: number };

export default function Browse({
  titles,
  message,
  collections = [],
  featured = [],
  continueWatching = [],
  myList,
  profileName,
  signedIn = false,
}: {
  titles: Title[];
  message?: string;
  collections?: Collection[];
  featured?: FeaturedItem[];
  continueWatching?: ContinueItem[];
  // This profile's saved titles (for the banner's + button); undefined when signed out.
  myList?: Title[];
  profileName?: string;
  signedIn?: boolean;
}) {
  const status = message ?? (titles.length === 0 ? "No titles yet. Add some in Supabase's Table Editor." : null);
  const continueRow =
    continueWatching.length > 0 ? (
      <Row heading="Continue watching">
        {continueWatching.map((item) => (
          <li key={item.title.id} className="row-item">
            <Link href={`/titles/${item.title.id}`} className="card-link">
              <Artwork title={item.title} />
              <span className="progress-bar" aria-hidden="true">
                <span style={{ width: `${Math.max(item.percent, 3)}%` }} />
              </span>
              <span className="row-title">{item.title.name}</span>
              {item.label && <span className="row-label">{item.label}</span>}
            </Link>
          </li>
        ))}
      </Row>
    ) : null;

  return (
    <>
      {featured.length > 0 ? (
        <>
          <h1 className="sr-only">Frontier Max</h1>
          <Featured
            items={featured}
            savedIds={(myList ?? []).map((t) => t.id)}
            canSave={myList !== undefined}
            signedIn={signedIn}
          />
        </>
      ) : (
        <section className="hero">
          <div className="topbar-spacer" />
          <p className="eyebrow">
            {profileName
              ? `Welcome back, ${profileName}`
              : `${titles.length} ${titles.length === 1 ? "title" : "titles"} in the catalog`}
          </p>
          <h1 className="page-title">Find something worth watching.</h1>
        </section>
      )}

      <main>
        {status && <p className="status">{status}</p>}
        {collections.map((c, i) => (
          <Fragment key={c.slug}>
            <Row heading={c.name} description={c.description} id={c.slug}>
              {c.titles.map((title) => (
                <RowTitle key={title.id} title={title} />
              ))}
            </Row>
            {/* Continue watching sits after the first section. */}
            {i === 0 && continueRow}
          </Fragment>
        ))}
        {collections.length === 0 && continueRow}
        <p className="browse-more">
          Looking for something else? <Link href="/search">Browse all titles</Link>
        </p>
      </main>
    </>
  );
}

// A horizontal row of tiles. Arrow buttons page through it; touch screens can also swipe.
function Row({
  heading,
  description,
  id,
  children,
}: {
  heading: string;
  description?: string | null;
  id?: string;
  children: ReactNode;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      setCanBack(el.scrollLeft > 4);
      setCanForward(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  // Moves by most of a screen so the last visible tile stays in view for context.
  const page = (direction: 1 | -1) => {
    const el = scroller.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="row" id={id} aria-label={heading}>
      <div className="row-head">
        <h2 className="row-heading">{heading}</h2>
        {description && <p className="row-description">{description}</p>}
      </div>
      <div className="row-track">
        <ul className="row-scroller" ref={scroller}>
          {children}
        </ul>
        {canBack && (
          <button className="row-arrow is-back" onClick={() => page(-1)} aria-label={`Previous ${heading}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        {canForward && (
          <button className="row-arrow is-forward" onClick={() => page(1)} aria-label={`More ${heading}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}

function RowTitle({ title }: { title: Title }) {
  return (
    <li className="row-item">
      <Link href={`/titles/${title.id}`} className="card-link">
        <Artwork title={title} />
        <span className="row-title">{title.name}</span>
      </Link>
    </li>
  );
}
