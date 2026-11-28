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
    heading: [{ opacity: .45, transform: "translateX(-9px)" }, { opacity: 1, transform: "none" }],
    service: [{ opacity: .52, transform: "translateY(14px) scale(.982)" }, { opacity: 1, transform: "none" }],
    scheme: [{ opacity: .55, transform: "translateX(9px)" }, { opacity: 1, transform: "none" }],
    contact: [{ opacity: .58, transform: "translateY(10px) scale(.988)" }, { opacity: 1, transform: "none" }],
    desk: [{ opacity: .62, transform: "translateY(10px) scale(.985)" }, { opacity: 1, transform: "none" }]
  };
  const observer = new IntersectionObserver(records => {
    let delay = 0;
    for (const record of records) {
      if (!record.isIntersecting) continue;

      if (reduce.matches) continue;
      const element = record.target;
      if (element.closest(".admin-panel-exit")) continue;
      const base = revealStyles[element.dataset.reveal];
      const fromBelow = record.boundingClientRect.top > (record.rootBounds?.height ?? innerHeight) / 2;
      const frames = fromBelow ? base : [
        { ...base[0], transform: base[0].transform.replace(/(-?\d+)px/, (_, value) => -Number(value) + "px") },
        base[1]
      ];
      element.getAnimations?.().find(motion => motion.id === "rdc-scroll-reveal")?.cancel();
      const motion = element.animate(frames, {
        duration: 390, delay: Math.min(delay++ * 33, 132),
        easing: "cubic-bezier(.22,.85,.24,1)", fill: "backwards"
      });
      motion.id = "rdc-scroll-reveal";
    }
  }, { threshold: .08 });
  const revealTargets = {
    heading: "#services .head, #schemes .head, #contact .head",
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
