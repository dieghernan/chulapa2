import { expect, test } from "@playwright/test";

test("loads the local Bootstrap and Chulapa assets and renders Markdown", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto("test/markdown/");
  await expect(page).toHaveTitle("Markdown fixture · chulapa2");
  await expect(page.getByRole("heading", { level: 1, name: "Markdown fixture" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Article content" })).toBeVisible();
  await expect(page.locator("main strong")).toHaveText("strong text");
  await expect(page.getByRole("cell", { name: "HTML", exact: true })).toBeVisible();
  await expect(page.locator("main pre")).toContainText("<article>Example</article>");

  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav).toHaveCSS("display", "flex");
  const brand = nav.getByRole("link", { name: "chulapa2" });
  await expect(brand).toHaveCSS("font-family", "Chulapa, sans-serif");
  await expect(brand).toHaveCSS("font-variant-ligatures", "common-ligatures discretionary-ligatures");
  expect(await page.evaluate(async () => {
    const fonts = await document.fonts.load('700 1rem "Chulapa"');
    return fonts.some((font) => font.status === "loaded");
  })).toBe(true);

  await page.getByRole("link", { name: "link to the home page" }).click();
  await expect(page).toHaveURL(/\/chulapa2\/$/);
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  expect(errors).toEqual([]);
});

test("supports desktop keyboard navigation and skips to the main content", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav.getByRole("button", { name: "Toggle navigation" })).toBeHidden();
  await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
  await nav.getByRole("link", { name: "About" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#about$/);
});

test("opens and dismisses the mobile drawer with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  const drawer = page.getByRole("dialog", { name: "Menu" });
  await expect(toggle).toBeVisible();
  await expect(drawer).toBeHidden();

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(drawer.getByRole("link", { name: "Home" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(drawer.getByRole("link", { name: "About" })).toBeFocused();
  await page.keyboard.press("Tab");
  const select = drawer.getByRole("combobox", { name: "Color mode" });
  await expect(select).toBeFocused();
  await select.press("End");
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(toggle).toBeFocused();
});
