(() => {
  const root = document.documentElement;
  const storageKey = "chulapa2-color-mode";
  const reversed = root.hasAttribute("data-color-mode-reversed");

  function swapMode(mode) {
    // The primary appearance uses the light slot even when the skin is dark.
    if (!reversed || (mode !== "light" && mode !== "dark")) return mode;
    return mode === "light" ? "dark" : "light";
  }

  function applyMode(mode) {
    if (mode === "light" || mode === "dark") {
      root.dataset.bsTheme = mode;
    } else if (mode === "system") {
      delete root.dataset.bsTheme;
    }
  }

  try {
    applyMode(swapMode(localStorage.getItem(storageKey)));
  } catch {
    // Keep the site's primary mode when storage is unavailable.
  }

  document.addEventListener("DOMContentLoaded", () => {
    const control = document.getElementById("site-color-mode-control");
    const select = document.getElementById("site-color-mode");
    if (!control || !select) return;

    select.value = root.dataset.bsTheme ?? "";
    select.addEventListener("change", () => {
      const mode = select.value || "system";
      applyMode(mode);
      try {
        localStorage.setItem(storageKey, swapMode(mode));
      } catch {
        // The selected mode still applies to the current page.
      }
    });
    control.hidden = false;
  }, { once: true });
})();
