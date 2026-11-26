(() => {
  const root = document.documentElement;
  const storageKey = "chulapa2-color-mode";

  function applyMode(mode) {
    if (mode === "light" || mode === "dark") {
      root.dataset.bsTheme = mode;
    } else {
      delete root.dataset.bsTheme;
    }
  }

  try {
    applyMode(localStorage.getItem(storageKey));
  } catch {
    // Bootstrap follows the system preference when storage is unavailable.
  }

  document.addEventListener("DOMContentLoaded", () => {
    const control = document.getElementById("site-color-mode-control");
    const select = document.getElementById("site-color-mode");
    if (!control || !select) return;

    select.value = root.dataset.bsTheme ?? "";
    select.addEventListener("change", () => {
      applyMode(select.value);
      try {
        if (select.value) {
          localStorage.setItem(storageKey, select.value);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch {
        // The selected mode still applies to the current page.
      }
    });
    control.hidden = false;
  }, { once: true });
})();
