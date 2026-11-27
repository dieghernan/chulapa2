import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("shows the documented Bootstrap component families without inserting demo navbars", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const demo = page.locator("#bootstrap-kitchen-sink");
  await expect(page.locator(".navbar")).toHaveCount(1);
  await expect(demo.locator(".navbar")).toHaveCount(0);
  for (const heading of [
    "Surfaces and typography", "Images and figures", "Form controls", "Disabled forms",
    "Form sizing", "Input groups", "Floating labels", "Validation", "Accordion",
    "Breadcrumbs", "Buttons and button groups", "Carousel", "Menus",
    "Navigation and tabs", "Pagination", "Popovers and tooltips", "Progress bars",
    "Scrollspy", "Spinners", "Toast", "Alerts", "Badge", "Card", "List group", "Dialog",
    "Avatar", "Chips", "Close button", "Collapse", "Drawer", "Nav overflow", "Placeholder",
    "Stepper", "Toggler",
  ]) {
    await expect(demo.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
  for (const component of [
    "accordion", "alert", "avatar", "badge", "breadcrumb", "btn-solid", "btn-group",
    "card", "carousel", "chip", "btn-close", "collapse", "dialog", "drawer",
    "list-group", "menu", "nav", "nav-overflow", "pagination", "placeholder", "progress",
    "spinner-border", "stepper", "tab-pane", "toast",
  ]) {
    expect(await demo.locator(`.${component}`).count(), component).toBeGreaterThan(0);
  }
  for (const plugin of ["popover", "scroll", "toggler", "tooltip"]) {
    expect(await demo.locator(`[data-bs-toggle="${plugin}"], [data-bs-spy="${plugin}"]`).count(), plugin)
      .toBeGreaterThan(0);
  }
  const image = demo.getByRole("img", { name: "Illustrated ochre dunes" });
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBe(800);
  await expect(demo.getByRole("combobox", { name: "Region" })).toBeDisabled();
  await expect(demo.getByText("Enter a full email address.")).toBeVisible();
  const breadcrumb = demo.getByRole("navigation", { name: "Example breadcrumb" });
  await expect(breadcrumb.locator(".breadcrumb-divider")).toHaveCount(2);
  const dividerMask = await breadcrumb.locator(".breadcrumb-divider").first()
    .evaluate((element) => getComputedStyle(element, "::before").maskImage);
  expect(dividerMask).toMatch(/^url\(/);
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveClass("breadcrumb-link active");
  const alternative = demo.locator(".bd-callout-note");
  await expect(alternative).toHaveCSS("padding-inline-start", "28px");
  await expect(alternative).toHaveCSS("border-top-width", "1px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("runs the interactive examples in the standalone themed demo", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("test/dual/test/auto-themer/kitchen-sink/");
  const demo = page.locator("#bootstrap-kitchen-sink");
  await page.getByRole("combobox", { name: "Color mode" }).selectOption("dark");

  const summary = demo.locator("summary.accordion-header").filter({ hasText: "Build details" });
  const chevron = summary.locator("svg.accordion-icon");
  await expect(chevron).toHaveCSS("transform", "none");
  await summary.click();
  await expect(chevron).not.toHaveCSS("transform", "none");
  await expect(demo.getByText("Review the build settings for this example.")).toBeVisible();
  await expect(demo.getByText("Review the source settings for this example.")).toBeHidden();

  await demo.getByRole("button", { name: "Dismiss sample alert" }).click();
  await expect(demo.getByText("This sample alert can be dismissed.")).toHaveCount(0);

  await demo.getByRole("button", { name: "Next slide" }).click();
  await expect(demo.locator(".carousel-item.active img")).toHaveAttribute("alt", "Illustrated dunes");

  const menu = demo.getByRole("button", { name: "Menu Below" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(demo.locator(".menu").first().getByRole("link", { name: "Palette" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");

  await demo.getByRole("tab", { name: "Details" }).click();
  await expect(demo.getByRole("tabpanel", { name: "Details" })).toBeVisible();

  const scrollspy = demo.getByRole("region", { name: "Scrollable build stages" });
  await scrollspy.scrollIntoViewIfNeeded();
  await scrollspy.evaluate((panel) => { panel.scrollTop = panel.scrollHeight; });
  await expect(demo.getByRole("navigation", { name: "Scrollspy sections" }).getByRole("link", { name: "Publish" }))
    .toHaveClass(/active/);

  await demo.getByRole("button", { name: "Popover top" }).click();
  await expect(page.locator(".popover")).toContainText("Build detail");
  await demo.getByRole("button", { name: "Popover top" }).click();
  await demo.getByRole("button", { name: "Tooltip top" }).hover();
  await expect(page.getByRole("tooltip")).toHaveText("Shows the current build state.");

  await demo.getByRole("button", { name: "Show toast" }).click();
  await expect(demo.locator("#sink-toast")).toBeVisible();
  await demo.getByRole("button", { name: "Close toast" }).click();
  await expect(demo.locator("#sink-toast")).toBeHidden();

  await demo.getByRole("button", { name: "Open static dialog" }).click();
  const dialog = demo.getByRole("dialog", { name: "Confirm the sample" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirm sample" }).click();
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});

test("runs Collapse, Drawer, Nav overflow and Toggler without a demo navbar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const demo = page.locator("#bootstrap-kitchen-sink");
  const notes = demo.getByRole("button", { name: "Toggle build notes" });
  await notes.click();
  await expect(notes).toHaveAttribute("aria-expanded", "true");
  await expect(demo.getByText("Review the generated files before publication.")).toBeVisible();
  await notes.click();
  await expect(notes).toHaveAttribute("aria-expanded", "false");

  const drawerTrigger = demo.getByRole("button", { name: "Open build drawer" });
  await drawerTrigger.click();
  const drawer = demo.getByRole("dialog", { name: "Build summary" });
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(drawerTrigger).toBeFocused();

  const overflow = demo.getByRole("navigation", { name: "Overflow example" });
  await overflow.getByRole("button", { name: "More" }).click();
  await expect(overflow.locator(".nav-overflow-menu").getByRole("link", { name: "Interactive components" }))
    .toBeVisible();
  await page.keyboard.press("Escape");

  const toggler = demo.getByRole("button", { name: "Toggle surface tint" });
  const panel = demo.locator("#sink-toggler-surface");
  await toggler.click();
  await expect(panel).toHaveClass(/\bbg-2\b/);
  await toggler.click();
  await expect(panel).not.toHaveClass(/\bbg-2\b/);

  await demo.getByRole("button", { name: "Close sample" }).click();
  await expect(demo.locator("#sink-close-panel")).toHaveCount(0);
  await expect(demo.getByRole("button", { name: "Disabled close button" })).toBeDisabled();
});
