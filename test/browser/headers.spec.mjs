import { expect, test } from "@playwright/test";
import { colorMode } from "./color-mode-control.mjs";
import { readContrast } from "./contrast.mjs";

async function selectDarkMode(page) {
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  const isCollapsed = await toggle.isVisible();
  if (isCollapsed) await toggle.click();
  await colorMode(page).choose("dark");
  if (isCollapsed) await page.getByRole("button", { name: "Close menu" }).click();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
}

async function expectEditorialColumn(page, fraction) {
  const readingColumn = await page.locator("main article").evaluate((article) => ({
    article: article.getBoundingClientRect().width,
    row: article.parentElement.getBoundingClientRect().width,
    gap: parseFloat(getComputedStyle(article.parentElement).columnGap),
  }));
  const { article, row, gap } = readingColumn;
  expect((article + gap) / (row + gap)).toBeCloseTo(fraction, 3);
  const divider = await page.locator(".chulapa-header hr").boundingBox();
  const paragraph = await page.locator("main article p").first().boundingBox();
  expect(divider.x).toBeCloseTo(paragraph.x, 0);
  expect(divider.width).toBeCloseTo(paragraph.width, 0);
}

for (const width of [390, 1280]) {
  test(`renders base headers with and without a banner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/dual/test/headers/base-image/");

    const header = page.locator(".chulapa-header");
    const heading = page.getByRole("heading", { level: 1, name: "Madrid with a banner" });
    const banner = header.getByRole("img", { name: /Plaza Mayor in Madrid/ });
    await expect(heading).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(banner).toHaveAttribute("src", /\/chulapa2\/test\/dual\/test\/_fixtures\/juan-gomez-XO3v5IAeAR4-unsplash\.jpg$/);
    await expect.poll(() => banner.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    await expect(banner).toHaveCSS("object-fit", "cover");
    await expect(banner).toHaveCSS("height", "180px");
    await expect(banner).toHaveCSS("width", `${width}px`);
    await expect(heading).toHaveCSS("text-align", "center");
    await expectEditorialColumn(page, width === 390 ? 1 : 8 / 12);
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);
    await expect(heading).toHaveCSS("font-size", width === 390 ? "37.75px" : "48px");
    // Chulapa leaves 1.5rem between the banner and the title.
    const gap = (await heading.boundingBox()).y - ((await banner.boundingBox()).y + (await banner.boundingBox()).height);
    expect(gap).toBeCloseTo(24, 0);
    const project = header.getByRole("link", { name: "View the text-only header" });
    await expect(project).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    expect((await readContrast(project)).text).toBeGreaterThanOrEqual(4.5);

    await selectDarkMode(page);
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);

    await project.click();
    await expect(page).toHaveURL(/\/test\/dual\/test\/headers\/base\/$/);
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    await expect(header.getByRole("heading", { level: 1, name: "Madrid without a banner" })).toBeVisible();
    await expect(header.locator(".chulapa-subtitle em")).toHaveText("text-only");
    await expect(header.locator("img")).toHaveCount(0);
  });

  test(`renders post headers with and without a banner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/dual/test/headers/post-image/");

    const header = page.locator(".chulapa-header");
    const heading = page.getByRole("heading", { level: 1, name: "A morning at the market" });
    const banner = header.getByRole("img", { name: /Mercado de San Miguel/ });
    await expect(heading).toBeVisible();
    await expect(heading.locator("em")).toHaveText("market");
    await expect(page).toHaveTitle("A morning at the market · chulapa2");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(heading).toHaveCSS("text-align", "start");
    await expect(banner).toHaveAttribute("src", /\/chulapa2\/test\/dual\/test\/_fixtures\/bas-van-der-linden-m9GyQa8Ylmo-unsplash\.jpg$/);
    await expect.poll(() => banner.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    await expect(banner).toHaveCSS("object-fit", "cover");
    await expect(banner).toHaveCSS("height", "180px");
    await expect(banner).toHaveCSS("width", `${width}px`);
    await expectEditorialColumn(page, width === 390 ? 1 : 8 / 12);
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);

    await selectDarkMode(page);
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);

    await header.getByRole("link", { name: "View the text-only post header" }).click();
    await expect(page).toHaveURL(/\/test\/dual\/test\/headers\/post\/$/);
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    await expect(heading).toBeVisible();
    await expect(header.locator(".chulapa-subtitle em")).toHaveText("text-only");
    await expect(header.locator("img")).toHaveCount(0);
    await expectEditorialColumn(page, width === 390 ? 1 : 8 / 12);
  });

  test(`renders image headers with and without a photo at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/dual/test/headers/image-photo/");

    const header = page.locator(".chulapa-header");
    const heading = header.getByRole("heading", { level: 1, name: "A view of Plaza Mayor" });
    const photo = header.getByRole("img", { name: /Plaza Mayor in Madrid/ });
    await expect(heading).toHaveCSS("text-align", "center");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(photo).toHaveAttribute("src", /\/chulapa2\/test\/dual\/test\/_fixtures\/juan-gomez-XO3v5IAeAR4-unsplash\.jpg$/);
    await expect.poll(() => photo.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    const intrinsicRatio = await photo.evaluate((image) => image.naturalWidth / image.naturalHeight);
    const bounds = await photo.boundingBox();
    expect(bounds.width / bounds.height).toBeCloseTo(intrinsicRatio, 2);
    expect(bounds.height).toBeCloseTo(width === 390 ? 270 : 225, 0);
    expect(bounds.x + bounds.width / 2).toBeCloseTo(width / 2, 0);
    await expectEditorialColumn(page, width === 390 ? 1 : 8 / 12);
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);

    await selectDarkMode(page);
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);

    await header.getByRole("link", { name: "View the image header without a photo" }).click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/test\/dual\/test\/headers\/image\/$/);
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    await expect(heading).toBeVisible();
    await expect(header.locator(".chulapa-subtitle em")).toHaveText("without a photo");
    await expect(header.locator("img")).toHaveCount(0);
    await expectEditorialColumn(page, width === 390 ? 1 : 8 / 12);
  });

  test(`renders hero headers with and without a photo at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/gitdev/test/headers/hero-photo/", { waitUntil: "domcontentloaded" });

    const hero = page.locator(".chulapa-hero");
    const heading = hero.getByRole("heading", { level: 1, name: "A visit to the market" });
    const photo = hero.getByRole("img", { name: /Mercado de San Miguel/ });
    const projects = hero.locator(".chulapa-btn-project");
    await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(heading).toHaveCSS("text-shadow", /rgb\(0, 0, 0\)/);
    await expect(hero.locator("hr")).toHaveCSS("border-top-color", "rgb(255, 255, 255)");
    await expect(hero).toHaveCSS("min-block-size", "360px");
    await expect(photo).toHaveAttribute("src", /\/test\/gitdev\/test\/_fixtures\/bas-van-der-linden-m9GyQa8Ylmo-unsplash\.jpg$/);
    await expect.poll(() => photo.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    await expect(photo).toHaveCSS("object-fit", "cover");
    await expect(photo).toHaveCSS("width", `${width}px`);
    expect(await hero.evaluate((node) => getComputedStyle(node, "::after").backgroundColor))
      .toBe("rgba(0, 0, 0, 0.6)");
    await expect(projects.first()).toHaveCSS("border-top-color", "rgb(255, 255, 255)");
    // Chulapa's project links form one vertical group of equal-width buttons.
    await expect(hero.getByRole("group")).toHaveClass(/\bbtn-group-vertical\b/);
    const widths = await projects.evaluateAll((links) => links.map((link) => link.getBoundingClientRect().width));
    expect(new Set(widths).size).toBe(1);
    await expect(projects.first()).toHaveClass(/\bbtn-lg\b/);
    await expect(heading).toHaveCSS("font-weight", "800");
    await expect(heading).toHaveCSS("font-size", width === 390 ? "51.5px" : "64px");

    await selectDarkMode(page);
    await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
    await projects.first().click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/test\/gitdev\/test\/headers\/hero\/$/);
    await expect(hero.locator("img")).toHaveCount(0);
    await expect(hero).toHaveCSS("background-color", "rgb(36, 41, 47)");
    await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(heading).toHaveCSS("text-shadow", "none");
    const project = hero.getByRole("link", { name: "View the hero with a photo" });
    await expect(project).toHaveCSS("border-top-color", "rgb(255, 255, 255)");
    expect((await readContrast(hero.locator(".chulapa-subtitle"))).text).toBeGreaterThanOrEqual(4.5);
    await project.hover();
    await expect(project).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(project).toHaveCSS("color", "rgb(36, 41, 47)");
    await page.keyboard.press("Tab");
    await project.focus();
    const focused = await readContrast(project);
    expect(focused.showsFocus).toBe(true);
    expect(focused.focus).toBeGreaterThanOrEqual(3);
  });
}

