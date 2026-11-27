export function colorMode(page) {
  const trigger = page.getByRole("button", { name: /^Color mode(?::|$)/ });
  const menu = page.locator("#site-color-mode-options");
  const selected = menu.locator('[aria-pressed="true"]');

  return {
    trigger,
    selected,
    async choose(mode) {
      await trigger.click();
      const choice = typeof mode === "string"
        ? menu.locator(`[data-color-mode="${mode}"]`)
        : menu.getByRole("button", { name: mode.label, exact: true });
      await choice.click();
    },
  };
}
