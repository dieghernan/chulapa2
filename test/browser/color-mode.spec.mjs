import { expect, test } from "@playwright/test";

test("follows the system and remembers explicit modes across pages", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("test/themed/");

  const root = page.locator("html");
  const body = page.locator("body");
  const select = page.getByRole("combobox", { name: "Color mode" });
  await expect(select).toHaveValue("light");
  const lightBackground = await body.evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(body).toHaveCSS("background-color", lightBackground);
  await select.selectOption("");
  await expect(body).not.toHaveCSS("background-color", lightBackground);
  const darkBackground = await body.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(select).toHaveValue("");

  await select.selectOption("light");
  await expect(root).toHaveAttribute("data-bs-theme", "light");
  await expect(body).toHaveCSS("background-color", lightBackground);
  await page.goto("test/themed/test/auto-themer/components/");
  await expect(select).toHaveValue("light");
  await expect(body).toHaveCSS("background-color", lightBackground);

  await select.selectOption("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(body).toHaveCSS("background-color", darkBackground);
  await page.reload();
  await expect(select).toHaveValue("dark");
  await expect(root).toHaveAttribute("data-bs-theme", "dark");

  await select.selectOption("");
  await expect(body).toHaveCSS("background-color", lightBackground);
  await page.reload();
  await expect(select).toHaveValue("");
  await expect(root).not.toHaveAttribute("data-bs-theme", /.+/);
});

test("lets visitors change the mode when browser storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage is blocked", "SecurityError");
      },
    });
  });
  await page.goto("test/themed/");
  const select = page.getByRole("combobox", { name: "Color mode" });
  await expect(select).toHaveValue("light");
  await select.selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
});

test("keeps a single primary configuration fixed even with a stored dark preference", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("chulapa2-color-mode", "dark"));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("test/primary/");
  await expect(page.locator("#site-color-mode")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "light");
  await expect(page.locator("html")).toHaveCSS("--auto-themer-primary", "#285d70");
  const stylesheet = await page.request.get("test/primary/assets/css/auto-themer.css");
  expect(stylesheet.ok()).toBeTruthy();
  expect(await stylesheet.text()).not.toContain('data-bs-theme="dark"');
});

test("applies an explicit primary without generating a palette", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("test/selector/");
  const root = page.locator("html");
  const link = page.getByRole("main").getByRole("link", { name: "chulapa", exact: true });
  await expect(root).toHaveCSS("--bs-primary-base", "#285d70");
  await expect(root).toHaveCSS("--bs-primary-bg", "#285d70");
  await expect(root).toHaveCSS("--auto-themer-primary", "");
  await expect(link).toHaveCSS("color", "rgb(40, 93, 112)");
  await page.getByRole("combobox", { name: "Color mode" }).selectOption("dark");
  await expect(root).toHaveCSS("color-scheme", "dark");
  await expect(root).not.toHaveCSS("--bs-primary-base", "#285d70");
  await expect(root).toHaveCSS("--auto-themer-primary", "");
});

test("uses the primary color for an explicitly requested dark variant", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("test/dual/");
  const root = page.locator("html");
  const link = page.getByRole("main").getByRole("link", { name: "chulapa", exact: true });
  await page.getByRole("combobox", { name: "Color mode" }).selectOption("");
  await expect(root).toHaveCSS("color-scheme", "light dark");
  await expect(root).toHaveCSS("--auto-themer-primary", "#285d70");
  const darkColor = await link.evaluate((element) => getComputedStyle(element).color);
  await page.getByRole("combobox", { name: "Color mode" }).selectOption("light");
  await expect(root).toHaveCSS("--auto-themer-primary", "#285d70");
  await expect(link).not.toHaveCSS("color", darkColor);
});

test("shares configured tokens except body colors with the automatic dark variant", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("test/dual/");
  const selector = page.getByRole("combobox", { name: "Color mode" });
  const body = page.locator("body");
  const heading = page.locator("#surfaces-title");
  const inlineCode = page.locator("#surfaces p code").first();
  const blockCode = page.locator("#surfaces .highlight pre code").first();
  const field = page.locator("#sink-email");
  const button = page.getByRole("button", { name: "Primary button", exact: true });

  for (const mode of ["light", "dark", ""]) {
    await selector.selectOption(mode);
    await expect(body).toHaveCSS("font-family", "Georgia, serif");
    await expect(body).toHaveCSS("font-size", "18px");
    await expect(body).toHaveCSS("font-weight", "500");
    await expect(body).toHaveCSS("line-height", "31.5px");
    await expect(heading).toHaveCSS("font-family", "Verdana, sans-serif");
    await expect(heading).toHaveCSS("font-weight", "650");
    await expect(heading).toHaveCSS("line-height", "34px");
    await expect(inlineCode).toHaveCSS("font-family", /^"Fira Code"/);
    await expect(blockCode).toHaveCSS("font-family", /^"Fira Code"/);
    await expect(field).toHaveCSS("padding-inline-start", "20px");
    await expect(field).toHaveCSS("border-top-width", "2px");
    await expect(field).toHaveCSS("border-top-left-radius", "11px");
    await expect(button).toHaveCSS("border-top-left-radius", "13px");
    await expect(inlineCode).toHaveCSS("color", "rgb(18, 52, 86)");
    await expect(button).toHaveCSS("border-top-color", "rgb(53, 36, 103)");
    if (mode === "light") {
      await expect(body).toHaveCSS("background-color", "rgb(247, 243, 235)");
      await expect(body).toHaveCSS("color", "rgb(32, 48, 71)");
    } else {
      await expect(body).not.toHaveCSS("background-color", "rgb(247, 243, 235)");
      await expect(body).not.toHaveCSS("color", "rgb(32, 48, 71)");
    }
  }
});

test("shows the selector with two configurations even when explicitly disabled", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("test/hide-selector/");
  const selector = page.getByRole("combobox", { name: "Color mode" });
  const root = page.locator("html");
  await expect(selector).toBeVisible();
  await expect(selector).toHaveValue("light");
  await expect(root).toHaveCSS("--auto-themer-primary", "#285d70");
  await selector.selectOption("dark");
  await expect(root).toHaveAttribute("data-bs-theme", "dark");
});

test("uses Bootstrap's primary when the explicit dark configuration has no primary", async ({ page }) => {
  const root = page.locator("html");
  await page.goto("./");
  const bootstrapPrimary = await root.evaluate(
    (element) => getComputedStyle(element).getPropertyValue("--bs-primary-base"),
  );
  expect(bootstrapPrimary).not.toBe("");

  await page.goto("test/hide-selector/");
  await expect(root).toHaveCSS("--auto-themer-primary", "#285d70");
  await page.getByRole("combobox", { name: "Color mode" }).selectOption("dark");
  await expect(root).toHaveCSS("--auto-themer-primary", bootstrapPrimary);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, colorScheme: "dark" });

  test("keeps the primary appearance across system preferences", async ({ page }) => {
    await page.goto("test/themed/");
    await expect(page.getByRole("combobox", { name: "Color mode" })).toBeHidden();
    const body = page.locator("body");
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "light");
    const primaryBackground = await body.evaluate((element) => getComputedStyle(element).backgroundColor);
    await page.emulateMedia({ colorScheme: "light" });
    await expect(body).toHaveCSS("background-color", primaryBackground);
  });
});
