"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type Title = {
  id: number;
  type: "movie" | "series";
  name: string;
  release_year: number | null;
  poster_url: string | null;
  genres: string[];
};

type TypeFilter = "all" | Title["type"];

const TABS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "series", label: "Series" },
];

export default function Browse({ titles, message }: { titles: Title[]; message?: string }) {
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
        <input
          className="search"
          type="search"
          placeholder="Search titles"
          aria-label="Search titles"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <section className="hero">
        <p className="eyebrow">{titles.length} {titles.length === 1 ? "title" : "titles"} in the catalog</p>
        <h1 className="page-title">Find something worth watching.</h1>
      </section>

      <main>
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
        {isHttpUrl(title.poster_url) ? (
          // Posters come from arbitrary hosts typed into the catalog, so skip next/image's domain allowlist.
          <img className="poster" src={title.poster_url} alt="" loading="lazy" />
        ) : (
          <div className="poster">{title.name.charAt(0).toUpperCase()}</div>
        )}
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

function isHttpUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
