import { expect, test } from "@playwright/test";

test("follows the system and remembers explicit modes across pages", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./");

  const root = page.locator("html");
  const body = page.locator("body");
  const select = page.getByRole("combobox", { name: "Color mode" });
  await expect(select).toHaveValue("");
  const lightBackground = await body.evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(body).not.toHaveCSS("background-color", lightBackground);
  const darkBackground = await body.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(select).toHaveValue("");

  await select.selectOption("light");
  await expect(root).toHaveAttribute("data-bs-theme", "light");
  await expect(body).toHaveCSS("background-color", lightBackground);
  await page.goto("test/markdown/");
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
  await page.goto("./");
  const select = page.getByRole("combobox", { name: "Color mode" });
  await expect(select).toHaveValue("");
  await select.selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, colorScheme: "dark" });

  test("still follows the operating system", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("combobox", { name: "Color mode" })).toBeHidden();
    const body = page.locator("body");
    const darkBackground = await body.evaluate((element) => getComputedStyle(element).backgroundColor);
    await page.emulateMedia({ colorScheme: "light" });
    await expect(body).not.toHaveCSS("background-color", darkBackground);
  });
});
