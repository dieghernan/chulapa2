import { expect, test } from "@playwright/test";
import { colorMode } from "./color-mode-control.mjs";

const light = {
  background: "rgb(246, 248, 250)",
  keyword: "rgb(207, 34, 46)",
};
const dark = {
  background: "rgb(13, 17, 23)",
  keyword: "rgb(255, 123, 114)",
};
const fallback = {
  background: "rgb(248, 248, 248)",
  keyword: "rgb(0, 128, 0)",
};

function codeSample(page) {
  const block = page.locator("#surfaces .highlight pre");
  const keyword = block.locator(".k").filter({ hasText: /^def$/ });
  return { block, keyword };
}

async function expectPalette(sample, palette) {
  await expect(sample.block).toHaveCSS("background-color", palette.background);
  await expect(sample.keyword).toHaveCSS("color", palette.keyword);
}

async function expectReadableCode(sample) {
  const contrast = await sample.block.evaluate((block) => {
    function luminance(css) {
      const rgb = css.match(/\d+/g).slice(0, 3).map((value) => Number(value) / 255);
      const [red, green, blue] = rgb.map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      );
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }
    const background = luminance(getComputedStyle(block).backgroundColor);
    return [block, ...block.querySelectorAll(".k, .s2, .c1")].map((token) => {
      const foreground = luminance(getComputedStyle(token).color);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
  });
  expect(contrast.length).toBeGreaterThan(3);
  expect(Math.min(...contrast)).toBeGreaterThanOrEqual(4.5);
}

test("styles Kramdown code with the selected GitHub palette in each mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("test/gitdev/");
  const sample = codeSample(page);
  const themeMenu = colorMode(page);
  await expect(themeMenu.selected).toHaveAttribute("data-color-mode", "light");
  await expectPalette(sample, light);
  await expectReadableCode(sample);
  await themeMenu.choose("system");
  await expectPalette(sample, dark);
  await expectReadableCode(sample);
  await page.emulateMedia({ colorScheme: "light" });
  await expectPalette(sample, light);
  await themeMenu.choose("dark");
  await page.reload();
  await expectPalette(sample, dark);
  await page.goto("test/gitdev/test/markdown/");
  await expect(page.locator(".language-html.highlighter-rouge .highlight pre"))
    .toHaveCSS("background-color", dark.background);
});

test("inherits the primary highlighter when the dark setting is omitted", async ({ page }) => {
  await page.goto("test/gitdev-dual/");
  const sample = codeSample(page);
  await expectPalette(sample, light);
  await colorMode(page).choose("dark");
  await expectPalette(sample, light);
  await expect(sample.block).toHaveCSS("color", "rgb(36, 41, 47)");
});

test("uses the default stylesheet for unset or unknown highlighters", async ({ page }) => {
  for (const url of ["./", "test/primary/"]) {
    await page.goto(url);
    await expectPalette(codeSample(page), fallback);
    await expect(page.locator('link[href$="/assets/css/highlighter.css"]')).toHaveCount(1);
  }
});
