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

  const observer = new IntersectionObserver(records => {
    let delay = 0;
    for (const record of records) {
      if (!record.isIntersecting) continue;
      observer.unobserve(record.target);
      if (reduce.matches) continue;
      record.target.animate([
        {opacity:.3, transform:"translateY(20px) rotate(-1deg)"},
        {opacity:1, transform:"none"}
      ], {duration:420, delay:Math.min(delay++ * 34, 160), easing:"cubic-bezier(.2,.85,.2,1)", fill:"backwards"});
    }
  }, {threshold:.07});
  for (const element of document.querySelectorAll(".box,.desk-card,.cbox")) observer.observe(element);
})();
