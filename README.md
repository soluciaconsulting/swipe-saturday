# Swipe Saturday® — Website

A premium, cinematic, video-first portfolio and lead-generation website for
**Swipe Saturday®**, a content production studio based in Des Moines, Iowa
specializing in short-form social content, drone videography, brand
storytelling, event coverage, destination marketing and retail campaigns.

Built with plain HTML5, CSS3 and vanilla ES2023 JavaScript — no framework,
no bundler, no build step. GSAP, Lenis and SwiperJS are loaded from CDN.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Installation & Local Development](#installation--local-development)
4. [Architecture Notes](#architecture-notes)
5. [Customization](#customization)
6. [Adding a New Portfolio Project](#adding-a-new-portfolio-project)
7. [Replacing Videos](#replacing-videos)
8. [Replacing Images](#replacing-images)
9. [The Contact Form (no backend included)](#the-contact-form-no-backend-included)
10. [Deployment (GitHub Pages)](#deployment-github-pages)
11. [Performance Notes & Checklist](#performance-notes--checklist)
12. [SEO Checklist](#seo-checklist)
13. [Accessibility](#accessibility)
14. [Browser Support](#browser-support)

---

## Project Overview

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Hero, logo marquee, featured work, services, drone showcase, stats, about preview, testimonials, CTA |
| Portfolio | `portfolio.html` | Filterable grid of every project (Retail / Events / Drone / Products / Destination) |
| Project detail | `project.html?slug=<slug>` | Dynamic case-study template driven entirely by `project-data/projects.json` |
| Services | `services.html` | Service catalog, in-depth breakdown, 4-step workflow, FAQ |
| Drone | `drone.html` | Aerial hero, FAA Part 107 credentials, aerial gallery, industries served |
| About | `about.html` | Mission, story timeline, values, stats |
| Contact | `contact.html` | Split layout with a validated, glassmorphism lead form |

There is intentionally **no build step**. Every page is a static HTML file
that can be opened directly by a static file server and works immediately.

---

## Folder Structure

```
/
├── index.html
├── portfolio.html
├── project.html            # dynamic project template — see below
├── services.html
├── drone.html
├── about.html
├── contact.html
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── images/              # placeholder SVGs — see "Replacing Images"
│   ├── videos/               # empty by default — see "Replacing Videos"
│   └── icons/                # favicon
├── css/
│   ├── variables.css         # design tokens (color, type, spacing, motion)
│   ├── reset.css
│   ├── typography.css
│   ├── layout.css            # container, 12-col grid, section rhythm
│   ├── components.css        # nav, buttons, cards, forms, footer, etc.
│   ├── animations.css        # GSAP start/end states, reduced-motion, loader
│   ├── responsive.css        # breakpoint overrides (laptop/tablet/mobile)
│   └── style.css             # entry point — @imports the files above in order
├── js/
│   ├── utils.js               # shared helpers (debounce, fetchJSON, etc.)
│   ├── main.js                 # bootstraps every page; owns Lenis, FAQ,
│   │                            lightbox, video modal, component includes
│   ├── navigation.js            # header scroll state + mobile menu
│   ├── animations.js            # GSAP reveals, parallax, magnetic buttons,
│   │                            cursor, split-text hero reveal
│   ├── portfolio.js              # fetches projects.json, renders cards +
│   │                            project detail page, category filtering
│   ├── counter.js                 # animated stat counters
│   ├── slider.js                   # SwiperJS testimonial carousel
│   ├── contact.js                   # contact form validation + success state
│   └── lazyload.js                   # IntersectionObserver image/video loading
├── components/
│   ├── header.html            # nav + mobile menu, fetched into every page
│   └── footer.html            # footer + sticky mobile CTA + lightbox/video
│                                modal markup, fetched into every page
├── project-data/
│   └── projects.json          # single source of truth for every project
└── README.md
```

---

## Installation & Local Development

There's nothing to `npm install`. The site uses:

- **ES Modules** (`<script type="module">`) for JavaScript
- **`fetch()`** to load `project-data/projects.json` and the shared
  header/footer components

Both of these require the page to be served over `http://`, not opened via
`file://` (browsers block module scripts and `fetch` from the filesystem for
security reasons). So "no build step" still means "run a static server" —
any of the following work:

```bash
# Python (built into macOS/Linux)
python3 -m http.server 8000

# Node (no install needed)
npx serve .

# VS Code
# Right-click index.html → "Open with Live Server"
```

Then visit `http://localhost:8000`.

---

## Architecture Notes

- **Shared header/footer**: `components/header.html` and
  `components/footer.html` are fetched at runtime and injected into
  `<div data-include="header">` / `<div data-include="footer">` placeholders
  (see `includePartials()` in `js/main.js`). Edit the nav or footer once and
  every page updates — no copy-pasting markup across 7 files.
- **Data-driven portfolio**: `project-data/projects.json` is the single
  source of truth for every project. `js/portfolio.js` renders it into three
  different contexts (homepage featured grid, portfolio filter grid,
  project detail page) so the JSON is the only thing you edit to add,
  remove or update a case study.
- **Progressive enhancement**: `<html class="no-js">` flips to `class="js"`
  via an inline script the instant JavaScript runs. If JavaScript is
  disabled entirely, `animations.css` shows all `[data-reveal]` content at
  full opacity instead of leaving it hidden. If GSAP itself fails to load
  (e.g. blocked by an ad blocker), `animations.js` still adds a
  `.gsap-ready` class that triggers the same fallback.
- **No global state**: every JS file is an ES module exporting named
  `init*()` functions; `main.js` is the only place that calls them, gated by
  whether the relevant DOM element exists on the current page. Nothing is
  attached to `window` except the third-party libraries themselves (GSAP,
  Lenis, Swiper) and the custom cursor element they animate.

---

## Customization

All design tokens live in **`css/variables.css`** — colors, type scale,
spacing (8px scale), radius, shadows, motion easing/duration, and the
container/grid system. Change a value there and it cascades through the
whole site.

```css
:root {
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-accent: #1d9bf0;      /* brand blue — buttons, dark-bg accents */
  --color-accent-dark: #0f6aa8; /* WCAG-AA-safe shade for accent text on
                                    light backgrounds — see note below */
  --radius: 16px;
  --container-width: 1280px;
  ...
}
```

> **Why two accent shades?** The brand blue `#1D9BF0` only contrasts ~3:1
> against white, which fails WCAG AA for text (4.5:1 required). It reads
> beautifully as a *background* (buttons) or on *dark* sections, so it's
> kept for those. Anywhere the blue is used as small text on a light
> background (eyebrows, stat numbers, timeline years) uses
> `--color-accent-dark` instead, which passes 4.5:1+. If you change
> `--color-accent`, re-check contrast before reusing it for text — see
> [Accessibility](#accessibility).

---

## Adding a New Portfolio Project

Everything lives in `project-data/projects.json`. Append a new object to the
array:

```json
{
  "title": "Client Name",
  "slug": "client-name",
  "client": "Client Name",
  "year": "2026",
  "location": "Des Moines, IA",
  "categories": ["retail"],
  "tags": ["Short-Form", "Retail Campaign"],
  "thumbnail": "assets/images/projects/client-name-thumb.svg",
  "heroImage": "assets/images/projects/client-name-hero.svg",
  "heroVideo": "assets/videos/projects/client-name.mp4",
  "description": "One-sentence summary shown on cards.",
  "overview": "Longer paragraph for the project detail page.",
  "objective": "What the project was trying to achieve.",
  "deliverables": ["Item one", "Item two"],
  "results": [{ "number": "1.2M+", "label": "Views" }],
  "gallery": [
    "assets/images/projects/client-name-gallery-1.svg",
    "assets/images/projects/client-name-gallery-2.svg"
  ]
}
```

- `categories` must use the filter keys already wired up in
  `portfolio.html`: `retail`, `events`, `drone`, `products`, `destination`.
  A project can belong to more than one.
- `slug` becomes the URL: `project.html?slug=client-name`.
- The homepage "Featured Projects" section shows **every** entry in the
  array — trim the JSON (or add a `featured: true` flag and filter on it in
  `initFeaturedProjects()` in `js/portfolio.js`) once you have more projects
  than you want on the homepage.
- No other file needs to change — cards, filters, and the detail page all
  read from this JSON at runtime.

---

## Replacing Videos

`assets/videos/` ships empty (see `assets/videos/README.md` for the exact
filenames expected). Every `<video>` already has a `poster` image, so the
site looks complete even before you add real footage.

1. Export H.264 `.mp4` files, web-optimized (target **under 8–10MB** for
   hero/showcase loops, ideally muted so autoplay isn't blocked by browsers).
2. Drop them into `assets/videos/` (and `assets/videos/projects/` for
   per-project hero videos) using the filenames referenced in the HTML and
   `projects.json` — e.g. `assets/videos/hero-reel.mp4`.
3. Regenerate a real poster frame (first frame or a chosen still) to replace
   the matching placeholder SVG in `assets/images/` — this is what shows
   while the video buffers and what search engines/social previews use.
4. Keep hero/loop videos short (8–15s) and muted so they satisfy browser
   autoplay policies without a play button.

---

## Replacing Images

All current images are generator-built placeholder SVGs (gradient +
identifying label) so the layout, spacing and lightbox/gallery interactions
can be reviewed before real photography exists. Replace them 1:1 by
filename — every `<img>` already has correct `width`/`height` attributes to
prevent layout shift, so keep the same aspect ratio per slot:

| Location | Aspect ratio |
| --- | --- |
| Project thumbnail (`*-thumb.svg`) | 4:5 |
| Project hero / gallery images | 16:9 / 3:2 |
| About portrait | 4:5 |
| Drone gallery | 3:2 |
| Logos | flexible width, 80px height |
| OG / social share image | 1200×630 |

JPEG or WebP are both fine for photography — just update the `src` /
`data-src` extension in the HTML (or `thumbnail` / `gallery` paths in
`projects.json`) to match.

---

## The Contact Form (no backend included)

This is a static site, so `js/contact.js` only handles **client-side
validation and the success-state UI** — there's no server to actually send
the email. On a valid submit it dispatches a `swipe:contact-submit`
`CustomEvent` with the form data, so you can wire up a real backend without
touching the validation logic:

```js
window.addEventListener("swipe:contact-submit", (e) => {
  fetch("https://formspree.io/f/your-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(e.detail),
  });
});
```

Drop-in options that require no custom backend: **Formspree**, **Netlify
Forms** (if you host on Netlify instead of GitHub Pages), or a small
serverless function (Cloudflare Workers / Vercel / AWS Lambda) that emails
you the payload.

---

## Deployment (GitHub Pages)

```bash
git init                       # already done if you cloned this repo
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then in the repo settings: **Settings → Pages → Source → Deploy from a
branch → `main` / `root`**. No build step means GitHub Pages can serve the
repo as-is.

Before going live:

- Update every `https://www.swipesaturday.com/...` URL in `robots.txt`,
  `sitemap.xml`, and each page's `<link rel="canonical">` / Open Graph /
  Twitter meta tags to your real domain.
- Update the phone number, email, and social links in
  `components/header.html`, `components/footer.html`, and `contact.html`.

---

## Performance Notes & Checklist

Already in place:

- Zero build tooling / zero JS framework runtime overhead.
- `IntersectionObserver`-based lazy loading for every below-the-fold image
  and video (`js/lazyload.js`), with `width`/`height` set on every `<img>`
  to prevent layout shift.
- Hero video is the only eagerly-loaded media (it's the LCP element);
  everything else defers until it's near the viewport.
- `preconnect` hints for Google Fonts and the CDN origins; `font-display:
  swap` via the Google Fonts `&display=swap` param.
- CSS custom properties instead of duplicated values; a single `style.css`
  entry point importing the modular files in dependency order.
- `prefers-reduced-motion` is respected — GSAP animations and the marquee
  are skipped/disabled for users who request reduced motion.

Before shipping to production, also consider:

- Compressing/converting real photography to WebP/AVIF with responsive
  `srcset`s once you replace the placeholder SVGs.
- Self-hosting Google Fonts (or subsetting to the weights actually used:
  400/500/600/700/800) to remove the extra DNS/TLS round trip.
- Adding [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
  hashes to the CDN `<script>`/`<link>` tags (omitted here because a wrong
  hash silently breaks the resource — generate real ones for your exact
  pinned versions before launch).
- Running `npx playwright test` / Lighthouse CI against the deployed URL to
  catch regressions.

---

## SEO Checklist

Every page already ships with:

- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`,
  one `<h1>` per page, logical heading order)
- Unique `<title>` and meta description per page
- `<link rel="canonical">`
- Open Graph + Twitter Card meta tags
- Schema.org JSON-LD (`ProfessionalService` sitewide, plus `Service`,
  `AboutPage`, `ContactPage`, and `BreadcrumbList` where relevant)
- `robots.txt` and `sitemap.xml` at the root
- Descriptive, non-empty `alt` text on meaningful images; decorative
  images/icons use `alt=""` or `aria-hidden="true"`

Before launch:

- [ ] Replace every placeholder `swipesaturday.com` URL with the real domain
- [ ] Verify `sitemap.xml` includes every real project slug once
      `projects.json` grows beyond the seed data
- [ ] Submit the sitemap in Google Search Console / Bing Webmaster Tools
- [ ] Regenerate `og-image.svg` (or replace with a real 1200×630 JPEG/PNG —
      some social platforms don't render SVG previews)

---

## Accessibility

Targets WCAG 2.1 AA. Verified with an automated `axe-core` sweep of all
seven pages during development (0 violations) plus manual review:

- Skip-to-content link on every page
- Visible focus states on all interactive elements (`:focus-visible`)
- Full keyboard support for the mobile menu (focus trap, `Escape` to close),
  FAQ accordion, lightbox and video modal (`Escape`/arrow keys)
- `aria-expanded` / `aria-controls` / `aria-hidden` kept in sync with state
  via JS, not just CSS
- Color contrast audited and fixed at the token level (see the
  `--color-accent-dark` note under [Customization](#customization)) rather
  than patched per-instance
- `prefers-reduced-motion` disables non-essential animation
- Logical heading hierarchy (single `h1` → `h2` sections → `h3` sub-items)
  on every page

If you change colors, fonts, or add new components, re-run an accessibility
check — contrast in particular is easy to silently break.

---

## Browser Support

Evergreen browsers (Chrome, Edge, Firefox, Safari — last 2 versions). Uses
`aspect-ratio`, CSS custom properties, `IntersectionObserver`,
`backdrop-filter`, and ES Modules, none of which need a polyfill in any
currently-supported browser version.
