import { expect, test } from "@playwright/test";
import { readContrast } from "./contrast.mjs";

test.use({ reducedMotion: "reduce" });

for (const color of ["#285d70", "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00"]) {
  test(`renders ${color} with readable component states in both modes`, async ({ page }) => {
    await page.goto("test/auto-themer/");
    const picker = page.getByLabel("Primary color");
    await picker.fill(color);
    await expect(page.locator("#auto-themer")).toHaveCSS("--auto-themer-primary", color);

    for (const mode of ["Light mode", "Dark mode"]) {
      const panel = page.getByRole("region", { name: mode });
      await expect(panel).toHaveCSS("color-scheme", mode.split(" ")[0].toLowerCase());
      const alert = panel.locator(".alert");
      expect((await readContrast(alert)).text, `${mode} alert`).toBeGreaterThanOrEqual(4.5);

      const outline = panel.getByRole("button", { name: "Outline button" });
      expect((await readContrast(outline)).border, `${mode} outline border`).toBeGreaterThanOrEqual(3);

      for (const variant of ["Solid button", "Outline button"]) {
        const button = panel.getByRole("button", { name: variant });
        const label = `${mode} ${variant}`;
        expect((await readContrast(button)).text, `${label} default`).toBeGreaterThanOrEqual(4.5);
        await page.keyboard.press("Tab");
        await button.focus();
        await expect(button).toHaveCSS("outline-style", "solid");
        expect((await readContrast(button)).focus, `${label} focus ring`).toBeGreaterThanOrEqual(3);

        await button.hover();
        expect((await readContrast(button)).text, `${label} hover`).toBeGreaterThanOrEqual(4.5);
        await page.mouse.down();
        expect((await readContrast(button)).text, `${label} active`).toBeGreaterThanOrEqual(4.5);
        await page.mouse.up();
        await picker.hover();
      }

      const field = panel.getByRole("textbox", { name: "Text field" });
      const checkbox = panel.getByRole("checkbox", { name: "Sample checkbox" });
      const link = panel.getByRole("link", { name: "Sample link" });
      await page.keyboard.press("Tab");
      await field.focus();
      expect((await readContrast(field)).text, `${mode} text field`).toBeGreaterThanOrEqual(4.5);

      for (const [control, name] of [[field, "text field"], [checkbox, "checkbox"], [link, "link"]]) {
        await expect(control).toBeFocused();
        await expect(control).toHaveCSS("outline-style", "solid");
        expect((await readContrast(control)).focus, `${mode} ${name} focus ring`).toBeGreaterThanOrEqual(3);
        if (name === "checkbox") {
          await page.keyboard.press("Space");
          await expect(checkbox).toBeChecked();
          const checked = await readContrast(checkbox);
          expect(checked.showsMark, `${mode} visible check mark`).toBe(true);
          expect(checked.mark, `${mode} check mark`).toBeGreaterThanOrEqual(3);
          expect(checked.fill, `${mode} checked fill`).toBeGreaterThanOrEqual(3);
        }
        await page.keyboard.press("Tab");
      }
    }
  });
}

test("preserves the configured link colors when the generated palette changes", async ({ page }) => {
  await page.goto("test/auto-themer/");
  const light = page.getByRole("region", { name: "Light mode" });
  const dark = page.getByRole("region", { name: "Dark mode" });
  const solid = light.getByRole("button", { name: "Solid button" });
  const original = await solid.evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.getByLabel("Primary color").fill("#00ff00");
  await expect(solid).not.toHaveCSS("background-color", original);
  await expect(dark.locator(".alert")).toHaveCSS("--bs-theme-base", "#00ff00");
  const lightLink = light.getByRole("link", { name: "Sample link" });
  const darkLink = dark.getByRole("link", { name: "Sample link" });
  await expect(lightLink).toHaveCSS("color", "rgb(132, 32, 41)");
  await expect(darkLink).toHaveCSS("color", "rgb(255, 217, 168)");
  expect((await readContrast(lightLink)).text).toBeGreaterThanOrEqual(4.5);
  expect((await readContrast(darkLink)).text).toBeGreaterThanOrEqual(4.5);
  await lightLink.hover();
  await expect(lightLink).toHaveCSS("color", "rgb(100, 24, 33)");
  expect((await readContrast(lightLink)).text).toBeGreaterThanOrEqual(4.5);
});

