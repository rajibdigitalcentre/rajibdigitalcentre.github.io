// Skiper UI TextRoll (skiper58), ported from the published React component.
// Retains its two layers, starting positions, easing and per-letter stagger.
const STAGGER = 0.035;

export function mountTextRoll(control) {
  const label = control.textContent.trim();
  const letters = Array.from(label);
  const roll = document.createElement("span");
  roll.className = "skiper-roll";
  roll.setAttribute("aria-hidden", "true");
  const center = control.dataset.skiperRoll === "center";

  for (const position of ["first", "second"]) {
    const layer = document.createElement("span");
    layer.className = "skiper-roll-" + position;
    for (const [index, letter] of letters.entries()) {
      const glyph = document.createElement("span");
      const delay = center
        ? STAGGER * Math.abs(index - (letters.length - 1) / 2)
        : STAGGER * index;
      glyph.style.setProperty("--skiper-delay", delay + "s");
      glyph.textContent = letter === " " ? "\u00a0" : letter;
      layer.append(glyph);
    }
    roll.append(layer);
  }

  const accessibleLabel = document.createElement("span");
  accessibleLabel.className = "skiper-sr";
  accessibleLabel.textContent = label;
  control.replaceChildren(accessibleLabel, roll);
}
