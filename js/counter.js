/**
 * Animates numeric stats (e.g. "17K+") when they scroll into view.
 * Reads target value from data-count-to and optional formatting hints
 * from data-prefix / data-suffix / data-decimals.
 */
import { qsa, onEnterViewport, prefersReducedMotion, formatNumber } from "./utils.js";

function animateCount(el) {
  const to = parseFloat(el.dataset.countTo);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const duration = 1600;

  if (prefersReducedMotion() || Number.isNaN(to)) {
    el.textContent = `${prefix}${to}${suffix}`;
    return;
  }

  const start = performance.now();
  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuint(progress);
    const current = to * eased;
    const display = decimals
      ? current.toFixed(decimals)
      : formatNumber(current);
    el.textContent = `${prefix}${display}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export function initCounters() {
  qsa("[data-count-to]").forEach((el) => {
    onEnterViewport(el, () => animateCount(el), { threshold: 0.6 });
  });
}
