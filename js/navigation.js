/**
 * Header scroll behavior and the fullscreen
 * mobile menu, including a focus trap for keyboard/screen-reader users.
 */
import { qs, qsa, throttle } from "./utils.js";

const SCROLL_THRESHOLD = 24;

function initHeaderScroll(header) {
  const onScroll = throttle(() => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > SCROLL_THRESHOLD);
  }, 80);

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initMobileMenu(header) {
  const toggle = qs(".nav-toggle", header);
  const menu = qs("#mobile-menu");
  if (!toggle || !menu) return;

  const focusableSelector =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const first = qs(focusableSelector, menu);
      first?.focus();
    } else {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  qsa("a", menu).forEach((link) =>
    link.addEventListener("click", () => setOpen(false))
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
      return;
    }
    if (e.key === "Tab" && menu.classList.contains("is-open")) {
      const focusable = qsa(focusableSelector, menu);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

function markActiveLink() {
  const current = document.body.dataset.page;
  if (!current) return;
  qsa(`a[data-nav="${current}"]`).forEach((link) =>
    link.setAttribute("aria-current", "page")
  );
}

function initStickyMobileCTA() {
  const sticky = qs(".sticky-cta");
  if (!sticky) return;
  const hero = qs(".hero, .page-hero");

  const reveal = throttle(() => {
    const showAfter = hero ? hero.offsetHeight : 400;
    sticky.classList.toggle("is-visible", window.scrollY > showAfter);
  }, 100);

  window.addEventListener("scroll", reveal, { passive: true });
  reveal();
}

export function initNavigation() {
  const header = qs(".site-header");
  if (!header) return;
  initHeaderScroll(header);
  initMobileMenu(header);
  markActiveLink();
  initStickyMobileCTA();
}
