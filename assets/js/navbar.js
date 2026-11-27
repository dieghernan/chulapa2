const header = document.getElementById("site-header");
if (header) {
  new ResizeObserver(() => {
    document.documentElement.style.setProperty("--chulapa-navbar-height", `${header.offsetHeight}px`);
  }).observe(header);
}

const drawer = document.getElementById("primary-menu");
const closeButton = drawer?.querySelector('[data-bs-dismiss="drawer"]');

if (closeButton) {
  drawer.addEventListener("click", (event) => {
    if (!drawer.open || event.defaultPrevented || event.button !== 0 ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const link = event.target.closest("a[href]");
    if (!link) return;

    const destination = new URL(link.href);
    const current = window.location;
    if (!destination.hash || destination.origin !== current.origin ||
        destination.pathname !== current.pathname || destination.search !== current.search) return;

    event.preventDefault();
    drawer.addEventListener("hidden.bs.drawer", () => {
      current.hash = destination.hash;
    }, { once: true });
    closeButton.click();
  });
}
