/**
 * Application entry point. Wires up every controller, gated by the
 * presence of the elements they operate on so this one script can run
 * unchanged on every page. Small, page-agnostic UI behaviors that don't
 * warrant their own file (FAQ accordion, lightbox, video modal, smooth
 * scroll) live here directly.
 */
import { qs, qsa, prefersReducedMotion } from "./utils.js";
import { initNavigation } from "./navigation.js";
import { initAnimations } from "./animations.js";
import { initLazyLoad } from "./lazyload.js";
import { initCounters } from "./counter.js";
import { initSliders } from "./slider.js";
import { initFeaturedProjects, initPortfolioGrid, initProjectDetail } from "./portfolio.js";
import { initContactForm } from "./contact.js";

/**
 * Injects the shared header/footer components (see /components) into
 * their placeholder elements. Keeping this as a runtime include — rather
 * than duplicating the markup on every page — means the nav or footer
 * only ever needs to be edited in one place.
 */
async function includePartials() {
  const includes = qsa("[data-include]");
  await Promise.all(
    includes.map(async (el) => {
      const name = el.dataset.include;
      try {
        const res = await fetch(`components/${name}.html`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        el.outerHTML = await res.text();
      } catch (error) {
        console.error(`[Swipe Saturday] Could not load component "${name}":`, error);
      }
    })
  );

  const yearEl = qs("[data-current-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initSmoothScroll() {
  if (typeof window.Lenis === "undefined" || prefersReducedMotion()) return null;

  const lenis = new window.Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  if (window.gsap && window.ScrollTrigger) {
    // Let GSAP's ticker be the single driver so Lenis and ScrollTrigger
    // stay on the same clock — running our own rAF loop alongside GSAP's
    // ticker double-drives lenis.raf() each frame and causes stutter,
    // most noticeable on slow scrolls.
    lenis.on("scroll", window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return lenis;
}

function initAnchorLinks(lenis) {
  const scrollToTarget = (target, immediate = false) => {
    if (lenis) {
      lenis.scrollTo(target, { offset: -88, immediate });
    } else {
      target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    }
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  qsa('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = qs(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      // Anchor scrolling stays JS-driven rather than letting the browser
      // set location.hash, so the address bar never picks up a #section
      // suffix during normal in-page navigation.
      history.replaceState(null, "", window.location.pathname + window.location.search);
      scrollToTarget(target);
    });
  });

  // A direct/shared link (e.g. swipesaturday.com/#contact) still arrives
  // with the hash already in the address bar before any JS runs — scroll
  // to it, then strip it so the URL settles back to a clean root.
  if (window.location.hash) {
    const target = qs(window.location.hash);
    if (target) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      requestAnimationFrame(() => scrollToTarget(target, true));
    }
  }
}

function initFAQAccordion() {
  qsa(".faq-item").forEach((item) => {
    const question = qs(".faq-question", item);
    const answer = qs(".faq-answer", item);
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      qsa(".faq-item", item.parentElement).forEach((sibling) => {
        sibling.classList.remove("is-open");
        qs(".faq-question", sibling)?.setAttribute("aria-expanded", "false");
        const siblingAnswer = qs(".faq-answer", sibling);
        if (siblingAnswer) siblingAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

function initLightbox() {
  const lightbox = qs("[data-lightbox]");
  if (!lightbox) return;

  const img = qs("img", lightbox);
  const closeBtn = qs(".lightbox-close", lightbox);
  const prevBtn = qs(".lightbox-prev", lightbox);
  const nextBtn = qs(".lightbox-next", lightbox);
  let items = [];
  let index = 0;

  function open(i) {
    index = i;
    img.src = items[index].dataset.src;
    img.alt = items[index].querySelector("img")?.alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    closeBtn.focus();
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function step(delta) {
    index = (index + delta + items.length) % items.length;
    img.src = items[index].dataset.src;
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-lightbox-trigger]");
    if (!trigger) return;
    items = qsa("[data-lightbox-trigger]", trigger.closest("[data-project-gallery], .gallery-grid") || document);
    open(items.indexOf(trigger));
  });

  closeBtn?.addEventListener("click", close);
  prevBtn?.addEventListener("click", () => step(-1));
  nextBtn?.addEventListener("click", () => step(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
}

function initVideoModal() {
  const modal = qs("[data-video-modal]");
  if (!modal) return;

  const videoEl = qs("video", modal);
  const closeBtn = qs(".video-modal-close", modal);

  function open(src, poster) {
    videoEl.src = src;
    if (poster) videoEl.poster = poster;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    videoEl.play().catch(() => {});
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-video-trigger]");
    if (!trigger) return;
    open(trigger.dataset.videoSrc, trigger.dataset.videoPoster);
  });

  closeBtn?.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });
}

function initInlineVideoPlayback() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-inline-video-trigger]");
    if (!trigger) return;

    const card = trigger.closest(".project-card");
    const media = card?.querySelector(".project-card-media");
    if (!media) return;

    const img = media.querySelector("img");
    const video = media.querySelector(".project-card-inline-video");
    if (!video) return;

    if (img) {
      img.style.display = "none";
    }

    video.style.display = "block";
    video.muted = true;
    video.play().catch(() => {});
    trigger.style.display = "none";

    video.addEventListener("ended", () => {
      if (img) {
        img.style.display = "block";
      }
      video.style.display = "none";
      trigger.style.display = "";
    }, { once: true });
  });
}

async function bootstrapPage() {
  await includePartials();

  initNavigation();
  initFAQAccordion();
  initLightbox();
  initVideoModal();
  initInlineVideoPlayback();
  initSliders();

  // Data-driven sections resolve asynchronously; run lazyload + counters
  // again afterward since they inject new [data-lazy] / [data-count-to]
  // nodes into the DOM.
  await Promise.all([initFeaturedProjects(), initPortfolioGrid(), initProjectDetail()]);

  initLazyLoad();
  initCounters();
  initContactForm();

  const lenis = initSmoothScroll();
  initAnchorLinks(lenis);
  initAnimations();
}

document.addEventListener("DOMContentLoaded", bootstrapPage);
