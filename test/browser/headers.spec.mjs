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
  const divider = await page.locator(".header-chulapa hr").boundingBox();
  const paragraph = await page.locator("main article p").first().boundingBox();
  expect(divider.x).toBeCloseTo(paragraph.x, 0);
  expect(divider.width).toBeCloseTo(paragraph.width, 0);
}

for (const width of [390, 1280]) {
  test(`renders base headers with and without a banner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/dual/test/headers/base-image/");

    const header = page.locator(".header-chulapa");
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

    await selectDarkMode(page);
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);

    await header.getByRole("link", { name: "View the text-only header" }).click();
    await expect(page).toHaveURL(/\/test\/dual\/test\/headers\/base\/$/);
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    await expect(header.getByRole("heading", { level: 1, name: "Madrid without a banner" })).toBeVisible();
    await expect(header.locator(".lead em")).toHaveText("text-only");
    await expect(header.locator("img")).toHaveCount(0);
  });

  test(`renders post headers with and without a banner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/dual/test/headers/post-image/");

    const header = page.locator(".header-chulapa");
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
    await expect(header.locator(".lead em")).toHaveText("text-only");
    await expect(header.locator("img")).toHaveCount(0);
    await expectEditorialColumn(page, width === 390 ? 1 : 8 / 12);
  });

  test(`renders image headers with and without a photo at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/dual/test/headers/image-photo/");

    const header = page.locator(".header-chulapa");
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
    await expect(header.locator(".lead em")).toHaveText("without a photo");
    await expect(header.locator("img")).toHaveCount(0);
    await expectEditorialColumn(page, width === 390 ? 1 : 8 / 12);
  });
}
