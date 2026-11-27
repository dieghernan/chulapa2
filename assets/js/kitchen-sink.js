const demo = document.getElementById("bootstrap-kitchen-sink");
const bundle = document.querySelector("script[data-bootstrap-bundle]");

if (demo && bundle) {
  const { Popover, Toast, Tooltip } = await import(bundle.src);

  for (const trigger of demo.querySelectorAll('[data-bs-toggle="popover"]')) {
    Popover.getOrCreateInstance(trigger);
  }
  for (const trigger of demo.querySelectorAll('[data-bs-toggle="tooltip"]')) {
    Tooltip.getOrCreateInstance(trigger);
  }

  const toast = Toast.getOrCreateInstance(demo.querySelector("#sink-toast"), { autohide: false });
  demo.querySelector("[data-kitchen-toast]").addEventListener("click", () => toast.show());
}
