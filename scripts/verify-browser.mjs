import { verifyVisual } from "./verify-visual.mjs";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseURL = process.env.AMBAR_QA_URL ?? "http://localhost:8766";
assert.equal(new URL(baseURL).hostname, "localhost", "QA only runs against localhost");
const expectedHomePath = `${new URL(baseURL).pathname.replace(/\/$/, "")}/`;
const output = "artifacts/boardui";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.AMBAR_BROWSER_EXECUTABLE || undefined });
const results = [];
const legalResults = [];
const browserErrors = [];

async function checkLayout(page, label) {
  const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth }));
  assert.ok(metrics.scrollWidth <= metrics.width && metrics.bodyWidth <= metrics.width, `${label}: horizontal overflow ${JSON.stringify(metrics)}`);
  return metrics;
}
async function capture(page, name) {
  await checkLayout(page, name);
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  assert.deepEqual(scan.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })), [], `${name}: accessibility violations`);
}
async function navigate(page, width, name) {
  if (width > 1080) {
    const scope = name === "Agent Access" ? page.getByRole("complementary", { name: "Library navigation" }) : page.getByRole("navigation", { name: "Archive sections", exact: true });
    await scope.getByRole("button", { name: new RegExp(`^${name}`) }).click();
  } else if (width <= 760 && name !== "Agent Access") {
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("button", { name, exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Open library menu" }).click();
    await page.getByRole("dialog", { name: "Library menu" }).getByRole("button", { name: new RegExp(`^${name}`) }).click();
  }
}

async function checkChartLabels(page) {
  const clipped = await page.locator(".price-chart, .activity-chart").evaluateAll((charts) => charts.flatMap((chart) => {
    const box = chart.getBoundingClientRect();
    return [...chart.querySelectorAll(".native-chart-label")].filter((tick) => {
      const bounds = tick.getBoundingClientRect();
      return bounds.left < box.left - 1 || bounds.right > box.right + 1 || bounds.top < box.top - 1 || bounds.bottom > box.bottom + 1;
    }).map((tick) => tick.textContent);
  }));
  assert.deepEqual(clipped, [], "Chart axis labels must fit their card");
}

async function openSave(page, width) {
  if (width <= 760) await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("button", { name: "Quick save", exact: true }).click();
  else await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Quick save", exact: true })).toBeVisible();
}
async function openImport(page, width) {
  if (width <= 1080) {
    await page.getByRole("button", { name: "Open library menu" }).click();
    await expect(page.getByRole("dialog", { name: "Library menu" })).toBeVisible();
  }
  await page.getByRole("button", { name: "Import bookmarks", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Chrome bookmark import preview" })).toBeVisible();
}

try {
  await verifyVisual({ browser, baseURL });
  for (const width of [1440, 834, 390]) {
    console.log(`Verifying ${width}px…`);
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("request", (request) => { if (new URL(request.url()).origin !== new URL(baseURL).origin) browserErrors.push(`${width}: unexpected external request ${request.url()}`); });
    page.on("pageerror", (error) => browserErrors.push(`${width}: ${error.message}`));
    page.on("console", (message) => { if (message.type() === "error") browserErrors.push(`${width}: ${message.text()}`); });
    const response = await page.goto(baseURL);
    assert.equal(response.status(), 200);
    await expect(page.getByText("These sample pieces are not in your personal vault.")).toBeVisible();
    assert.equal(await page.evaluate(() => localStorage.getItem("ambar:vault")), null);
    await expect(page.getByRole("heading", { name: "Your library, in view." })).toBeVisible();
    await expect(page.getByRole("region", { name: "Library at a glance" })).toContainText("Saved items9");
    await expect(page.getByRole("img", { name: /Pour-over kettle, matte black price history: 12 observations/ })).toBeVisible();
    await expect(page.locator(".price-chart .native-chart-line")).toBeVisible();
    await checkChartLabels(page);
    await capture(page, `${width}-overview-light`);
    if (width === 390) await page.screenshot({ path: `${output}/390-overview-viewport.png` });
    await page.getByRole("button", { name: "Use dark theme" }).click();
    await capture(page, `${width}-overview-dark`);
    await page.getByRole("button", { name: "Use light theme" }).click();
    const observation = page.getByRole("slider", { name: "Price observation" });
    await observation.focus();
    await observation.press("ArrowLeft");
    await expect(page.getByRole("status", { name: "Selected price observation" })).toContainText("Observation 11 of 12: $136");
    await page.getByText("View price data", { exact: true }).click();
    await expect(page.getByRole("table", { name: "Price history observations" })).toBeVisible();
    await capture(page, `${width}-overview-price-data`);
    await page.getByText("View price data", { exact: true }).click();
    await page.getByRole("button", { name: "Price history product" }).click();
    await page.getByRole("option", { name: "Foldable steel storage crate" }).click();
    await expect(observation).toHaveValue("9");
    await expect(page.getByRole("img", { name: /Foldable steel storage crate price history: 10 observations/ })).toBeVisible();
    await page.getByRole("button", { name: "Open watched product" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Details for Foldable steel storage crate" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open watched product" })).toBeFocused();
    await page.getByRole("radio", { name: "7 days" }).click();
    await expect(page.locator(".activity-value")).toHaveText("7 saves");
    await page.getByText("View activity data", { exact: true }).click();
    await expect(page.getByRole("table", { name: "Archive saves by UTC date" })).toBeVisible();
    await page.getByText("View activity data", { exact: true }).click();
    await page.getByRole("button", { name: "Browse collection Desk tools" }).click();
    await expect(page.getByRole("heading", { name: "Desk tools" })).toBeVisible();
    await expect(page.locator(".archive-row")).toHaveCount(2);
    await page.getByRole("button", { name: "Clear collection filter" }).click();
    await navigate(page, width, "Overview");
    await page.getByRole("button", { name: "Browse library" }).click();
    await page.getByText("Demo states", { exact: true }).click();
    for (const [option, copy] of [["Loading preview", "Sorting the local index…"], ["Empty preview", "Nothing on this shelf yet"], ["Error preview", "Index unavailable"], ["Offline preview", "Showing the last four locally cached items."]]) {
      await page.getByRole("button", { name: "Preview state", exact: true }).click();
      await page.getByRole("option", { name: option, exact: true }).click();
      await expect(page.getByText(copy)).toBeVisible();
      await checkLayout(page, `${width}-${option}`);
    }
    await page.getByRole("button", { name: "Preview state", exact: true }).click();
    await page.getByRole("option", { name: "Live library", exact: true }).click();
    await page.getByText("Demo states", { exact: true }).click();
    if (width > 1080) await expect(page.getByRole("complementary", { name: "Library navigation" })).toBeVisible();
    else await expect(page.getByRole("button", { name: "Open library menu" })).toBeVisible();
    if (width <= 760) await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();

    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const row = document.querySelector(".archive-row");
      return { background: style.getPropertyValue("--color-background-secondary-default"), type: style.getPropertyValue("--text-body-medium"), radius: style.getPropertyValue("--radius-2lg"), rowDisplay: getComputedStyle(row).display, rowColumns: getComputedStyle(row).gridTemplateColumns };
    });
    assert.equal(tokens.rowDisplay, "grid");
    assert.ok(tokens.type.trim() && tokens.radius.trim() && tokens.background.trim());
    await page.getByRole("radio", { name: "List view", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Card view", exact: true })).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByRole("radio", { name: "Card view", exact: true })).toBeChecked();
    for (const view of ["List", "Card", "Gallery", "Table"]) {
      await page.getByRole("radio", { name: `${view} view`, exact: true }).click();
      await expect(page.getByRole("radio", { name: `${view} view`, exact: true })).toHaveAttribute("aria-checked", "true");
      if (view === "Table") {
        if (width <= 760) await expect(page.locator(".mobile-table-fallback")).toBeVisible();
        else await expect(page.getByRole("table", { name: "Compact archive table" })).toBeVisible();
      }
      await capture(page, `${width}-${view.toLowerCase()}-light`);
    }
    await page.getByRole("radio", { name: "List view", exact: true }).click();
    await page.getByRole("button", { name: "Use dark theme" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await capture(page, `${width}-list-dark`);
    await page.getByRole("button", { name: "Use light theme" }).click();

    // Modal keyboard/focus, search result model, genuine numeric sparkline.
    const search = page.getByRole("button", { name: "Search the archive" });
    await search.focus();
    await page.keyboard.press("Enter");
    const query = page.getByRole("combobox", { name: "Search archive" });
    await expect(query).toBeFocused();
    await query.fill("no-matching-record-qa");
    await expect(page.getByText(/No exact match/)).toBeVisible();
    await query.fill("kettle");
    await capture(page, `${width}-search`);
    await query.press("Enter");
    const details = page.getByRole("dialog", { name: /Details for Pour-over kettle/ });
    await expect(details).toBeVisible();
    await page.getByRole("tab", { name: "Details", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Price watch" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("img", { name: /^Price history:/ })).toBeVisible();
    await capture(page, `${width}-price-history`);
    await page.keyboard.press("Escape");
    await expect(details).toHaveCount(0);
    await expect(search).toBeFocused();

    await search.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await expect(search).toBeFocused();

    await openImport(page, width);
    await page.getByRole("button", { name: "Use safe demo export" }).click();
    await expect(page.getByText(/safe bookmarks ready to review/)).toBeVisible();
    await capture(page, `${width}-import-preview`);
    assert.equal(await page.evaluate(() => localStorage.getItem("ambar:vault")), null);
    await page.getByRole("button", { name: "Done reviewing" }).click();
    await expect(page.getByRole("button", { name: width <= 1080 ? "Open library menu" : "Import bookmarks", exact: true })).toBeFocused();

    await navigate(page, width, "Agent Access");
    await expect(page.getByRole("heading", { name: "Your archive, available on your terms." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Available after v0" })).toBeDisabled();
    await capture(page, `${width}-agent-access`);

    // Fresh personal save, cents/alert persistence, duplicate URL identity.
    await openSave(page, width);
    await expect(page.getByRole("textbox", { name: "Link", exact: true })).toBeFocused();
    if (width <= 1080) {
      for (const name of ["Link", "Title (optional)"]) {
        const field = page.getByRole("textbox", { name, exact: true });
        assert.ok((await field.boundingBox()).height >= 44, `${width}: ${name} touch target must be at least 44px tall`);
      }
    }
    await page.getByRole("textbox", { name: "Link", exact: true }).fill(`https://example.com/qa-${width}`);
    await page.getByLabel("Title (optional)").fill(`Personal archive lamp ${width}`);
    await page.getByLabel("Note (optional)").fill("Synthetic QA record.\nNo personal data.");
    await page.getByRole("button", { name: "Kind", exact: true }).click();
    await page.getByRole("option", { name: "Product", exact: true }).click();
    await capture(page, `${width}-quick-save`);
    // Tab and Shift+Tab stay inside the dialog.
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press("Tab");
      assert.ok(await page.evaluate(() => !!document.activeElement.closest('[role="dialog"]')));
    }
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await expect(page.getByText("Saved to Inbox", { exact: true })).toBeVisible();
    await page.reload();
    const savedItem = page.getByRole("button", { name: new RegExp(`Open Personal archive lamp ${width}`) });
    await expect(savedItem).toBeVisible();
    await expect(page.getByText("These sample pieces are not in your personal vault.")).toHaveCount(0);
    await savedItem.click();
    await page.getByRole("tab", { name: "Price watch" }).click();
    const targetField = page.getByRole("textbox", { name: "Target price in dollars", exact: true });
    await targetField.fill("12..50");
    await page.getByRole("button", { name: "Update target" }).click();
    await expect(targetField).toHaveAttribute("aria-invalid", "true");
    await targetField.focus();
    await capture(page, `${width}-invalid-target-focus`);
    await targetField.fill("12.50");
    await page.getByText("Price alert", { exact: true }).click();
    await expect(page.getByRole("switch", { name: /Price alert/ })).toBeChecked();
    await page.getByRole("switch", { name: /Price alert/ }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("switch", { name: /Price alert/ })).not.toBeChecked();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Update target" }).click();
    await expect(page.getByText("Target updated", { exact: true })).toBeVisible();
    await page.reload();
    await savedItem.click();
    await page.getByRole("tab", { name: "Price watch" }).click();
    await expect(page.getByRole("textbox", { name: "Target price in dollars", exact: true })).toHaveValue("12.50");
    await expect(page.getByRole("switch", { name: /Price alert/ })).toBeChecked();
    await page.keyboard.press("Escape");
    await openSave(page, width);
    await page.getByRole("textbox", { name: "Link", exact: true }).fill(`https://example.com/qa-${width}/?utm_source=test#note`);
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await expect(page.getByText("Already in your vault", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    const vault = await page.evaluate(() => JSON.parse(localStorage.getItem("ambar:vault")));
    assert.equal(vault.items.length, 1);
    assert.equal(vault.items[0].product.targetPriceCents, 1250);

    // Long content: synthetic data only, same validated envelope as the real save.
    await page.evaluate(() => {
      const vault = JSON.parse(localStorage.getItem("ambar:vault"));
      vault.items[0].title = "ExtraordinarilyLongUnbrokenArchiveTitle".repeat(12);
      vault.items[0].note = "Long unbroken note: " + "LongArchiveNote".repeat(80);
      vault.items[0].collection = "A very long collection name ".repeat(10);
      localStorage.setItem("ambar:vault", JSON.stringify(vault));
    });
    await page.reload();
    await checkLayout(page, `${width} long overview`);
    await page.getByRole("button", { name: "Browse library" }).click();
    for (const view of ["List", "Card", "Gallery", "Table"]) {
      await page.getByRole("radio", { name: `${view} view`, exact: true }).click();
      await checkLayout(page, `${width} long ${view}`);
    }
    await page.getByRole("radio", { name: "List view", exact: true }).click();
    await page.getByRole("button", { name: /Open ExtraordinarilyLong/ }).click();
    await capture(page, `${width}-long-detail`);
    await page.keyboard.press("Escape");

    await page.evaluate(() => localStorage.setItem("ambar:vault", "{broken-qa-json"));
    await page.reload();
    await expect(page.getByRole("alert").filter({ hasText: "Local vault needs recovery" })).toBeVisible();
    assert.equal(await page.evaluate(() => localStorage.getItem("ambar:vault")), "{broken-qa-json");
    await capture(page, `${width}-recovery`);
    await page.getByRole("button", { name: "Start a fresh local vault" }).click();
    await expect(page.getByText("Nothing on this shelf yet")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Nothing on this shelf yet")).toBeVisible();
    await capture(page, `${width}-empty`);

    // Already loaded local app remains usable without a network connection.
    await context.setOffline(true);
    await openSave(page, width);
    await page.getByRole("textbox", { name: "Link", exact: true }).fill(`https://example.com/offline-${width}`);
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await expect(page.getByText("Saved to Inbox", { exact: true })).toBeVisible();
    await context.setOffline(false);

    // Actual write failure is visibly retryable, without destroying a prior save.
    await page.evaluate(() => {
      window.ambarOriginalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (key === "ambar:vault") throw new DOMException("Synthetic QA quota failure", "QuotaExceededError");
        return window.ambarOriginalSetItem.call(this, key, value);
      };
    });
    await openSave(page, width);
    await page.getByRole("textbox", { name: "Link", exact: true }).fill(`https://example.com/retry-${width}`);
    await page.getByRole("button", { name: "Save item", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry local save" })).toBeVisible();
    await capture(page, `${width}-write-error`);
    await page.evaluate(() => { Storage.prototype.setItem = window.ambarOriginalSetItem; delete window.ambarOriginalSetItem; });
    await page.getByRole("button", { name: "Retry local save" }).click();
    await expect(page.getByText("Local vault ready", { exact: true })).toBeVisible();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("ambar:vault")).items.length), 2);
    results.push({ width, status: "passed", tokens, checks: "overview default/nav, computed stats, both accessible charts, no clipped chart labels, keyboard observation selection, product selector/detail/focus return, collection filter, production state previews, four views, both themes, search/focus, tabs/history, import, save/reload, target/reload, duplicate, long content, corrupt/recover/reload, loaded offline save" });
    await context.close();
  }
  for (const width of [1440, 834, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("pageerror", (error) => browserErrors.push(`${width} legal: ${error.message}`));
    page.on("console", (message) => { if (message.type() === "error") browserErrors.push(`${width} legal: ${message.text()}`); });
    for (const [route, heading] of [["privacy", "Privacy"], ["terms", "Terms"], ["404.html", "Nothing stored here"]]) {
      const response = await page.goto(`${baseURL}/${route}/`.replace("404.html/", "404.html"));
      assert.equal(response.status(), 200, `${route} static artifact should load`);
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: /AMBAR/ }).last()).toHaveAttribute("href", expectedHomePath);
      await capture(page, `${width}-${route.replace(".html", "")}`);
    }
    legalResults.push({ width, status: "passed" });
    await context.close();
  }
  assert.deepEqual(browserErrors, [], "Browser console/page errors");
  await writeFile(`${output}/results.json`, JSON.stringify({ baseURL, browser: await browser.version(), results, legalResults, browserErrors }, null, 2) + "\n");
  console.log(JSON.stringify({ browser: await browser.version(), widths: results.map(({ width, status }) => ({ width, status })), legalWidths: legalResults, browserErrors }, null, 2));
} finally {
  await browser.close();
}
