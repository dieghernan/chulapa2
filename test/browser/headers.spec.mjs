import { expect, test } from "@playwright/test";
import { colorMode } from "./color-mode-control.mjs";
import { readContrast } from "./contrast.mjs";

for (const width of [390, 1280]) {
  test(`renders base headers with and without a banner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/dual/test/headers/base-image/");

    const header = page.locator(".header-chulapa");
    const heading = page.getByRole("heading", { level: 1, name: "Madrid with a banner" });
    const banner = header.getByRole("img", { name: /Plaza de España Metro entrance/ });
    await expect(heading).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(banner).toHaveAttribute("src", /\/chulapa2\/test\/dual\/test\/_fixtures\/chulapa-madrid-hd\.webp$/);
    await expect.poll(() => banner.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    await expect(banner).toHaveCSS("object-fit", "cover");
    await expect(banner).toHaveCSS("height", "180px");
    await expect(banner).toHaveCSS("width", `${width}px`);
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);

    const toggle = page.getByRole("button", { name: "Toggle navigation" });
    const isCollapsed = await toggle.isVisible();
    if (isCollapsed) await toggle.click();
    await colorMode(page).choose("dark");
    if (isCollapsed) await page.getByRole("button", { name: "Close menu" }).click();
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    expect((await readContrast(heading)).text).toBeGreaterThanOrEqual(4.5);

    await header.getByRole("link", { name: "View the text-only header" }).click();
    await expect(page).toHaveURL(/\/test\/dual\/test\/headers\/base\/$/);
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    await expect(header.getByRole("heading", { level: 1, name: "Madrid without a banner" })).toBeVisible();
    await expect(header.locator(".lead em")).toHaveText("text-only");
    await expect(header.locator("img")).toHaveCount(0);
  });
}
