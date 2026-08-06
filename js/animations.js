/**
 * Animation controller. GSAP + ScrollTrigger are loaded globally via CDN
 * (see the bottom of each HTML page), so this module reads them off
 * `window` rather than importing an npm package. Every effect degrades
 * gracefully: if GSAP failed to load, or the user prefers reduced motion,
 * content stays visible via the CSS defaults in animations.css.
 */
import { qs, qsa, prefersReducedMotion, isTouchDevice } from "./utils.js";

function getGSAP() {
  if (typeof window.gsap === "undefined") return null;
  if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
  return window.gsap;
}

function splitLines(el) {
  // Wraps each line's text in a masked span for a line-by-line reveal.
  // Words are wrapped individually then re-flowed, which approximates
  // per-line splitting without measuring layout manually.
  const text = el.textContent.trim();
  const words = text.split(/\s+/);
  el.textContent = "";
  el.classList.add("split-line");
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.textContent = word + (i < words.length - 1 ? " " : "");
    el.appendChild(span);
  });
  return qsa("span", el);
}

function heroReveal(gsap) {
  const hero = qs("[data-hero-reveal]");
  if (!hero) return;

  const eyebrow = qs(".eyebrow", hero);
  const title = qs(".hero-title, .h1", hero);
  const sub = qs(".hero-sub", hero);
  const actions = qs(".hero-actions", hero);

  const tl = gsap.timeline({ delay: 0.3, defaults: { ease: "power3.out" } });

  if (title) {
    const words = splitLines(title);
    tl.set(title, { opacity: 1 });
    tl.from(words, { yPercent: 130, duration: 1, stagger: 0.04 }, 0.1);
  }
  if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 16, duration: 0.6 }, 0);
  if (sub) tl.from(sub, { opacity: 0, y: 24, duration: 0.8 }, 0.4);
  if (actions) tl.from(actions, { opacity: 0, y: 24, duration: 0.8 }, 0.55);
}

function scrollReveals(gsap) {
  qsa("[data-reveal]").forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: (i % 3) * 0.08,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  qsa("[data-reveal-scale]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.92 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

function parallaxLayers(gsap) {
  if (isTouchDevice()) return;
  qsa("[data-parallax]").forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    gsap.to(el, {
      yPercent: speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section") || el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

function zoomOnScroll(gsap) {
  qsa(".zoom-on-scroll img, .zoom-on-scroll video").forEach((media) => {
    gsap.fromTo(
      media,
      { scale: 1.15 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: media.closest(".zoom-on-scroll"),
          start: "top bottom",
          end: "top 30%",
          scrub: true,
        },
      }
    );
  });
}

function magneticButtons(gsap) {
  if (isTouchDevice()) return;
  qsa("[data-magnetic]").forEach((wrapper) => {
    const strength = 0.35;
    const target = qs("a, button", wrapper) || wrapper;

    wrapper.addEventListener("mousemove", (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(target, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: "power3.out",
      });
    });

    wrapper.addEventListener("mouseleave", () => {
      gsap.to(target, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    });
  });
}

function customCursor(gsap) {
  if (isTouchDevice()) return;
  const cursor = document.createElement("div");
  cursor.className = "cursor-dot";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  window.addEventListener("mousemove", (e) => {
    cursor.classList.add("is-visible");
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
  });

  qsa("a, button, .project-card, [data-cursor-grow]").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  });
}

function cardHoverTilt(gsap) {
  if (isTouchDevice()) return;
  qsa("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateX: py * -6,
        rotateY: px * 6,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power2.out",
      });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
    });
  });
}

export function initAnimations() {
  document.documentElement.classList.add("gsap-ready");

  if (prefersReducedMotion()) return;

  const gsap = getGSAP();
  if (!gsap) return;

  heroReveal(gsap);
  scrollReveals(gsap);
  parallaxLayers(gsap);
  zoomOnScroll(gsap);
  magneticButtons(gsap);
  customCursor(gsap);
  cardHoverTilt(gsap);
}
