// Browse page: loads the catalog from Supabase and filters it in the browser.

const state = { titles: [], type: "all", genre: null, query: "" };

const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const genresEl = document.getElementById("genres");

async function loadTitles() {
  const { supabaseUrl, supabaseKey } = window.FRONTIER_CONFIG || {};
  if (!supabaseUrl || !supabaseKey) {
    statusEl.textContent = "Supabase isn't connected yet. Add your project URL and key to config.js.";
    return;
  }

  const client = window.supabase.createClient(supabaseUrl, supabaseKey);
  const { data, error } = await client
    .from("titles")
    .select("id, type, name, release_year, poster_url, genres(name)")
    .order("name");

  if (error) {
    statusEl.textContent = "Couldn't load titles: " + error.message;
    return;
  }
  setTitles(data);
}

function setTitles(titles) {
  state.titles = titles.map((t) => ({ ...t, genres: (t.genres || []).map((g) => g.name) }));
  renderGenres();
  render();
}

function renderGenres() {
  const names = [...new Set(state.titles.flatMap((t) => t.genres))].sort();
  genresEl.replaceChildren(
    ...names.map((name) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = name;
      chip.addEventListener("click", () => {
        state.genre = state.genre === name ? null : name;
        genresEl.querySelectorAll(".chip").forEach((c) =>
          c.classList.toggle("is-active", c.textContent === state.genre)
        );
        render();
      });
      return chip;
    })
  );
}

function render() {
  const query = state.query.trim().toLowerCase();
  const visible = state.titles.filter(
    (t) =>
      (state.type === "all" || t.type === state.type) &&
      (!state.genre || t.genres.includes(state.genre)) &&
      (!query || t.name.toLowerCase().includes(query))
  );

  grid.replaceChildren(...visible.map(card));
  statusEl.textContent =
    state.titles.length === 0
      ? "No titles yet. Add some in Supabase's Table Editor."
      : visible.length === 0
        ? "Nothing matches those filters."
        : "";
}

function card(title) {
  const li = document.createElement("li");
  li.className = "card";

  let poster;
  if (isHttpUrl(title.poster_url)) {
    poster = document.createElement("img");
    poster.src = title.poster_url;
    poster.alt = "";
    poster.loading = "lazy";
  } else {
    poster = document.createElement("div");
    poster.textContent = title.name.charAt(0).toUpperCase();
  }
  poster.className = "poster";

  const body = document.createElement("div");
  body.className = "card-body";

  const name = document.createElement("h2");
  name.className = "card-title";
  name.textContent = title.name;

  const meta = document.createElement("p");
  meta.className = "card-meta";
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = title.type === "series" ? "Series" : "Movie";
  meta.append(badge, title.release_year ? String(title.release_year) : "");

  body.append(name, meta);
  li.append(poster, body);
  return li;
}

function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

document.querySelectorAll(".tab").forEach((tab) =>
  tab.addEventListener("click", () => {
    state.type = tab.dataset.type;
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("is-active", t === tab);
      t.setAttribute("aria-selected", t === tab);
    });
    render();
  })
);

document.getElementById("search").addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

loadTitles();
