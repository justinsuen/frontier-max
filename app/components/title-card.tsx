import Link from "next/link";
import type { Title } from "../browse";

export function TitleCard({ title }: { title: Title }) {
  return (
    <li className="card">
      <Link href={`/titles/${title.id}`} className="card-link">
        <Artwork title={title} />
        <div className="card-body">
          <h2 className="card-title">{title.name}</h2>
          <TitleMeta title={title} />
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

// "MOVIE 2016" or "SERIES 5 SEASONS" under a title, so movies and series can be told
// apart in mixed rows without opening them.
export function TitleMeta({ title }: { title: Title }) {
  const series = title.type === "series";
  const detail =
    series && title.seasons ? `${title.seasons} ${title.seasons === 1 ? "season" : "seasons"}` : title.release_year;
  return (
    <p className="card-meta">
      <span className={`badge badge-${title.type}`}>{series ? "Series" : "Movie"}</span>
      {detail}
    </p>
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
