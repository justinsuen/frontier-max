"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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
};

export type Collection = { slug: string; name: string; description: string | null; titles: Title[] };

export type ContinueItem = { title: Title; label: string | null; percent: number };

type TypeFilter = "all" | Title["type"];

const TABS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "series", label: "Series" },
];

export default function Browse({
  titles,
  message,
  collections = [],
  continueWatching = [],
  myList,
  profileName,
  accountNav,
}: {
  titles: Title[];
  message?: string;
  collections?: Collection[];
  continueWatching?: ContinueItem[];
  // Undefined when no profile is active (signed out), so the row isn't offered.
  myList?: Title[];
  profileName?: string;
  accountNav: ReactNode;
}) {
  const [type, setType] = useState<TypeFilter>("all");
  const [genre, setGenre] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const genres = useMemo(() => [...new Set(titles.flatMap((t) => t.genres))].sort(), [titles]);

  const q = query.trim().toLowerCase();
  const visible = titles.filter(
    (t) =>
      (type === "all" || t.type === type) &&
      (!genre || t.genres.includes(genre)) &&
      (!q || t.name.toLowerCase().includes(q))
  );

  const status =
    message ??
    (titles.length === 0
      ? "No titles yet. Add some in Supabase's Table Editor."
      : visible.length === 0
        ? "Nothing matches those filters."
        : null);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="logo">
          Frontier <span>Max</span>
        </Link>
        <div className="header-nav">
          <input
            className="search"
            type="search"
            placeholder="Search titles"
            aria-label="Search titles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {accountNav}
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">
          {profileName
            ? `Welcome back, ${profileName}`
            : `${titles.length} ${titles.length === 1 ? "title" : "titles"} in the catalog`}
        </p>
        <h1 className="page-title">Find something worth watching.</h1>
      </section>

      <main>
        {!q && continueWatching.length > 0 && (
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
        )}

        {!q && myList && (
          <Row heading="My List" id="my-list">
            {myList.length === 0 ? (
              <li className="row-empty">Use “+ My List” on any title to save it here.</li>
            ) : (
              myList.map((title) => <RowTitle key={title.id} title={title} />)
            )}
          </Row>
        )}

        {!q &&
          collections.map((c) => (
            <Row key={c.slug} heading={c.name} description={c.description} id={c.slug}>
              {c.titles.map((title) => (
                <RowTitle key={title.id} title={title} />
              ))}
            </Row>
          ))}

        {!q && collections.length > 0 && (
          <h2 className="section-heading" id="all-titles">
            All titles
          </h2>
        )}
        <nav className="filters" aria-label="Filters">
          <div className="tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                className={`tab${type === tab.value ? " is-active" : ""}`}
                role="tab"
                aria-selected={type === tab.value}
                onClick={() => setType(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="genres">
            {genres.map((name) => (
              <button
                key={name}
                className={`chip${genre === name ? " is-active" : ""}`}
                aria-pressed={genre === name}
                onClick={() => setGenre(genre === name ? null : name)}
              >
                {name}
              </button>
            ))}
          </div>
        </nav>

        {status && <p className="status">{status}</p>}

        <ul className="grid">
          {visible.map((title) => (
            <TitleCard key={title.id} title={title} />
          ))}
        </ul>
      </main>
    </>
  );
}

function TitleCard({ title }: { title: Title }) {
  return (
    <li className="card">
      <Link href={`/titles/${title.id}`} className="card-link">
        <Artwork title={title} />
        <div className="card-body">
          <h2 className="card-title">{title.name}</h2>
          <p className="card-meta">
            <span className={`badge badge-${title.type}`}>{title.type === "series" ? "Series" : "Movie"}</span>
            {title.release_year}
          </p>
        </div>
      </Link>
    </li>
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

// Landscape artwork for cards: the backdrop with the title logo over a dark fade.
// Without a backdrop, the poster is shown whole on a navy tile. The title is also
// written under every card, since some logos are hard to read at this size.
// Images come from arbitrary hosts typed into the catalog, so skip next/image's domain allowlist.
function Artwork({ title }: { title: Title }) {
  if (!isHttpUrl(title.backdrop_url) && isHttpUrl(title.poster_url)) {
    return (
      <span className="tile tile-poster">
        <img src={title.poster_url} alt="" loading="lazy" />
      </span>
    );
  }
  return (
    <span className="tile">
      {isHttpUrl(title.backdrop_url) && <img className="tile-image" src={title.backdrop_url} alt="" loading="lazy" />}
      {isHttpUrl(title.logo_url) && (
        <span className="tile-overlay">
          <img className="tile-logo" src={title.logo_url} alt="" loading="lazy" />
        </span>
      )}
    </span>
  );
}

function isHttpUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