test("changes primary colors without restyling Bootstrap buttons", async ({ page }) => {
  await page.goto("test/auto-themer/");
  const solid = page.getByRole("region", { name: "Light mode" })
    .getByRole("button", { name: "Solid button" });
  const color = await solid.evaluate((element) => getComputedStyle(element).backgroundColor);
  const properties = ["font-family", "font-size", "font-weight", "line-height", "padding", "border-radius", "border-width"];
  const readStyles = () => solid.evaluate((element, names) => {
    const styles = getComputedStyle(element);
    return names.map((name) => styles.getPropertyValue(name));
  }, properties);
  const withPalette = await readStyles();

  await page.getByLabel("Generate palette").uncheck();
  await expect(page.getByLabel("Primary color")).toBeDisabled();
  await expect(solid).not.toHaveCSS("background-color", color);
  expect(await readStyles()).toEqual(withPalette);
  await expect(page.getByRole("region", { name: "Light mode" })
    .getByRole("link", { name: "Sample link" })).toHaveCSS("color", "rgb(132, 32, 41)");
});

test("keeps the unconfigured site on Bootstrap's default palette", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator('link[href$="/auto-themer.css"]')).toHaveCount(0);
  await expect(page.locator("html")).toHaveCSS("--auto-themer-primary", "");
});

test("uses the configured site palettes with the native color-mode selector", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("test/themed/");
  const root = page.locator("html");
  const link = page.getByRole("main").getByRole("link", { name: "chulapa", exact: true });
  const mode = page.getByRole("combobox", { name: "Color mode" });
  await expect(root).toHaveCSS("--bs-primary-base", "#285d70");
  await expect(link).toHaveCSS("color", "rgb(132, 32, 41)");
  expect((await readContrast(link)).text).toBeGreaterThanOrEqual(4.5);
  await link.hover();
  await expect(link).toHaveCSS("color", "rgb(100, 24, 33)");
  await mode.hover();

  await mode.selectOption("");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveCSS("--bs-primary-base", "#906");
  await expect(link).toHaveCSS("color", "rgb(255, 217, 168)");
  expect((await readContrast(link)).text).toBeGreaterThanOrEqual(4.5);

  await mode.selectOption("light");
  await expect(root).toHaveCSS("--bs-primary-base", "#285d70");
  await mode.selectOption("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).toHaveCSS("--bs-primary-base", "#906");
  await page.reload();
  await expect(mode).toHaveValue("dark");
  await expect(root).toHaveCSS("--bs-primary-base", "#906");

  await mode.selectOption("");
  await expect(root).toHaveCSS("--bs-primary-base", "#285d70");
});

