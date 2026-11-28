import { expect, test } from "@playwright/test";
import { colorMode } from "./color-mode-control.mjs";

test("loads Bootstrap from the CDN and renders Markdown with the Chulapa font", async ({ page }) => {
  const errors = [];
  const loaded = new Set();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.ok()) loaded.add(response.url());
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto("test/markdown/");
  const cdn = "https://cdn.jsdelivr.net/npm/bootstrap@";
  const stylesheet = page.locator(`link[href^="${cdn}"][href$="/css/bootstrap.min.css"]`);
  const script = page.locator(`script[src^="${cdn}"][src$="/js/bootstrap.bundle.min.js"]`);
  for (const [element, attribute] of [[stylesheet, "href"], [script, "src"]]) {
    await expect(element).toHaveAttribute("integrity", /^sha384-/);
    await expect(element).toHaveAttribute("crossorigin", "anonymous");
    expect(loaded.has(await element.getAttribute(attribute))).toBe(true);
  }

  await expect(page).toHaveTitle("Markdown fixture · chulapa2");
  await expect(page.getByRole("heading", { level: 1, name: "Markdown fixture" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Article content" })).toBeVisible();
  await expect(page.locator("main strong")).toHaveText("strong text");
  await expect(page.getByRole("cell", { name: "HTML", exact: true })).toBeVisible();
  await expect(page.locator("main pre")).toContainText("<article>Example</article>");

  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav).toHaveCSS("display", "flex");
  const brand = nav.getByRole("link", { name: "chulapa2" });
  await expect(brand.locator(".chulapa")).toHaveCSS("font-family", "Chulapa, sans-serif");
  await expect(brand.locator(".chulapa"))
    .toHaveCSS("font-variant-ligatures", "common-ligatures discretionary-ligatures");
  expect(await page.evaluate(async () => {
    const fonts = await document.fonts.load('700 1rem "Chulapa"');
    return fonts.some((font) => font.status === "loaded");
  })).toBe(true);

  const attribution = page.getByRole("contentinfo").getByRole("link", { name: "chulapa2 Jekyll Theme" });
  await expect(attribution).toHaveAttribute("href", "https://dieghernan.github.io/chulapa2/");
  await expect(attribution.locator(".chulapa")).toHaveCSS("font-family", "Chulapa, sans-serif");
  await expect(attribution.locator(".chulapa"))
    .toHaveCSS("font-variant-ligatures", "common-ligatures discretionary-ligatures");

  await page.getByRole("link", { name: "link to the home page" }).click();
  await expect(page).toHaveURL(/\/chulapa2\/$/);
  await expect(page).toHaveTitle("chulapa2");
  await expect(page.getByRole("main").getByRole("heading", { level: 1 }).locator(".chulapa"))
    .toHaveText("chulapa2");
  // As in Chulapa, the site sets its wordmark through footer.copyright.
  await expect(page.getByRole("contentinfo").locator("p", { hasText: "©" }).locator(".chulapa"))
    .toHaveText("chulapa2");
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  expect(errors).toEqual([]);
});

test("supports desktop keyboard navigation and skips to the main content", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#chulapa-content")).toBeFocused();

  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav.getByRole("button", { name: "Toggle navigation" })).toBeHidden();
  await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
  await nav.getByRole("link", { name: "About" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#about$/);
});

test("keeps the header on minimal pages that supply their own main element", async ({ page }) => {
  await page.goto("test/minimal-header/");
  await expect(page.locator(".chulapa-header").getByRole("heading", { level: 1 }))
    .toHaveText("Minimal page with a header");
  await expect(page.locator("#chulapa-content")).toHaveCount(1);
});

test("renders one header when a layout sets header_in_content", async ({ page }) => {
  await page.goto("test/default-show-header/");
  await expect(page.locator(".chulapa-header")).toHaveCount(1);
  await expect(page.locator("#chulapa-content")).toHaveCount(1);
});

test("emits a readable head and footer", async ({ request }) => {
  // The html-style rule: one element per line, indented by nesting, no blank lines.
  for (const path of ["", "test/markdown/", "test/tokens/", "test/dual/test/headers/hero-photo/"]) {
    const html = await (await request.get(path)).text();
    for (const [open, close, indent] of [["<head>", "</head>", 2], ["<footer", "</footer>", 4]]) {
      const start = html.lastIndexOf("\n", html.indexOf(open)) + 1;
      const block = html.slice(start, html.indexOf(close, start) + close.length).split(/\r?\n/);
      expect(block.filter((line) => line.trim() === ""), `${path} ${open} blank lines`).toEqual([]);
      expect(block[0].length - block[0].trimStart().length, `${path} ${open} indent`).toBe(indent);
      expect(block.at(-1).trim(), `${path} ${close}`).toBe(close);
      expect(block.at(-1).length - block.at(-1).trimStart().length, `${path} ${close} indent`).toBe(indent);
      const inner = block.slice(1, -1).filter((line) => !line.trimStart().startsWith("integrity="));
      for (const line of inner) {
        const depth = line.length - line.trimStart().length;
        expect(depth > indent && depth % 2 === 0, `${path} ${open}: ${line.trim()}`).toBe(true);
      }
    }
  }
});

test("renders the minimal shell with a configured classic navbar and footer", async ({ page }) => {
  await page.setViewportSize({ width: 980, height: 900 });
  await page.goto("test/tokens/test/minimal/");
  await expect(page).toHaveTitle("Minimal fixture · chulapa2");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A full-width page");
  await expect(page.locator("main article")).toHaveCount(0);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#chulapa-content")).toBeFocused();

  const navbar = page.getByRole("navigation", { name: "Primary", exact: true });
  const brand = navbar.getByRole("link", { name: "Demo brand" });
  const toggle = navbar.getByRole("button", { name: "Toggle navigation" });
  const submenu = navbar.getByRole("button", { name: "Examples" });
  await expect(brand).toHaveAttribute("href", /\/chulapa2\/test\/tokens\/test\/minimal\/$/);
  await expect(brand.locator("img")).toHaveAttribute("src", /\/chulapa2\/test\/tokens\/assets\/img\/kitchen-sink\/harbor\.webp$/);
  await expect(toggle).toBeVisible();
  await toggle.press("Enter");
  const drawer = page.getByRole("dialog", { name: await brand.innerText(), exact: true });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("heading", { name: "Demo brand", exact: true })).toBeVisible();
  await expect(drawer.getByRole("link", { name: "About" }).locator("span")).toHaveText("About");
  await expect(submenu.locator("em")).toHaveText("Examples");
  await submenu.press("Enter");
  const submenuItem = drawer.getByRole("link", { name: "Minimal example" });
  await expect(submenuItem.locator("span")).toHaveText("Minimal example");
  await expect(submenuItem).toHaveAttribute("aria-current", "page");
  const navBackground = await navbar.evaluate((nav) => getComputedStyle(nav).backgroundColor);
  await expect(navbar.locator(".menu").filter({ has: page.getByText("Minimal example") }))
    .toHaveCSS("background-color", navBackground);
  await page.keyboard.press("ArrowDown");
  await expect(submenuItem).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(submenu).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();

  await page.setViewportSize({ width: 1040, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(submenu).toBeVisible();
  await expect(submenu).toHaveClass(/\bactive\b/);
  const alignment = await navbar.evaluate((nav) => {
    const bounds = nav.getBoundingClientRect();
    const links = nav.querySelector(".navbar-nav").getBoundingClientRect();
    return links.x > bounds.x + bounds.width / 2;
  });
  expect(alignment).toBe(true);

  const footer = page.getByRole("contentinfo");
  await expect(footer.locator("strong")).toHaveText("Chulapa");
  await expect(footer.getByRole("link", { name: "Fixture home" }))
    .toHaveAttribute("href", /\/chulapa2\/test\/tokens\/$/);
  await expect(footer.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:fixture@example.com");
  // Footer icons: Bootstrap Icons render, Font Awesome falls back to the label.
  await expect(footer.getByRole("link", { name: "Fixture home" }).locator(".bi-house-door")).toBeVisible();
  await expect(footer.getByRole("link", { name: "Email" }).locator("[data-chulapa-missing-icon]"))
    .toHaveText("Email");
  const navbarBackground = () => navbar.evaluate((nav) => getComputedStyle(nav).backgroundColor);
  await expect(footer).toHaveCSS("background-color", "rgb(13, 17, 23)");
  await colorMode(page).choose("dark");
  await expect(footer).toHaveCSS("background-color", await navbarBackground());
});

test("opens and dismisses the mobile drawer with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("test/themed/");

  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  const drawer = page.getByRole("dialog", { name: "chulapa2", exact: true });
  await expect(toggle).toBeVisible();
  await expect(drawer).toBeHidden();

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(drawer).toBeVisible();
  const title = drawer.getByRole("heading", { name: "chulapa2", exact: true }).locator(".chulapa");
  await expect(title).toHaveCSS("font-family", "Chulapa, sans-serif");
  await expect(title).toHaveCSS("font-variant-ligatures", "common-ligatures discretionary-ligatures");
  await expect(drawer.locator(".navbar-nav")).toHaveCSS("text-align", "start");
  await expect(drawer.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(drawer.getByRole("link", { name: "Home" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(drawer.getByRole("link", { name: "About" })).toBeFocused();
  await page.keyboard.press("Tab");
  const themeToggle = colorMode(page).trigger;
  await expect(themeToggle).toBeFocused();
  await themeToggle.press("Enter");
  await expect(themeToggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await expect(drawer.getByRole("button", { name: "Light theme", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(drawer.getByRole("button", { name: "Dark theme", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
  await expect(themeToggle).toBeFocused();
  await expect(themeToggle).toHaveAttribute("aria-expanded", "false");
  await expect(drawer.locator("#site-color-mode-icon")).toHaveClass("bi bi-moon-stars-fill");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("closes the classic mobile drawer before following an in-page link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  await nav.getByRole("button", { name: "Toggle navigation" }).click();
  const drawer = page.getByRole("dialog", { name: "chulapa2", exact: true });
  await drawer.getByRole("link", { name: "About" }).click();
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/#about$/);
  await expect.poll(() => page.evaluate(() =>
    document.getElementById("about").getBoundingClientRect().top >=
    document.getElementById("site-header").getBoundingClientRect().bottom - 1,
  )).toBe(true);
});
