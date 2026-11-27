import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { colorMode } from "./color-mode-control.mjs";
import { readContrasts } from "./contrast.mjs";

const authored = JSON.parse(readFileSync(new URL("./skin-identity.json", import.meta.url)));
const navbarIdentity = JSON.parse(readFileSync(new URL("./skin-navbar-identity.json", import.meta.url)));
const topHat = JSON.parse(readFileSync(new URL("./tophat-identity.json", import.meta.url)));
const topHatContrast = JSON.parse(readFileSync(new URL("./tophat-contrast.json", import.meta.url)));
const identity = {
  ...authored,
  ...Object.fromEntries(Object.entries(topHat).map(([name, vars]) => [name, vars["--bs-primary-base"]])),
};
const catalog = readFileSync(new URL("../../_includes/skins/catalog.html", import.meta.url), "utf8")
  .trim().split(/\r?\n/).map((row) => row.split("|"));
const footerBackgrounds = {
  gitdev: "rgb(13, 17, 23)",
  media: "rgb(36, 36, 36)",
};
const skeebluFooterContrast = {
  "normal/footer-copy/text": 2.38,
  "normal/footer-attribution/text": 1.30,
  "hover/footer-attribution/text": 1.22,
  "focus/footer-attribution/text": 1.22,
  "active/footer-attribution/text": 1.22,
};

test.use({ reducedMotion: "reduce" });
test.describe.configure({ mode: "parallel" });

test("registers exactly the skins with a recorded identity", () => {
  expect(catalog.map(([name]) => name).sort()).toEqual(Object.keys(identity).sort());
  expect(Object.keys(navbarIdentity).sort()).toEqual(Object.keys(identity).sort());
});

async function audit(page, context, exceptions = {}) {
  const navigation = page.getByRole("navigation", { name: "Primary", exact: true });
  const toggle = navigation.getByRole("button", { name: "Toggle navigation" });
  if (await toggle.isVisible()) await toggle.click();
  const navLink = navigation.getByRole("link", { name: "About" });
  await expect(navLink).toBeVisible();
  await navLink.evaluate((link) => { link.dataset.contrast = "navigation-link"; });
  const footer = page.getByRole("contentinfo");
  await footer.locator(".chulapa-footer-brand").evaluate((copy) => { copy.dataset.contrast = "footer-copy"; });
  await footer.locator(".chulapa-footer-brand a").evaluate((link) => { link.dataset.contrast = "footer-attribution"; });
  const fixture = page.locator("[data-contrast]");
  const interactive = "[data-contrast]:is(button, a, input)";
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("DOM.enable");
    await session.send("CSS.enable");
    const { root } = await session.send("DOM.getDocument");
    const { nodeIds } = await session.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: interactive });
    const failures = [];
    for (const [state, pseudoClasses] of Object.entries({
      normal: [],
      hover: ["hover"],
      focus: ["focus", "focus-visible"],
      active: ["hover", "active"],
    })) {
      await Promise.all(nodeIds.map((nodeId) => session.send("CSS.forcePseudoState", {
        nodeId, forcedPseudoClasses: pseudoClasses,
      })));
      const readings = await readContrasts(state === "normal" ? fixture : page.locator(interactive));
      for (const reading of readings) {
        function checkContrast(metric, ratio, minimum) {
          const exception = exceptions[`${state}/${reading.name}/${metric}`];
          // Recorded stock color ratios are rounded to two decimal places.
          const floor = exception === undefined ? minimum : exception - 0.005;
          if (ratio < floor) failures.push(`${state}/${reading.name} ${metric} ${ratio.toFixed(2)}`);
        }
        if (reading.name.endsWith("-indicator")) {
          if (state === "normal") checkContrast("mark", reading.mark, 3);
          continue;
        }
        checkContrast("text", reading.text, 4.5);
        if (state === "focus") {
          checkContrast("outline", reading.showsFocus ? reading.focus : 0, 3);
        }
        if (state === "normal" && reading.name.startsWith("outline-")) {
          checkContrast("border", reading.border, 3);
        }
      }
    }
    expect(failures, context).toEqual([]);
  } finally {
    await session.detach();
    if (await toggle.isVisible()) await navigation.getByRole("button", { name: "Close menu" }).click();
  }
}

for (const [skin, scheme] of catalog) {
  test(`${skin} keeps its primary and accessible states at mobile and desktop widths`, async ({ page }) => {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`test/skins/${skin}/`);
      const html = page.locator("html");
      await expect(html).toHaveCSS("--bs-primary-base", identity[skin]);
      await expect(html).toHaveCSS("color-scheme", scheme);
      const [navbarBackground, brandColor] = navbarIdentity[skin];
      const navigation = page.getByRole("navigation", { name: "Primary", exact: true });
      await expect(navigation).toHaveCSS("background-color", navbarBackground);
      await expect(navigation.locator(".navbar-brand")).toHaveCSS("color", brandColor);
      await expect(page.getByRole("contentinfo")).toHaveCSS(
        "background-color", footerBackgrounds[skin] ?? navbarBackground,
      );
      if (topHat[skin]) {
        const actual = await html.evaluate((element, names) => {
          const style = getComputedStyle(element);
          return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]));
        }, Object.keys(topHat[skin]));
        expect(actual).toEqual(topHat[skin]);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const footerContrast = skin === "skeeblu" ? skeebluFooterContrast : {};
      await audit(page, `${skin} at ${width}px`, { ...topHatContrast[skin], ...footerContrast });
    }
  });
}

