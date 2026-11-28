// Older embedded Chromium versions support append() but lack replaceChildren().
if (!Element.prototype.replaceChildren) {
  Object.defineProperty(Element.prototype, "replaceChildren", {
    configurable: true, writable: true,
    value: function (...children) {
      this.textContent = "";
      this.append(...children);
    }
  });
}
