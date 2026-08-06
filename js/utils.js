/**
 * Shared, dependency-free helpers used across controllers.
 * No globals: everything here is an explicit ES module export.
 */

export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export function debounce(fn, wait = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, limit = 100) {
  let inThrottle = false;
  return (...args) => {
    if (inThrottle) return;
    fn(...args);
    inThrottle = true;
    setTimeout(() => (inThrottle = false), limit);
  };
}

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (start, end, t) => start + (end - start) * t;

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Formats a number with locale thousands separators, e.g. 17000 -> "17,000". */
export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/**
 * Runs `callback` once when `el` enters the viewport, then disconnects.
 * Falls back to firing immediately if IntersectionObserver is unavailable.
 */
export function onEnterViewport(el, callback, options = { threshold: 0.25 }) {
  if (!("IntersectionObserver" in window)) {
    callback();
    return null;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, options);
  observer.observe(el);
  return observer;
}

/** Safe fetch-and-parse JSON with a friendly console error on failure. */
export async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error(`[Swipe Saturday] Could not load ${path}:`, error);
    return null;
  }
}

/** Reads the current page's data-page attribute set on <body>. */
export function getCurrentPage() {
  return document.body.dataset.page || "";
}

export const isTouchDevice = () =>
  window.matchMedia("(hover: none), (pointer: coarse)").matches;
