// Animated Number behavior adapted from Skiper UI (https://skiper-ui.com/v1/skiper37).
// This implementation uses native JavaScript and SVG for the static site.
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

export function createProgressRing(root) {
  const arc = root.querySelector(".progress-arc");
  const number = root.querySelector(".progress-number");
  let frame = 0;
  let current = 0;
  let target = null;

  function paint(value) {
    current = value;
    arc.style.strokeDashoffset = String(100 - value);
    number.textContent = target === null ? "–" : Math.round(value) + "%";
  }

  function render(replay = false) {
    cancelAnimationFrame(frame);
    if (target === null || reducedMotion.matches || root.getClientRects().length === 0) {
      paint(target ?? 0);
      return;
    }
    const start = replay ? 0 : current;
    const end = target;
    paint(start);
    if (start === end) return;
    const started = performance.now();
    function tick(now) {
      const elapsed = Math.min((now - started) / 680, 1);
      paint(start + (end - start) * (1 - (1 - elapsed) ** 3));
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }

  reducedMotion.addEventListener("change", () => render());
  return {
    update(value, label) {
      const changed = target !== value;
      target = value;
      root.setAttribute("aria-label", label);
      root.classList.toggle("full-progress", value === 100);
      if (changed || value === null) render();
    },
    replay() { render(true); }
  };
}

export function enableCardHighlights(cards) {
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  for (const card of cards) {
    card.addEventListener("pointermove", event => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType !== "mouse") return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--highlight-x", event.clientX - bounds.left + "px");
      card.style.setProperty("--highlight-y", event.clientY - bounds.top + "px");
    }, { passive: true });
  }
}

const settle = "cubic-bezier(.23, 1, .32, 1)";

export function staggerIn(elements) {
  if (reducedMotion.matches || !Element.prototype.animate) return;
  Array.from(elements).slice(0, 6).forEach((element, index) => {
    if (element.hidden) return;
    element.animate([
      { opacity: .72, translate: "0 9px" },
      { opacity: 1, translate: "none" }
    ], { duration: 390, delay: 28 * index, easing: settle, fill: "backwards" });
  });
}

export function preparePanelTransition() {
  let stop = () => {};
  reducedMotion.addEventListener("change", () => stop());

  function swap(previous, next, direction) {
    stop();
    const animate = !reducedMotion.matches && Element.prototype.animate;
    next.hidden = false;
    if (!animate) {
      previous.hidden = true;
      return;
    }
    const incoming = next.animate([
      { opacity: .12, translate: direction * 32 + "px 8px", scale: ".985" },
      { opacity: 1, translate: "none", scale: "1" }
    ], { duration: 430, easing: settle });

    // Release the printing frame immediately when leaving its panel.
    if (previous.id === "studioPanel") {
      previous.hidden = true;
      stop = () => incoming.cancel();
      return;
    }

    previous.inert = true;
    previous.classList.add("admin-panel-exit");
    const outgoing = previous.animate([
      { opacity: 1, translate: "none" },
      { opacity: 0, translate: -direction * 10 + "px 0" }
    ], { duration: 175, easing: "ease-out" });

    stop = () => {
      outgoing.onfinish = null;
      previous.hidden = true;
      previous.inert = false;
      previous.classList.remove("admin-panel-exit");
      outgoing.cancel();
      incoming.cancel();
    };
    outgoing.onfinish = () => {
      previous.hidden = true;
      previous.inert = false;
      previous.classList.remove("admin-panel-exit");
      stop = () => incoming.cancel();
    };
  }

  return { swap, reset: () => stop() };
}
