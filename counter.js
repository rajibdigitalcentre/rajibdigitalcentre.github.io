(() => {
  const finder = document.querySelector("#finder");
  const input = document.querySelector("#finderInput");
  const list = document.querySelector("#finderList");
  const trigger = document.querySelector("#quickFind");
  const cards = [...document.querySelectorAll("#serviceGrid .box, #schemeGrid .box")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const entries = cards.map(card => ({
    name: card.querySelector("h3").textContent.trim(),
    kind: card.hasAttribute("data-c") ? "Scheme" : "Service",
    card
  }));

  function render() {
    const words = input.value.toLowerCase().trim().split(/\s+/);
    const matches = entries.filter(entry => words.every(word =>
      (entry.name + " " + entry.kind + " " + entry.card.textContent).toLowerCase().includes(word)
    ));
    list.replaceChildren();
    for (const entry of matches) {
      const option = document.createElement("button");
      const kind = document.createElement("small");
      kind.textContent = entry.kind;
      option.type = "button";
      option.append(entry.name, kind);
      option.addEventListener("click", () => {
        finder.close();
        entry.card.click();
        document.querySelector("#dlg input, #dlg textarea, #dlg button")?.focus();
      });
      list.append(option);
    }
    document.querySelector("#finderCount").textContent = matches.length
      ? matches.length + (matches.length === 1 ? " result" : " results")
      : "No matches. Try a different service name.";
  }

  function openFinder() {
    if (document.body.dataset.workspace !== "customer" ||
        document.querySelector("dialog[open], #modal.on")) return;
    input.value = "";
    render();
    finder.showModal();
    input.focus();
  }
  trigger.addEventListener("click", openFinder);
  document.querySelector("#finderClose").addEventListener("click", () => finder.close());
  input.addEventListener("input", render);
  input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      list.firstElementChild?.focus();
    } else if (event.key === "Enter") list.firstElementChild?.click();
  });
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" &&
        document.body.dataset.workspace === "customer") {
      event.preventDefault();
      if (finder.open) finder.close();
      else openFinder();
    }
  });

  if (!window.IntersectionObserver || !Element.prototype.animate) return;
  const revealStyles = {
    heading: [{ clipPath: "inset(0 0 100% 0)", transform: "translateY(5px)" }, { clipPath: "inset(0)", transform: "none" }],
    bar: [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0)" }],
    service: [{ opacity: .52, transform: "translateY(14px) scale(.982)" }, { opacity: 1, transform: "none" }],
    scheme: [{ opacity: .55, transform: "translateX(9px)" }, { opacity: 1, transform: "none" }],
    contact: [{ opacity: .58, transform: "translateY(10px) scale(.988)" }, { opacity: 1, transform: "none" }],
    desk: [{ opacity: .62, transform: "translateY(10px) scale(.985)" }, { opacity: 1, transform: "none" }]
  };
  const observer = new IntersectionObserver(records => {
    const rowCounts = new Map();
    for (const record of records) {
      if (!record.isIntersecting || record.target.closest(".admin-panel-exit")) continue;
      const element = record.target;
      observer.unobserve(element);
      if (reduce.matches) continue;
      const row = Math.round(record.boundingClientRect.top);
      const column = rowCounts.get(row) || 0;
      rowCounts.set(row, column + 1);
      const frames = revealStyles[element.dataset.reveal];
      const motion = element.animate(frames, {
        duration: 295, delay: Math.min(column * 36, 144),
        easing: "cubic-bezier(.22,.85,.24,1)", fill: "backwards"
      });
      motion.id = "rdc-scroll-reveal";
    }
  }, { threshold: .08 });
  const revealTargets = {
    heading: ".head h2, .head p",
    bar: ".desk-rate-track, .report-stack",
    service: "#serviceGrid .box",
    scheme: "#schemeGrid .box",
    contact: "#contact .cbox",
    desk: "#deskRecent, .desk-tools"
  };
  for (const [style, selector] of Object.entries(revealTargets)) {
    for (const element of document.querySelectorAll(selector)) {
      element.dataset.reveal = style;
      observer.observe(element);
    }
  }
  reduce.addEventListener("change", () => {
    if (!reduce.matches) return;
    for (const motion of document.getAnimations?.() ?? []) {
      if (motion.id === "rdc-scroll-reveal") motion.cancel();
    }
  });
})();

for (const nav of document.querySelectorAll("#adminNavigation, #customerTabs")) {
  const marker = document.createElement("span");
  marker.className = "rdc-tab-marker";
  marker.setAttribute("aria-hidden","true");
  nav.append(marker);
  function position() {
    const active = nav.querySelector('[aria-pressed="true"], [aria-current="page"]');
    if (!active || !active.offsetWidth) return;
    const box = active.getBoundingClientRect();
    const parent = nav.getBoundingClientRect();
    marker.style.transform = "translate(" + (box.left-parent.left+box.width/2-9) + "px," + (box.bottom-parent.top-4) + "px)";
  }
  new MutationObserver(position).observe(nav,{subtree:true,attributes:true,attributeFilter:["aria-pressed","aria-current","hidden"]});
  if (window.ResizeObserver) new ResizeObserver(position).observe(nav);
  position();
}

document.getElementById("modal").addEventListener("keydown", event => {
  if (event.key !== "Tab") return;
  const controls = [...event.currentTarget.querySelectorAll("button,input,select,textarea,a[href]")]
    .filter(el => !el.disabled && el.getClientRects().length);
  const first = controls[0], last = controls[controls.length-1];
  if (first && ((event.shiftKey && document.activeElement === first) ||
      (!event.shiftKey && document.activeElement === last))) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
});
