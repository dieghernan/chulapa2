import { expect, test } from "@playwright/test";
import { readContrast } from "./contrast.mjs";

for (const width of [390, 1280]) {
  test(`renders the article header options at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/article/full/");

    // Breadcrumb: listed parents, skipping entries without a URL, then the page.
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByRole("link")).toHaveText(["Articles", "A full article header"]);
    await expect(crumbs.locator("li[aria-current=\"page\"]")).toHaveText("A full article header");
    expect((await readContrast(crumbs.getByRole("link", { name: "Articles" }))).text).toBeGreaterThanOrEqual(4.5);

    // Dates: the modified date first, then the struck-through publication date.
    const dates = page.locator("time");
    await expect(dates).toHaveText(["20 nov 2026", "05 mar 2026"]);
    await expect(dates.nth(0)).toHaveAttribute("datetime", /^2026-11-20/);
    await expect(page.locator("s time")).toHaveAttribute("datetime", /^2026-03-05/);

    // Share links: X and Bluesky always, the others from the sm breakpoint.
    const shares = ["Share on X", "Share on Bluesky", "Share on Facebook", "Share on WhatsApp", "Share on LinkedIn"];
    for (const [index, name] of shares.entries()) {
      const link = page.getByRole("link", { name, exact: true });
      if (width === 390 && index > 1) await expect(link).toBeHidden();
      else await expect(link).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Share on X" })).toHaveAttribute("href", /hashtags=madrid%2Copendata/);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector(".bi-twitter-x"), "::before").content))
      .not.toBe("none");

    // Author card: the page author, with Bootstrap Icons and labels for Font Awesome icons.
    const author = page.getByRole("complementary", { name: "Author" });
    await expect(author.getByRole("link", { name: "Guest Author" })).toHaveAttribute("href", "https://example.com/guest/");
    await expect(author.getByRole("link", { name: "Santiago de Compostela" })).toHaveAttribute("href", /query=Santiago\+de\+Compostela/);
    await expect(author.getByRole("link", { name: "GitHub" }).locator(".bi-github")).toHaveCount(1);
    const missing = author.locator("[data-chulapa-missing-icon]");
    await expect(missing).toHaveText(["Twitter", "Email"]);
    await expect(missing.first()).toHaveAttribute("data-chulapa-missing-icon", "fab fa-twitter");
    await expect(author.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:guest@example.com");
    expect(await page.content()).toContain('<!-- Icon "fab fa-twitter" needs Font Awesome, which is not enabled. -->');

    // The article keeps the eight-column reading width beside the author column.
    const article = await page.locator("main article").boundingBox();
    const aside = await author.boundingBox();
    if (width === 1280) {
      // The row gap separates the author column from the article.
      expect(article.x - (aside.x + aside.width)).toBeCloseTo(24, 0);
      const column = await page.locator(".breadcrumb").boundingBox();
      expect(column.x).toBeCloseTo(article.x, 0);
    } else {
      expect(aside.y + aside.height).toBeLessThanOrEqual(article.y + 1);
      // As in Chulapa: avatar and name on one line, location and links on the next.
      const name = await author.getByRole("link", { name: "Guest Author" }).boundingBox();
      const avatar = await author.locator(".avatar").boundingBox();
      const location = await author.getByRole("link", { name: "Santiago de Compostela" }).boundingBox();
      const github = await author.getByRole("link", { name: "GitHub" }).boundingBox();
      expect(name.y).toBeLessThan(avatar.y + avatar.height);
      expect(location.y).toBeGreaterThanOrEqual(avatar.y + avatar.height);
      expect(Math.abs(github.y + github.height / 2 - (location.y + location.height / 2))).toBeLessThan(6);
    }
  });
}

test("translates the date and falls back to the site author", async ({ page }) => {
  await page.goto("test/article/es/");
  await expect(page.locator("time")).toHaveText("14 ago 2026");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link")).toHaveText(["chulapa2", "Un artículo en español"]);
  const author = page.getByRole("complementary", { name: "Author" });
  await expect(author.getByRole("link", { name: "Fixture Author" })).toBeVisible();
  await expect(author.locator("img")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Share on/ })).toHaveCount(0);
});

test("wraps a long breadcrumb without overflowing on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("test/article/long/");
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link")).toHaveCount(5);
  const list = crumbs.locator("ol");
  expect(await list.evaluate((ol) => ol.scrollWidth <= ol.clientWidth)).toBe(true);
  expect((await list.boundingBox()).height).toBeGreaterThan(60);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // As in Chulapa, the links are inline text: no padding and no hover background.
  const first = crumbs.getByRole("link", { name: "Madrid" });
  await expect(first).toHaveCSS("padding-left", "0px");
  await first.hover();
  await expect(first).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});