test("offers the configured palette selector at small, medium and large widths", async ({ page }) => {
  for (const width of [640, 820, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("test/themed/");
    const menu = page.getByRole("button", { name: "Toggle navigation" });
    if (width === 640) {
      await menu.click();
    } else {
      await expect(menu).toBeHidden();
    }

    const mode = page.getByRole("combobox", { name: "Color mode" });
    await expect(mode).toBeVisible();
    await mode.selectOption("dark");
    await expect(page.locator("html")).toHaveCSS("--bs-primary-base", "#906");
    await mode.selectOption("light");
    await expect(page.locator("html")).toHaveCSS("--bs-primary-base", "#285d70");
  }
});

for (const mode of ["light", "dark"]) {
  test(`keeps site-wide ${mode} components readable and keyboard accessible`, async ({ page }) => {
    await page.goto("test/themed/test/auto-themer/components/");
    await page.getByRole("combobox", { name: "Color mode" }).selectOption(mode);
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", mode);
    const content = page.getByRole("main");
    const field = content.getByRole("textbox", { name: "Email address", exact: true });
    const radio = content.getByRole("radio", { name: "Weekly" });
    const toggle = content.getByRole("switch", { name: "Include a summary" });
    const switchIndicator = content.locator(".switch");
    const button = content.getByRole("button", { name: "Save preferences" });

    for (const [element, name] of [
      [content.locator(".alert.theme-primary"), "alert"],
      [content.getByText("Subscription", { exact: true }), "badge"],
      [field, "text field"],
      [button, "button"],
    ]) {
      expect((await readContrast(element)).text, `${mode} ${name}`).toBeGreaterThanOrEqual(4.5);
    }

    async function expectVisibleFocus(element) {
      await expect(element).toHaveCSS("outline-style", "solid");
      expect((await readContrast(element)).focus, `${mode} focus ring`).toBeGreaterThanOrEqual(3);
    }

    await page.keyboard.press("Tab");
    await field.focus();
    await expectVisibleFocus(field);
    await page.keyboard.press("Tab");
    await expect(content.getByRole("radio", { name: "Daily" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(radio).toBeFocused();
    await expect(radio).toBeChecked();
    await expectVisibleFocus(radio);
    expect((await readContrast(radio)).mark, `${mode} radio indicator`).toBeGreaterThanOrEqual(3);

    await page.keyboard.press("Tab");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Space");
    await expect(toggle).toBeChecked();
    await expectVisibleFocus(switchIndicator);
    const checked = await readContrast(switchIndicator);
    expect(checked.mark, `${mode} switch indicator`).toBeGreaterThanOrEqual(3);
    expect(checked.fill, `${mode} checked switch fill`).toBeGreaterThanOrEqual(3);

    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    await expectVisibleFocus(button);
  });
}

test("applies the GitDev pair and keeps Bootstrap button geometry", async ({ page }) => {
  const properties = [
    "font-size", "font-weight", "padding-block-start",
    "padding-inline-end", "border-top-width", "border-top-left-radius",
  ];
  const button = page.getByRole("button", { name: "Save preferences" });
  await page.goto("test/auto-themer/components/");
  const bootstrap = await button.evaluate(
    (element, names) => names.map((name) => getComputedStyle(element).getPropertyValue(name)),
    properties,
  );

  await page.goto("test/gitdev/test/auto-themer/components/");
  await expect(page.locator('link[href^="https://fonts.googleapis.com/"]')).toHaveCount(1);
  const selector = page.getByRole("combobox", { name: "Color mode" });
  await expect(selector).toHaveValue("light");
  for (const [mode, primary, surface, link] of [
    ["light", "#22272e", "rgb(255, 255, 255)", "#0969da"],
    ["dark", "#373e47", "rgb(36, 41, 47)", "#79b8ff"],
  ]) {
    await selector.selectOption(mode);
    await expect(page.locator("body")).toHaveCSS("background-color", surface);
    await expect(page.locator("body")).toHaveCSS("font-family", /^Inter,/);
    await expect(page.locator("html")).toHaveCSS("--bs-primary-base", primary);
    await expect(page.locator("html")).toHaveCSS("--bs-link-color", link);
    for (const [index, property] of properties.entries()) {
      await expect(button).toHaveCSS(property, bootstrap[index]);
    }
    const components = page.getByRole("main");
    for (const element of [button, components.locator(".alert.theme-primary"), components.locator(".badge")]) {
      expect((await readContrast(element)).text, mode).toBeGreaterThanOrEqual(4.5);
    }
    await page.keyboard.press("Tab");
    await button.focus();
    await expect(button).toHaveCSS("outline-style", "solid");
    expect((await readContrast(button)).focus, mode).toBeGreaterThanOrEqual(3);
  }
});

test("applies GitDev typography, navigation and editorial styles", async ({ page }) => {
  await page.goto("test/gitdev/test/markdown/");
  const heading = page.getByRole("heading", { name: "Markdown fixture" });
  const nav = page.getByRole("navigation", { name: "Primary" });
  const brand = nav.getByRole("link", { name: "chulapa2" });
  const quote = page.locator("blockquote");
  const code = page.locator("main pre code");
  await expect(heading).toHaveCSS("font-family", /^"Inter Tight"/);
  await expect(heading).toHaveCSS("font-weight", "800");
  await expect(nav).toHaveCSS("font-family", '"Inter Tight", Roboto, sans-serif');
  await expect(brand).toHaveCSS("font-family", "Chulapa, sans-serif");
  await expect(nav).toHaveCSS("background-color", "rgb(34, 39, 46)");
  await expect(quote).toHaveCSS("border-inline-start-color", "rgb(9, 105, 218)");
  await expect(quote).toHaveCSS("border-top-left-radius", "0px");
  await expect(quote).toHaveCSS("padding-inline-start", "8px");
  await expect(code).toHaveCSS("font-family", /^"Roboto Mono"/);
  await expect(page.locator("html")).toHaveCSS("--bs-success-base", "#277f46");

  await page.getByRole("combobox", { name: "Color mode" }).selectOption("dark");
  await expect(nav).toHaveCSS("background-color", "rgb(36, 41, 47)");
  await expect(quote).toHaveCSS("border-inline-start-color", "rgb(121, 184, 255)");
  await expect(page.locator("html")).toHaveCSS("--bs-success-base", "#6fdd8c");
});

test("uses the authored GitDev Dark palette with dual mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("test/gitdev-dual/");
  const selector = page.getByRole("combobox", { name: "Color mode" });
  await expect(selector).toHaveValue("light");
  await expect(page.locator("html")).toHaveCSS("--bs-primary-base", "#22272e");
  await selector.selectOption("");
  const link = page.getByRole("main").getByRole("link", { name: "chulapa", exact: true });
  await expect(link).toHaveCSS("color", "rgb(121, 184, 255)");
  expect((await readContrast(link)).text).toBeGreaterThanOrEqual(4.5);
  await expect(page.locator("html")).toHaveCSS("--bs-primary-base", "#373e47");
  await expect(page.locator("html")).toHaveCSS("--auto-themer-primary", "");
});

test("keeps a dark primary skin and allows a separate light alternate", async ({ page }) => {
  await page.goto("test/gitdev-alternate/");
  const selector = page.getByRole("combobox", { name: "Color mode" });
  await expect(selector.getByRole("option", { name: "Primary theme" })).toHaveAttribute("value", "light");
  await expect(selector).toHaveValue("light");
  const root = page.locator("html");
  await expect(root).toHaveCSS("color-scheme", "dark");
  await expect(root).toHaveCSS("--bs-primary-base", "#41516a");
  await expect(root).toHaveCSS("--bs-link-color", "#b1dcff");

  await selector.selectOption({ label: "Alternate theme" });
  await expect(root).toHaveCSS("color-scheme", "light");
  await expect(root).toHaveCSS("--bs-primary-base", "#22272e");
  await expect(root).toHaveCSS("--bs-link-color", "#0969da");
});

test("loads configured fonts, colors and component overrides across both modes", async ({ page }) => {
  await page.goto("test/tokens/test/auto-themer/components/");
  const main = page.getByRole("main");
  const heading = main.getByRole("heading", { name: "Themed components" });
  const button = main.getByRole("button", { name: "Save preferences" });
  const field = main.getByRole("textbox", { name: "Email address", exact: true });
  const inactiveField = main.getByRole("textbox", { name: "Inactive email address" });
  const link = main.getByRole("link", { name: "Read the preferences guide" });
  const sample = main.getByText("Border and shadow sample");
  const danger = main.locator(".alert.theme-danger");
  const code = main.locator("code");
  const body = page.locator("body");
  await expect(page.locator('link[href*="IBM+Plex+Mono"]')).toHaveCount(1);
  await expect(page.locator('[href^="javascript:"]')).toHaveCount(0);
  const fonts = await page.evaluate(async () => {
    const requests = ['400 1rem Rubik', '650 1rem Raleway', '400 1rem "IBM Plex Mono"'];
    return Promise.all(requests.map(async (font) => ({
      font,
      loaded: (await document.fonts.load(font, "Theme sample")).some((face) => face.status === "loaded"),
    })));
  });
  expect(fonts.filter((font) => !font.loaded)).toEqual([]);
  await expect(body).toHaveCSS("font-family", "Rubik, sans-serif");
  await expect(body).toHaveCSS("font-size", "18px");
  await expect(body).toHaveCSS("line-height", "31.5px");
  await expect(body).toHaveCSS("background-color", "rgb(245, 249, 255)");
  await expect(body).toHaveCSS("color", "rgb(32, 52, 74)");
  await expect(heading).toHaveCSS("font-family", "Raleway, sans-serif");
  await expect(heading).toHaveCSS("font-weight", "650");
  await expect(code).toHaveCSS("font-family", /^"IBM Plex Mono"/);
  await expect(page.getByRole("navigation").getByRole("link", { name: "About" }))
    .toHaveCSS("color", "rgb(240, 244, 248)");
  await expect(button).toHaveCSS("background-color", "rgb(24, 69, 91)");
  await expect(button).toHaveCSS("border-radius", "13px");
  await expect(button).toHaveCSS("border-top-color", "rgb(18, 52, 86)");
  await expect(button).toHaveCSS("padding-inline-start", "30px");
  await expect(field).toHaveCSS("padding-inline-start", "30px");
  await expect(field).toHaveCSS("border-top-width", "2px");
  await expect(field).toHaveCSS("border-top-color", "rgb(52, 86, 120)");
  await expect(field).toHaveCSS("border-radius", "11px");
  await expect(field).toHaveCSS("box-shadow", /rgba\(17, 34, 51, 0.5\).*inset/);
  await expect(inactiveField).toBeDisabled();
  await expect(inactiveField).toHaveCSS("background-color", "rgb(227, 233, 241)");
  await expect(sample).toHaveCSS("border-top-style", "dashed");
  await expect(sample).toHaveCSS("border-top-width", "2px");
  await expect(sample).toHaveCSS("border-top-color", "rgb(59, 86, 112)");
  await expect(sample).toHaveCSS("box-shadow", /oklch\([^)]*\/ 0\.064\)/);
  await expect(danger).toHaveCSS("background-color", /^color\(srgb /);
  expect((await readContrast(danger)).text).toBeGreaterThanOrEqual(4.5);
  await expect(link).toHaveCSS("color", "rgb(21, 78, 133)");
  await link.hover();
  await expect(link).toHaveCSS("color", "rgb(18, 55, 88)");
  await page.keyboard.press("Tab");
  await button.focus();
  await expect(button).toHaveCSS("outline-width", "4px");
  expect((await readContrast(button)).focus).toBeGreaterThanOrEqual(3);
  expect((await readContrast(button)).text).toBeGreaterThanOrEqual(4.5);
  const stylesheet = await page.request.get("test/tokens/assets/css/auto-themer.css");
  expect(await stylesheet.text()).not.toMatch(/white; color: red|var\(--missing|\.invalid, body|1px2px/);

  await page.getByRole("combobox", { name: "Color mode" }).selectOption("dark");
  await expect(body).toHaveCSS("font-family", /^"IBM Plex Mono"/);
  await expect(code).toHaveCSS("font-family", "Consolas, monospace");
  await expect(body).toHaveCSS("background-color", "rgb(32, 42, 54)");
  await expect(body).toHaveCSS("color", "rgb(237, 244, 250)");
  await expect(button).toHaveCSS("background-color", "rgb(35, 64, 99)");
  await expect(button).toHaveCSS("padding-inline-start", "12px");
  await expect(button).not.toHaveCSS("border-radius", "13px");
  expect((await readContrast(button)).text).toBeGreaterThanOrEqual(4.5);
  await page.keyboard.press("Tab");
  await button.focus();
  await expect(button).toHaveCSS("outline-color", "rgb(162, 213, 255)");
});

test("recomputes generated roles at their declaration scope and honors downstream CSS", async ({ page }) => {
  await page.goto("test/tokens/test/auto-themer/components/");
  const button = page.getByRole("button", { name: "Verify address" });
  const initial = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(initial).toMatch(/^oklch\(/);
  const rootOverride = await page.addStyleTag({ content: ":root { --bs-success-base: #ab2020; }" });
  await expect(button).not.toHaveCSS("background-color", initial);
  const changed = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect((await readContrast(button)).text).toBeGreaterThanOrEqual(4.5);

  await page.addStyleTag({ content: ".theme-success { --bs-success-base: #174d70; }" });
  await expect(button).toHaveCSS("background-color", changed);
  await page.addStyleTag({ content: ".theme-success { --bs-success-bg: #174d70; }" });
  await expect(button).toHaveCSS("background-color", "rgb(23, 77, 112)");
  await rootOverride.evaluate((element) => element.remove());
});

test("generates surfaces and status colors from one primary in the kitchen sink", async ({ page }) => {
  const demo = "test/auto-themer/kitchen-sink/";
  const roles = ["primary", "secondary", "success", "warning", "danger", "info"];
  const buttonFor = (role) => page.getByRole("button", { name: `${role} button`, exact: false });
  const body = page.locator("body");
  const sample = page.getByText("Surface 1", { exact: true });
  const background = (target) => target.evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Bootstrap 6 kitchen sink", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Semantic colors", level: 3 })).toBeVisible();
  const defaults = await Promise.all([body, sample, ...roles.map(buttonFor)].map(background));

  await page.goto("test/dual/");
  await expect(page.getByRole("heading", { name: "Bootstrap 6 kitchen sink", level: 2 })).toBeVisible();
  const light = await Promise.all([body, sample, ...roles.map(buttonFor)].map(background));
  for (const [index, color] of light.entries()) {
    expect(color).not.toBe(defaults[index]);
  }

  await page.goto(`test/dual/${demo}`);
  await expect(page.getByRole("heading", { name: "Bootstrap 6 kitchen sink", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Semantic colors", level: 2 })).toBeVisible();
  expect(await Promise.all([body, sample, ...roles.map(buttonFor)].map(background))).toEqual(light);
  const selector = page.getByRole("combobox", { name: "Color mode" });
  for (const mode of ["light", "dark"]) {
    await selector.selectOption(mode);
    expect((await readContrast(body)).text, mode).toBeGreaterThanOrEqual(4.5);
    for (const role of roles) {
      expect((await readContrast(buttonFor(role))).text, `${mode} ${role}`).toBeGreaterThanOrEqual(4.5);
    }
  }
  await expect(body).not.toHaveCSS("background-color", light[0]);
  await expect(sample).not.toHaveCSS("background-color", light[1]);
  await expect(buttonFor("success")).not.toHaveCSS("background-color", light[4]);

  const originalSurface = await background(sample);
  const originalSuccess = await background(buttonFor("success"));
  await page.addStyleTag({ content: ":root { --bs-primary-base: #bb286a; }" });
  await expect(sample).not.toHaveCSS("background-color", originalSurface);
  await expect(buttonFor("success")).not.toHaveCSS("background-color", originalSuccess);

  const trigger = page.getByRole("button", { name: "Open dialog" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Confirm publication" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("keeps authored and explicit colors above generated defaults", async ({ page }) => {
  await page.goto("test/gitdev/");
  await expect(page.getByRole("heading", { name: "Bootstrap 6 kitchen sink", level: 2 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Primary button" }))
    .toHaveCSS("background-color", "rgb(34, 39, 46)");

  await page.goto("test/tokens/");
  await expect(page.getByRole("heading", { name: "Bootstrap 6 kitchen sink", level: 2 })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(245, 249, 255)");
  await expect(page.getByRole("button", { name: "Primary button" }))
    .toHaveCSS("background-color", "rgb(24, 69, 91)");
  await expect(page.getByRole("button", { name: "Warning button" }))
    .toHaveCSS("background-color", "rgb(180, 83, 6)");
  await expect(page.getByRole("button", { name: "Danger button" }))
    .toHaveCSS("background-color", "rgb(139, 37, 53)");
  await expect(page.getByRole("navigation", { name: "Primary" }))
    .toHaveCSS("background-color", "rgb(40, 93, 112)");
});

test("styles the legacy Markdown callouts in both color modes", async ({ page }) => {
  await page.goto("test/dual/");
  const section = page.getByRole("region", { name: "Callouts" });
  const labels = ["Note", "Tip", "Important", "Warning", "Caution"];
  const selector = page.getByRole("combobox", { name: "Color mode" });
  const background = (target) => target.evaluate((element) => getComputedStyle(element).backgroundColor);
  const note = section.getByRole("note", { name: "Note", exact: true });
  const light = await background(note);

  for (const mode of ["light", "dark"]) {
    await selector.selectOption(mode);
    await expect(section.getByRole("note")).toHaveCount(labels.length);
    const backgrounds = [];
    for (const label of labels) {
      const callout = section.getByRole("note", { name: label, exact: true });
      await expect(callout).toHaveCSS("border-inline-start-width", "4px");
      expect((await readContrast(callout)).text, `${mode} ${label}`).toBeGreaterThanOrEqual(4.5);
      backgrounds.push(await background(callout));
    }
    expect(new Set(backgrounds).size).toBe(labels.length);
  }
  await expect(note).not.toHaveCSS("background-color", light);

  await note.evaluate((element) => { element.lang = "es"; });
  const title = await note.evaluate((element) => getComputedStyle(element, "::before").content);
  expect(title).toContain("Nota");
});

test("renders multiple Markdown blocks inside a legacy callout", async ({ page }) => {
  await page.goto("test/markdown/");
  const note = page.getByRole("note", { name: "Note" });
  await expect(note).toContainText("This callout contains more than one block.");
  await expect(note.getByRole("listitem")).toHaveCount(2);
  await expect(note).toHaveCSS("border-inline-start-width", "4px");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("applies the primary configuration across system preferences", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("test/themed/");
    const root = page.locator("html");
    await expect(root).toHaveCSS("--bs-primary-base", "#285d70");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(root).toHaveCSS("--bs-primary-base", "#285d70");
  });

  test("renders the primary color supplied by Jekyll", async ({ page }) => {
    await page.goto("test/auto-themer/");
    await expect(page.getByLabel("Generate palette")).toBeChecked();
    await expect(page.getByLabel("Primary color")).toHaveValue("#285d70");
    for (const mode of ["Light mode", "Dark mode"]) {
      const alert = page.getByRole("region", { name: mode }).locator(".alert");
      await expect(alert).toHaveCSS("--bs-theme-base", "#285d70");
      expect((await readContrast(alert)).text).toBeGreaterThanOrEqual(4.5);
    }
  });
});
