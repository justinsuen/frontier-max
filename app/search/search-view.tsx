"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { Title } from "../browse";
import { TitleCard } from "../components/title-card";

type TypeFilter = "all" | Title["type"];

const TABS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "series", label: "Series" },
];

// The search page: a search bar that filters as you type, the format and genre
// filters, and every title. The query is kept in the URL (?q=) so results can be
// shared or bookmarked, without reloading the page on each keystroke.
export default function SearchView({ titles }: { titles: Title[] }) {
  // ?q= gives the starting value; after that the input is the source of truth.
  const initialQuery = useSearchParams().get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<TypeFilter>("all");
  const [genre, setGenre] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const genres = useMemo(() => [...new Set(titles.flatMap((t) => t.genres))].sort(), [titles]);

  const q = query.trim().toLowerCase();
  const visible = titles.filter(
    (t) =>
      (type === "all" || t.type === type) &&
      (!genre || t.genres.includes(genre)) &&
      (!q || t.name.toLowerCase().includes(q))
  );

  function change(value: string) {
    setQuery(value);
    const trimmed = value.trim();
    window.history.replaceState(null, "", trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  const filtered = q !== "" || type !== "all" || genre !== null;
  const status =
    titles.length === 0
      ? "No titles yet. Add some in Supabase's Table Editor."
      : visible.length === 0
        ? q
          ? `Nothing matches “${query.trim()}”${type !== "all" || genre ? " with those filters" : ""}.`
          : "Nothing matches those filters."
        : null;

  return (
    <main className="search-main">
      <h1 className="sr-only">Search</h1>
      <form role="search" className="search-bar" onSubmit={(e) => e.preventDefault()}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        </svg>
        <input
          ref={input}
          type="search"
          placeholder="Search movies and series"
          aria-label="Search movies and series"
          value={query}
          autoFocus
          onChange={(e) => change(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") change("");
          }}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => {
              change("");
              input.current?.focus();
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </form>

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

      <h2 className="search-heading" aria-live="polite">
        {filtered ? `${visible.length} ${visible.length === 1 ? "result" : "results"}` : "All titles"}
      </h2>
      {status && <p className="status">{status}</p>}

      <ul className="grid">
        {visible.map((title) => (
          <TitleCard key={title.id} title={title} />
        ))}
      </ul>
    </main>
  );
}

