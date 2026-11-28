// Let the browser own every navigation, including history, downloads and modified clicks.
(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function read(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
  function write(key, value) { try { sessionStorage.setItem(key, value); } catch {} }
  const first = !read("rdc:visited");
  write("rdc:visited", "1");
  root.dataset.visit = first ? "first" : "repeat";
  const backwards = url => /\/(login|aadhaar-print)\.html$/.test(new URL(url, location.href).pathname);
  addEventListener("pageswap", event => {
    if (!event.viewTransition || !event.activation?.entry?.url) return;
    const reverse = backwards(event.activation.entry.url);
    root.dataset.direction = reverse ? "back" : "next";
  });
  addEventListener("pagereveal", event => {
    if (!event.viewTransition) return;
    root.dataset.direction = backwards(location.href) ? "back" : "next";
  });
  addEventListener("pageshow", event => {
    if (event.persisted) {
      delete root.dataset.direction;
      root.classList.remove("rdc-logout", "rdc-enter", "rdc-flight");
      root.dataset.visit = "repeat";
    }
  });
  let entered = false;
  function enter() {
    if (entered) return;
    entered = true;
    root.classList.add("go");
    const fresh = document.body.classList.contains("rdc-dashboard") && read("rdc:sign-in") === "1";
    if (fresh) write("rdc:sign-in", "");
    if (reduced.matches || !document.body.animate) return;
    root.classList.add("rdc-enter");
    const title = document.body.dataset.workspace === "admin"
      ? document.querySelector(".desk-hero h2") : document.querySelector(".hero h1");
    if (!fresh || !title) return;
    root.classList.add("rdc-flight");
    const label = document.createElement("span");
    const text = "Every online service, at one trusted counter";
    const admin = document.body.dataset.workspace === "admin";
    const original = title.textContent;
    if (admin) title.after(label); else title.replaceChildren(label);
    label.setAttribute("aria-label", text);
    const skip = document.createElement("button");
    skip.className = "rdc-skip";
    skip.textContent = "Skip animation";
    document.body.append(skip);
    const started = performance.now();
    let frame;
    function finish() {
      cancelAnimationFrame(frame);
      root.classList.remove("rdc-flight");
      skip.remove();
      if (admin) label.remove(); else title.textContent = original;
      reduced.removeEventListener("change", finish);
    }
    function tick(now) {
      label.textContent = text.slice(0, Math.ceil(text.length * Math.max(0, now - started - 180) / 650));
      if (now - started >= 1100) finish(); else frame = requestAnimationFrame(tick);
    }
    reduced.addEventListener("change", finish);
    skip.onclick = finish;
    frame = requestAnimationFrame(tick);
  }
  addEventListener("rdc:dashboard-ready", enter);
  document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains("rdc-dashboard")) enter();
  });
})();
