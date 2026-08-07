/**
 * Wraps SwiperJS (loaded globally via CDN) for the testimonial carousel
 * and any related-projects rail. Markup drives configuration through data
 * attributes so new sliders don't require new JS.
 */
import { qsa } from "./utils.js";

function buildConfig(el) {
  const perView = el.dataset.perView || "1.15";
  const perViewTablet = el.dataset.perViewTablet || "2.1";
  const perViewDesktop = el.dataset.perViewDesktop || perView;
  const loop = el.dataset.loop !== "false";
  const autoplayDelay = el.dataset.autoplay ? parseInt(el.dataset.autoplay, 10) : 0;
  const spaceBetween = el.dataset.spaceBetween ? parseInt(el.dataset.spaceBetween, 10) : 20;
  const effect = el.dataset.effect || "slide";

  return {
    slidesPerView: parseFloat(perView),
    spaceBetween,
    loop,
    speed: 700,
    effect,
    fadeEffect: effect === "fade" ? { crossFade: true } : undefined,
    grabCursor: true,
    a11y: { enabled: true },
    keyboard: { enabled: true },
    autoplay: autoplayDelay
      ? { delay: autoplayDelay, disableOnInteraction: false, pauseOnMouseEnter: true }
      : false,
    pagination: el.querySelector(".swiper-pagination")
      ? { el: el.querySelector(".swiper-pagination"), clickable: true }
      : false,
    navigation: el.querySelector(".swiper-button-next")
      ? {
          nextEl: el.querySelector(".swiper-button-next"),
          prevEl: el.querySelector(".swiper-button-prev"),
        }
      : false,
    breakpoints: {
      768: { slidesPerView: parseFloat(perViewTablet) },
      1024: { slidesPerView: parseFloat(perViewDesktop) },
    },
  };
}

export function initSliders() {
  if (typeof window.Swiper === "undefined") return;

  qsa(".swiper[data-slider]").forEach((el) => {
    // eslint-disable-next-line no-new
    new window.Swiper(el, buildConfig(el));
  });
}
