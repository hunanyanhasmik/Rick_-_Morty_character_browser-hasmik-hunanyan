// Config

const API_BASE = "https://rickandmortyapi.com/api";

// Tiny API layer

async function fetchCharacters(page = 1, name = "") {
  const params = new URLSearchParams({ page });
  if (name) params.append("name", name);
  const res = await fetch(`${API_BASE}/character/?${params}`);
  if (res.status === 404) return { info: { pages: 0 }, results: [] };
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchCharacter(id) {
  const res = await fetch(`${API_BASE}/character/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// State

const state = {
  page: 1,
  query: "",
  info: null,
};

// Router (hash-based, no library)

function getRoute() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const detailMatch = hash.match(/^\/character\/(\d+)$/);
  if (detailMatch) return { name: "detail", id: detailMatch[1] };
  return { name: "list" };
}

function navigate(path) {
  location.hash = path;
}

function handleRoute() {
  const route = getRoute();
  if (route.name === "detail") {
    renderDetail(route.id);
  } else {
    renderList();
  }
}

window.addEventListener("hashchange", handleRoute);
window.addEventListener("DOMContentLoaded", handleRoute);

// Helpers

const app = () => document.getElementById("app");

function setHTML(html) {
  app().innerHTML = html;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// List View

async function renderList() {
  setHTML(`
    <section>
      <input
        id="search"
        class="search"
        type="search"
        placeholder="Search characters..."
        value="${escapeHTML(state.query)}"
      />
      <div id="list-area">
        <div class="spinner">Loading…</div>
      </div>
    </section>
  `);

  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", debounce((e) => {
    state.query = e.target.value.trim();
    state.page = 1;
    loadList();
  }, 300));

  await loadList();
}

async function loadList() {
  const area = document.getElementById("list-area");
  if (!area) return;

  area.innerHTML = `<div class="spinner">Loading…</div>`;

  try {
    const data = await fetchCharacters(state.page, state.query);
    state.info = data.info;

    if (!data.results || data.results.length === 0) {
      area.innerHTML = `<p class="empty">No characters found.</p>`;
      return;
    }

    area.innerHTML = `
      <ul class="grid">
        ${data.results.map(renderCard).join("")}
      </ul>
      <div class="pagination">
        <button id="prev" ${state.info?.prev ? "" : "disabled"}>← Prev</button>
        <span>Page ${state.page} of ${state.info?.pages ?? 1}</span>
        <button id="next" ${state.info?.next ? "" : "disabled"}>Next →</button>
      </div>
    `;

    document.getElementById("prev").onclick = () => {
      if (state.info?.prev) {
        state.page = state.info.prev.match(/page=(\d+)/)[1];
        state.page = Number(state.page);
        loadList();
      }
    };
    document.getElementById("next").onclick = () => {
      if (state.info?.next) {
        state.page = Number(state.info.next.match(/page=(\d+)/)[1]);
        loadList();
      }
    };
  } catch (err) {
    area.innerHTML = `<p class="error">${escapeHTML(err.message)}</p>`;
  }
}

function renderCard(c) {
  return `
    <li>
      <a class="card" href="#/character/${c.id}">
        <img src="${c.image}" alt="${escapeHTML(c.name)}" loading="lazy" />
        <h3>${escapeHTML(c.name)}</h3>
        <p>${escapeHTML(c.species)} · ${escapeHTML(c.status)}</p>
      </a>
    </li>
  `;
}

// Detail View

async function renderDetail(id) {
  setHTML(`
    <article class="detail">
      <a href="#/" class="back">← Back to list</a>
      <div id="detail-area">
        <div class="spinner">Loading…</div>
      </div>
    </article>
  `);

  const area = document.getElementById("detail-area");
  try {
    const c = await fetchCharacter(id);
    area.innerHTML = `
      <div class="detail-body">
        <img src="${c.image}" alt="${escapeHTML(c.name)}" />
        <div>
          <h1>${escapeHTML(c.name)}</h1>
          <dl>
            <dt>Status</dt><dd>${escapeHTML(c.status)}</dd>
            <dt>Species</dt><dd>${escapeHTML(c.species)}</dd>
            <dt>Gender</dt><dd>${escapeHTML(c.gender)}</dd>
            <dt>Origin</dt><dd>${escapeHTML(c.origin.name)}</dd>
            <dt>Last location</dt><dd>${escapeHTML(c.location.name)}</dd>
            <dt>Episodes</dt><dd>${c.episode.length}</dd>
          </dl>
        </div>
      </div>
    `;
  } catch (err) {
    area.innerHTML = `<p class="error">${escapeHTML(err.message)}</p>`;
  }
}

// Utils

function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}