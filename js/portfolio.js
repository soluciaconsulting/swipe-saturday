/**
 * Portfolio data controller. Fetches /project-data/projects.json once and
 * renders it into three different contexts: the homepage "featured" grid,
 * the full filterable portfolio grid, and a single project's detail page.
 * Keeping all three driven by one JSON file is what makes adding a new
 * project a content-only change (see README → "Adding new portfolio
 * projects").
 */
import { qs, qsa, fetchJSON } from "./utils.js";

const DATA_PATH = "project-data/projects.json";

const CATEGORY_LABELS = {
  retail: "Retail",
  events: "Events",
  drone: "Drone",
  products: "Products",
  destination: "Destination",
};

function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat;
}

function projectCardHTML(project, { wide = false } = {}) {
  return `
    <a
      href="project.html?slug=${project.slug}"
      class="project-card${wide ? " project-card--wide" : ""}"
      data-reveal
      data-categories="${project.categories.join(" ")}"
    >
      <div class="project-card-media">
        <img
          data-lazy
          data-src="${project.thumbnail}"
          alt=""
          width="900"
          height="1125"
          loading="lazy"
        />
      </div>
      <span class="project-card-play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
      <div class="project-card-body">
        <span class="project-card-tag">${project.tags[0] || categoryLabel(project.categories[0])}</span>
        <h3 class="project-card-title">${project.title}</h3>
        <p class="project-card-desc">${project.description}</p>
        <span class="project-card-cta">View Project <i class="fa-solid fa-arrow-right icon" aria-hidden="true"></i></span>
      </div>
    </a>
  `;
}

function featuredProjectCardHTML(project) {
  const instagramUrl = project.instagramUrl || "https://instagram.com";

  return `
    <article class="project-card project-card--featured" data-reveal data-categories="${project.categories.join(" ")}">
      <div class="project-card-media">
        <a class="project-card-link" href="${instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open ${project.title} on Instagram"></a>
        <img
          data-lazy
          data-src="${project.thumbnail}"
          alt="${project.title} thumbnail"
          width="900"
          height="1125"
          loading="lazy"
        />
        <video
          class="project-card-inline-video"
          muted
          playsinline
          controls
          preload="metadata"
          poster="${project.heroImage}"
          style="display: none;"
        >
          <source src="${project.heroVideo}" type="video/mp4" />
        </video>
        <button
          type="button"
          class="project-card-play"
          data-inline-video-trigger
          aria-label="Play ${project.title} video"
        >
          <i class="fa-solid fa-play"></i>
        </button>
      </div>
      <div class="project-card-body">
        <span class="project-card-tag">${project.tags[0] || categoryLabel(project.categories[0])}</span>
        <h3 class="project-card-title">${project.title}</h3>
        ${project.featuredStat ? `<span class="project-card-stat">${project.featuredStat}</span>` : ""}
        <p class="project-card-desc">${project.description}</p>
      </div>
      <div class="project-card-footer">
        <div class="project-card-tags">
          ${project.tags.map((tag) => `<span class="project-card-pill">${tag}</span>`).join("")}
        </div>
        <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="project-card-cta">
          View on Instagram <i class="fa-solid fa-arrow-right icon" aria-hidden="true"></i>
        </a>
      </div>
    </article>
  `;
}

export async function initFeaturedProjects() {
  const container = qs('[data-projects="featured"]');
  if (!container) return;

  const allProjects = await fetchJSON(DATA_PATH);
  if (!allProjects) return;

  const limit = container.dataset.limit ? parseInt(container.dataset.limit, 10) : allProjects.length;
  const projects = allProjects.slice(0, limit);

  container.innerHTML = projects.map((project) => featuredProjectCardHTML(project)).join("");
}

