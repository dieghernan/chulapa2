(() => {
  const root = document.documentElement;
  const storageKey = "chulapa2-color-mode";
  const reversed = root.hasAttribute("data-color-mode-reversed");
  let mode = root.dataset.bsTheme || "light";

  function swapMode(value) {
    // The primary appearance uses the light slot even when the skin is dark.
    if (!reversed || (value !== "light" && value !== "dark")) return value;
    return value === "light" ? "dark" : "light";
  }

  function applyMode() {
    if (mode === "system") {
      delete root.dataset.bsTheme;
    } else {
      root.dataset.bsTheme = mode;
    }
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark") mode = swapMode(stored);
    if (stored === "system" || stored === "auto") mode = "system";
  } catch {
    // Keep the site's primary mode when storage is unavailable.
  }
  applyMode();

  document.addEventListener("DOMContentLoaded", () => {
    const control = document.getElementById("site-color-mode-control");
    if (!control) return;
    const trigger = document.getElementById("site-color-mode");
    const icon = document.getElementById("site-color-mode-icon");
    const choices = control.querySelectorAll("[data-color-mode]");

    function updateMenu() {
      for (const choice of choices) {
        const selected = choice.dataset.colorMode === mode;
        choice.classList.toggle("active", selected);
        choice.setAttribute("aria-pressed", selected);
        if (selected) {
          icon.className = choice.querySelector(".bi").className;
          trigger.setAttribute("aria-label", `Color mode: ${choice.textContent.trim()}`);
        }
      }
    }

    for (const choice of choices) {
      choice.addEventListener("click", () => {
        mode = choice.dataset.colorMode;
        applyMode();
        updateMenu();
        try {
          localStorage.setItem(storageKey, swapMode(mode));
        } catch {
          // The selected mode still applies to the current page.
        }
        trigger.focus();
      });
    }

    updateMenu();
    control.hidden = false;
  }, { once: true });
})();