test("keeps Chulapa's navbar typography in the skins that customize it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  // Chulapa's brand is 1.25rem and bold, and the active link is bold. Media
  // keeps its heavier brand and heading-font navigation, and the Chulapa skin
  // keeps its body font in the navbar.
  for (const [skin, brandWeight, linkFont] of [
    ["gitdev", "700", /^"Inter Tight"/],
    ["focal", "700", /^"Fira Sans"/],
    ["media", "900", /^"Mona Sans"/],
    ["chulapa", "700", /^"Ibarra Real Nova"/],
  ]) {
    await page.goto(`test/skins/${skin}/`);
    const navigation = page.getByRole("navigation", { name: "Primary", exact: true });
    const brand = navigation.locator(".navbar-brand");
    const links = navigation.locator(".nav-link");
    const active = navigation.locator('.nav-link[aria-current="page"]');
    await expect(brand, skin).toHaveCSS("font-size", "20px");
    await expect(brand, skin).toHaveCSS("font-weight", brandWeight);
    await expect(links.first(), skin).toHaveCSS("font-family", linkFont);
    expect(Number(await active.evaluate((link) => getComputedStyle(link).fontWeight)), skin)
      .toBeGreaterThanOrEqual(700);
  }
});

test("preserves TopHat's explicit button geometry and Chulapa fill overrides", async ({ page }) => {
  const button = page.locator('[data-contrast="solid-primary"]');
  await page.goto("test/skins/electro/");
  await expect(button).toHaveCSS("border-top-left-radius", "20.8px");
  await button.evaluate((element) => element.classList.add("btn-sm"));
  await expect(button).toHaveCSS("border-top-left-radius", "12.8px");
  await button.evaluate((element) => element.classList.replace("btn-sm", "btn-lg"));
  await expect(button).toHaveCSS("border-top-left-radius", "25.6px");

  await page.goto("test/skins/graymor/");
  await expect(button).toHaveCSS("border-top-left-radius", "0px");
  await page.goto("test/skins/hootstrap/");
  await expect(button).toHaveCSS("background-color", "rgb(81, 126, 119)");
  await expect(button).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("maps Deeply's dark component values and uses native surfaces in the generated light variant", async ({ page }) => {
  await page.goto("test/skins/deeply/", { waitUntil: "domcontentloaded" });
  await page.locator("#states").evaluate((anchor) => {
    anchor.insertAdjacentHTML("afterend", `
      <table class="table table-hover">
        <tbody><tr class="theme-primary"><td data-deeply="table-cell">Primary row</td></tr></tbody>
      </table>
      <div class="theme-warning"><p class="alert" data-deeply="alert">Warning alert</p></div>
      <div class="card theme-primary" data-deeply="card"><div class="card-body">Primary card</div></div>
      <label for="deeply-disabled">Disabled sample</label>
      <input id="deeply-disabled" class="form-control" value="Unavailable" disabled>
    `);
  });
  const cell = page.locator('[data-deeply="table-cell"]');
  const alert = page.locator('[data-deeply="alert"]');
  const card = page.locator('[data-deeply="card"]');
  const input = page.locator("#deeply-disabled");

  await expect(cell).toHaveCSS("background-color", "rgb(255, 85, 11)");
  await expect(cell).toHaveCSS("color", "rgb(255, 255, 255)");
  await cell.hover();
  await expect(cell).toHaveCSS("box-shadow", /rgb\(241, 73, 0\).*inset/);
  await expect(alert).toHaveCSS("background-color", "rgb(13, 226, 234)");
  await expect(alert).toHaveCSS("border-top-width", "0px");
  await expect(card).toHaveCSS("background-color", "rgb(255, 85, 11)");
  await expect(card.locator(".card-body")).toHaveCSS("color", "rgb(0, 0, 0)");
  await expect(input).toHaveCSS("background-color", "rgb(204, 204, 204)");
  await expect(input).toHaveCSS("color", "rgb(73, 80, 87)");

  await colorMode(page).choose({ label: "Light theme" });
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(cell).not.toHaveCSS("background-color", "rgb(255, 85, 11)");
  await expect(alert).not.toHaveCSS("background-color", "rgb(13, 226, 234)");
  await expect(input).not.toHaveCSS("background-color", "rgb(204, 204, 204)");
});

for (const [skin, primaryScheme] of catalog.filter(([, , alternate]) => !alternate)) {
  const alternateScheme = primaryScheme === "dark" ? "light" : "dark";
  test(`${skin} generates a ${alternateScheme} variant with the original typography`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: alternateScheme });
    await page.goto(`test/skins/${skin}/`);
    const themeMenu = colorMode(page);
    const body = page.locator("body");
    const heading = page.getByRole("heading", { name: "Skin contrast fixture" });
    const font = (element) => element.evaluate((node) => getComputedStyle(node).fontFamily);
    const bodyFont = await font(body);
    const titleFont = await font(heading);
    const primaryBackground = await body.evaluate((node) => getComputedStyle(node).backgroundColor);

    for (const mode of ["dark", "system"]) {
      await themeMenu.choose(mode);
      await expect(page.locator("html")).toHaveCSS("color-scheme", alternateScheme);
      await expect(page.locator("html")).toHaveCSS("--bs-primary-base", identity[skin]);
      await expect(body).toHaveCSS("font-family", bodyFont);
      await expect(heading).toHaveCSS("font-family", titleFont);
      await expect(body).not.toHaveCSS("background-color", primaryBackground);
      const bodyBackground = await body.evaluate((node) => getComputedStyle(node).backgroundColor);
      await expect(page.getByRole("contentinfo")).toHaveCSS("background-color", bodyBackground);
      await audit(page, `${skin} automatic ${alternateScheme} (${mode})`);
    }
    await page.emulateMedia({ colorScheme: primaryScheme });
    await expect(body).toHaveCSS("background-color", primaryBackground);
  });
}