export async function initPortfolioGrid() {
  const container = qs('[data-projects="grid"]');
  if (!container) return;

  const allProjects = await fetchJSON(DATA_PATH);
  if (!allProjects) return;

  const categoryFilter = container.dataset.categoryFilter;
  const projects = categoryFilter
    ? allProjects.filter((p) => p.categories.includes(categoryFilter))
    : allProjects;

  container.innerHTML = projects.map((project) => projectCardHTML(project)).join("");

  const filterBar = qs("[data-filter-bar]");
  if (!filterBar) return;

  const cards = qsa(".project-card", container);

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;

    qsa("[data-filter]", filterBar).forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    btn.setAttribute("aria-pressed", "true");
    qsa("[data-filter]", filterBar)
      .filter((b) => b !== btn)
      .forEach((b) => b.setAttribute("aria-pressed", "false"));

    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      const cats = card.dataset.categories.split(" ");
      const show = filter === "all" || cats.includes(filter);
      card.style.display = show ? "" : "none";
    });
  });
}

function metaRow(label, value) {
  return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
}

function renderProjectDetail(project, all) {
  document.title = `${project.title} — Swipe Saturday®`;
  const metaDesc = qs('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", project.description);

  qs("[data-project-eyebrow]").textContent = project.categories.map(categoryLabel).join(" · ");
  qs("[data-project-title]").textContent = project.title;
  qs("[data-project-description]").textContent = project.description;

  const heroVideo = qs("[data-project-hero-video]");
  if (heroVideo) {
    heroVideo.poster = project.heroImage;
    heroVideo.dataset.poster = project.heroImage;
    heroVideo.dataset.src = project.heroVideo;
  }

  qs("[data-project-overview]").textContent = project.overview;
  qs("[data-project-objective]").textContent = project.objective;

  qs("[data-project-deliverables]").innerHTML = project.deliverables
    .map((item) => `<li><i class="fa-solid fa-check icon text-accent" aria-hidden="true"></i> ${item}</li>`)
    .join("");

  qs("[data-project-results]").innerHTML = project.results
    .map(
      (r) => `
      <div class="result-item">
        <div class="result-number">${r.number}</div>
        <div class="result-label">${r.label}</div>
      </div>`
    )
    .join("");

  qs("[data-project-meta]").innerHTML = [
    metaRow("Client", project.client),
    metaRow("Location", project.location),
    metaRow("Year", project.year),
  ].join("");

  qs("[data-project-tags]").innerHTML = project.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  const gallery = qs("[data-project-gallery]");
  if (gallery) {
    gallery.innerHTML = project.gallery
      .map(
        (src, i) => `
        <button type="button" class="gallery-item" data-lightbox-trigger data-src="${src}" aria-label="Open gallery image ${i + 1} of ${project.title}">
          <img data-lazy data-src="${src}" alt="${project.title} — production still ${i + 1}" width="1200" height="800" loading="lazy" />
        </button>`
      )
      .join("");
  }

  const related = all
    .filter(
      (p) =>
        p.slug !== project.slug &&
        p.categories.some((c) => project.categories.includes(c))
    )
    .slice(0, 3);

  const fallbackRelated = related.length
    ? related
    : all.filter((p) => p.slug !== project.slug).slice(0, 3);

  qs("[data-related-projects]").innerHTML = fallbackRelated
    .map((p) => projectCardHTML(p))
    .join("");
}

export async function initProjectDetail() {
  const root = qs("[data-project-page]");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const projects = await fetchJSON(DATA_PATH);

  if (!projects) return;

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    root.innerHTML = `
      <div class="container section--tight text-center" style="padding-block: var(--space-9); text-align:center;">
        <p class="eyebrow">Project Not Found</p>
        <h1 class="h2" style="margin-top: var(--space-2);">We couldn't find that project.</h1>
        <p class="text-lead" style="margin-top: var(--space-3);">It may have moved. Browse the full portfolio instead.</p>
        <a href="portfolio.html" class="btn btn-primary" style="margin-top: var(--space-5);">View Portfolio</a>
      </div>`;
    return;
  }

  renderProjectDetail(project, projects);
}
