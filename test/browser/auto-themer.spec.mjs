import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

function readContrast(target) {
  return target.evaluate((element) => {
    // Convert browser-resolved colors to sRGB, including colors from OKLCH.
    const canvas = Object.assign(document.createElement("canvas"), { width: 1, height: 1 });
    const context = canvas.getContext("2d");
    const styles = getComputedStyle(element);
    const panel = getComputedStyle(element.closest(".auto-themer-preview") ?? document.body);
    const mark = getComputedStyle(element, "::before");

    function pixel(...layers) {
      context.clearRect(0, 0, 1, 1);
      for (const layer of layers) {
        context.fillStyle = layer;
        context.fillRect(0, 0, 1, 1);
      }
      return context.getImageData(0, 0, 1, 1).data;
    }

    function luminance(pixel) {
      const [r, g, b] = Array.from(pixel).slice(0, 3).map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function ratio(first, second) {
      const a = luminance(first);
      const b = luminance(second);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }

    const surface = panel.backgroundColor;
    const background = [surface, styles.backgroundColor];
    return {
      text: ratio(pixel(...background, styles.color), pixel(...background)),
      border: ratio(pixel(...background, styles.borderTopColor), pixel(surface)),
      focus: ratio(pixel(surface, styles.outlineColor), pixel(surface)),
      fill: ratio(pixel(...background), pixel(surface)),
      mark: ratio(pixel(...background, mark.backgroundColor), pixel(...background)),
      showsMark: mark.opacity === "1" && mark.maskImage !== "none",
    };
  });
}

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
    const field = content.getByRole("textbox", { name: "Email address" });
    const radio = content.getByRole("radio", { name: "Weekly" });
    const toggle = content.getByRole("switch", { name: "Include a summary" });
    const switchIndicator = content.locator(".switch");
    const button = content.getByRole("button", { name: "Save preferences" });

    for (const [element, name] of [
      [content.locator(".alert"), "alert"],
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