test("switches between skins in the shared kitchen sink and keeps the color preference", async ({ page }) => {
  await page.goto("test/skins/focal/");
  const skin = page.getByRole("combobox", { name: "Skin", exact: true });
  const themeMenu = colorMode(page);
  await expect(skin.locator("option")).toHaveCount(catalog.length);
  await expect(page.locator("#bootstrap-kitchen-sink")).toBeVisible();
  await themeMenu.choose("dark");
  await skin.selectOption({ label: "media" });
  await expect(page).toHaveURL(/\/test\/skins\/media\/$/);
  await expect(themeMenu.selected).toHaveAttribute("data-color-mode", "dark");
  await expect(page.locator("#bootstrap-kitchen-sink")).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("--bs-primary-base", identity.media);
  const wordmark = page.getByRole("contentinfo")
    .getByRole("link", { name: "chulapa2 Jekyll Theme" }).locator(".chulapa");
  await expect(wordmark).toHaveCSS("font-variant-ligatures", "common-ligatures discretionary-ligatures");
  await skin.selectOption({ label: "listen" });
  await expect(page).toHaveURL(/\/test\/skins\/listen\/$/);
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await themeMenu.choose({ label: "Light theme" });
  await skin.selectOption({ label: "focal" });
  await expect(page).toHaveURL(/\/test\/skins\/focal\/$/);
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(themeMenu.selected).toHaveAttribute("data-color-mode", "light");
});

test("uses the named dark skin when a family provides one", async ({ page }) => {
  for (const [light, dark, background, linkColor] of [
    ["butterfly", "butterfly-dark", "rgb(0, 0, 0)", "rgb(16, 131, 254)"],
    ["gitdev", "gitdev-dark", "rgb(36, 41, 47)", "rgb(88, 166, 255)"],
    ["twitter", "twitter-lights-out", "rgb(0, 0, 0)", "rgb(29, 155, 240)"],
  ]) {
    await page.goto(`test/skins/${light}/`);
    await colorMode(page).choose("dark");
    await expect(page.locator("html")).toHaveCSS("--bs-primary-base", identity[dark]);
    await expect(page.locator("body")).toHaveCSS("background-color", background);
    const footer = page.getByRole("contentinfo");
    await expect(footer).toHaveCSS("background-color", background);
    await expect(footer.locator(".chulapa-footer-brand a")).toHaveCSS("color", linkColor);
  }
});

test("uses the named light skin when starting from its dark counterpart", async ({ page }) => {
  for (const [skin, , alternate] of catalog.filter(([, scheme, pair]) => scheme === "dark" && pair)) {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(`test/skins/${skin}/`);
    const root = page.locator("html");
    const themeMenu = colorMode(page);
    const icon = page.locator("#site-color-mode-icon");
    await expect(root).toHaveCSS("color-scheme", "dark");
    await expect(icon).toHaveClass("bi bi-moon-stars-fill");
    await themeMenu.choose({ label: "Light theme" });
    await expect(root).toHaveCSS("--bs-primary-base", identity[alternate]);
    await expect(root).toHaveCSS("color-scheme", "light");
    await expect(icon).toHaveClass("bi bi-sun-fill");
    await themeMenu.choose("system");
    await expect(root).toHaveCSS("color-scheme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(root).toHaveCSS("--bs-primary-base", identity[skin]);
    await expect(root).toHaveCSS("color-scheme", "dark");
    await themeMenu.choose("light");
  }
});
