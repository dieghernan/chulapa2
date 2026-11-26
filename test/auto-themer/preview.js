---
published: false
---

const preview = document.querySelector("#auto-themer");
const picker = document.querySelector("#primary-color");
const toggle = document.querySelector("#generate-palette");

toggle.addEventListener("change", () => {
  preview.dataset.autothemer = toggle.checked;
  picker.disabled = !toggle.checked;
});

picker.addEventListener("input", () => {
  preview.style.setProperty("--auto-themer-primary", picker.value);
});
