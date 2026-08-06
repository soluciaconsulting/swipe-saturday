/**
 * Lazy-loads images and videos marked with data-src / data-poster once they
 * approach the viewport, and fades them in to avoid layout shift (the
 * element's width/height or aspect-ratio should already be set in CSS).
 */
import { onEnterViewport, qsa } from "./utils.js";

const ROOT_MARGIN = "300px 0px";

function loadImage(img) {
  const src = img.dataset.src;
  const srcset = img.dataset.srcset;
  if (srcset) img.srcset = srcset;
  if (src) img.src = src;
  img.addEventListener(
    "load",
    () => img.classList.add("is-loaded"),
    { once: true }
  );
  delete img.dataset.lazy;
}

function loadVideo(video) {
  const src = video.dataset.src;
  const poster = video.dataset.poster;
  if (poster) video.poster = poster;
  if (src) {
    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";
    video.appendChild(source);
    video.load();
  }
  video.classList.add("is-loaded");
  delete video.dataset.lazy;
}

export function initLazyLoad(scope = document) {
  const targets = qsa("[data-lazy]", scope);

  targets.forEach((el) => {
    const observer = onEnterViewport(
      el,
      () => (el.tagName === "IMG" ? loadImage(el) : loadVideo(el)),
      { rootMargin: ROOT_MARGIN, threshold: 0.01 }
    );
    // Observer already auto-disconnects after first hit (see utils.js).
    if (!observer) {
      // No IntersectionObserver support: load immediately.
      el.tagName === "IMG" ? loadImage(el) : loadVideo(el);
    }
  });
}
