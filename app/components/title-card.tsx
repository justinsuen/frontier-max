import Link from "next/link";
import type { Title } from "../browse";

export function TitleCard({ title }: { title: Title }) {
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

// Landscape artwork for cards: the backdrop with the title logo over a dark fade.
// Without a backdrop, the poster is shown whole on a navy tile. The title is also
// written under every card, since some logos are hard to read at this size.
// Images come from arbitrary hosts typed into the catalog, so skip next/image's domain allowlist.
export function Artwork({ title }: { title: Title }) {
  if (!isHttpUrl(title.backdrop_url) && isHttpUrl(title.poster_url)) {
    return (
      <span className="tile tile-poster">
        <img src={title.poster_url} alt="" loading="lazy" />
        <FormatBadge title={title} />
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
      <FormatBadge title={title} />
    </span>
  );
}

// "MOVIE · 2016" or "SERIES · 5 SEASONS", shown on the tile on hover or keyboard focus
// so people can tell movies from series in the mixed rows without opening them.
function FormatBadge({ title }: { title: Title }) {
  const series = title.type === "series";
  const detail = series && title.seasons
    ? `${title.seasons} ${title.seasons === 1 ? "season" : "seasons"}`
    : title.release_year;
  return (
    <span className={`tile-badge ${series ? "is-series" : "is-movie"}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {series ? (
          <>
            <rect x="3" y="6" width="18" height="12.5" rx="1.5" />
            <path d="M8.5 21.5h7M9 2.5l3 3.5 3-3.5" />
          </>
        ) : (
          <>
            <rect x="3" y="4" width="18" height="16" rx="1.5" />
            <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
          </>
        )}
      </svg>
      {series ? "Series" : "Movie"}
      {detail ? <span className="tile-badge-detail">· {detail}</span> : null}
    </span>
  );
}

export function isHttpUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