test("preserves hero skin colors and resolves legacy YAML aliases", async ({ page }) => {
  // The title uses each skin's heading weight. Focal keeps its display font.
  for (const [skin, background, foreground, weight, font] of [
    ["academia", [11, 53, 100], "rgb(255, 255, 255)", "500"],
    ["twitter", [29, 155, 240], "rgb(0, 0, 0)", "800"],
    ["hootstrap", [82, 128, 120], "rgb(0, 0, 0)", "500"],
    ["mickie", [246, 100, 140], "rgb(0, 0, 0)", "500"],
    ["wandoo", [255, 48, 79], "rgb(0, 0, 0)", "500"],
    ["listen", [18, 18, 18], "rgb(193, 194, 194)", "800"],
    ["media", [255, 255, 255], "rgb(36, 36, 36)", "900"],
    ["skeeblu", [39, 162, 252], "rgb(239, 239, 239)", "500"],
    ["gitdev", [34, 39, 46], "rgb(255, 255, 255)", "800"],
    ["towards", [53, 88, 118], "rgb(255, 255, 255)", "700"],
    ["focal", [38, 38, 38], "rgb(255, 255, 255)", "600", /^"Fira Sans"/],
  ]) {
    await page.goto(`test/skins/${skin}/test/headers/hero/`, { waitUntil: "domcontentloaded" });
    const hero = page.locator(".chulapa-hero");
    const surface = await hero.evaluate((node) => {
      const canvas = document.createElement("canvas").getContext("2d");
      canvas.fillStyle = getComputedStyle(node).backgroundColor;
      canvas.fillRect(0, 0, 1, 1);
      return [...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3);
    });
    expect(surface, skin).toEqual(background);
    const heading = hero.getByRole("heading", { level: 1 });
    await expect(heading, skin).toHaveCSS("color", foreground);
    await expect(heading, skin).toHaveCSS("font-weight", weight);
    if (font) await expect(heading, skin).toHaveCSS("font-family", font);
    await expect(hero.locator("hr"), skin).toHaveCSS("border-top-color", foreground);
    expect((await readContrast(hero.locator(".chulapa-subtitle"))).text, skin).toBeGreaterThanOrEqual(skin === "skeeblu" ? 2.3 : 4.5);
  }

  await page.goto("test/tokens/test/headers/hero/", { waitUntil: "domcontentloaded" });
  const hero = page.locator(".chulapa-hero");
  await expect(hero).toHaveCSS("background-color", "rgb(22, 65, 73)");
  await expect(hero).toHaveCSS("color", "rgb(255, 240, 181)");
  await selectDarkMode(page);
  await expect(hero).toHaveCSS("background-color", "rgb(24, 38, 55)");
  await expect(hero).toHaveCSS("color", "rgb(244, 232, 209)");
});
