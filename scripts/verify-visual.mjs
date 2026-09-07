import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Extends the full Local Vault suite; all contexts use disposable synthetic data.
export async function verifyVisual({ browser, baseURL }) {
  const output = "artifacts/visual-lab/final";
  await mkdir(output, { recursive: true });
  const results = [], errors = [], requests = [];
  for (const width of [1440, 834, 390]) {
    for (const reducedMotion of ["reduce", "no-preference"]) {
      const label = `${width}-${reducedMotion}`;
      console.log(`Visual contracts: ${label}`);
      const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion, hasTouch: width <= 834 });
      await context.route("**/*", (route) => {
        const url = route.request().url();
        if (new URL(url).origin !== new URL(baseURL).origin) { requests.push(url); return route.abort(); }
        return route.continue();
      });
      // Prove the CSS/SVG path doesn't even attempt to acquire a canvas context.
      await context.addInitScript(() => {
        window.ambarCanvasAttempts = 0;
        const originalContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (...args) {
          // axe uses a private 2D canvas for its own text/color analysis.
          if (window.ambarAuditCanvas && args[0] === "2d") return originalContext.apply(this, args);
          window.ambarCanvasAttempts++; return null;
        };
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
      page.on("console", (message) => { if (message.type() === "error") errors.push(`${label}: ${message.text()}`); });
      await page.goto(baseURL);
      await expect(page.getByRole("heading", { name: "Your library, in view." })).toBeVisible();
      const art = page.locator("[data-hero-art]");
      await expect(art).toHaveAttribute("aria-hidden", "true");
      await expect(art).toHaveCSS("pointer-events", "none");
      await expect(page.locator("[data-animated-number]")).toHaveCount(4);
      await expect(page.locator("canvas, iframe, .overview-hero a[href]")).toHaveCount(0);
      const pointerEnabled = reducedMotion === "no-preference" && width === 1440;
      await expect(page.locator("[data-spotlight]")).toHaveCount(pointerEnabled ? 2 : 0);
      if (pointerEnabled) {
        const hero = page.locator(".overview-hero");
        const box = await hero.boundingBox();
        await page.mouse.move(box.x + box.width - 80, box.y + 60);
        await expect(hero.locator("[data-spotlight]")).toHaveAttribute("data-active", "true");
        await expect(hero.locator("[data-spotlight]")).toHaveCSS("pointer-events", "none");
        const target = page.locator(".leaf-front");
        const transform = await target.evaluate((node) => getComputedStyle(node).transform);
        await page.mouse.move(0, 0);
        await expect(hero.locator("[data-spotlight]")).toHaveAttribute("data-active", "false");
        assert.ok(transform);
      }
      for (const theme of ["light", "dark"]) {
        if (theme === "dark") await page.getByRole("button", { name: "Use dark theme" }).click();
        // Fixed terminal state for screenshots; normal motion is exercised above.
        await page.evaluate(() => document.getAnimations().forEach((animation) => { if (animation.effect?.getTiming().iterations !== Infinity) animation.finish(); }));
        const layout = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
        assert.ok(layout.scroll <= width && layout.body <= width, `${label}: overflow ${JSON.stringify(layout)}`);
        await page.evaluate(() => { window.ambarAuditCanvas = true; });
        const violations = (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations;
        await page.evaluate(() => { window.ambarAuditCanvas = false; });
        assert.deepEqual(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })), [], `${label}-${theme}: axe`);
        await page.screenshot({ path: `${output}/${width}-overview-${theme}-${reducedMotion}.png`, fullPage: true, animations: "disabled" });
        if (width === 390) await page.screenshot({ path: `${output}/390-viewport-${theme}-${reducedMotion}.png`, animations: "disabled" });
      }
      // A real storage event updates all four mounted stat cards without navigation.
      const numericSamples = await page.evaluate(async () => {
        const items = Array.from({ length: 30 }, (_, index) => ({ id: `visual-${index}`, type: "link", title: `Synthetic piece ${index}`, url: `https://example.com/visual-${index}`, site: "example.com", collection: "QA shelf", tags: [], note: "Synthetic visual QA", savedAt: "2026-09-06T12:00:00.000Z", status: "ready" }));
        localStorage.setItem("ambar:vault", JSON.stringify({ version: 1, updatedAt: "2026-09-06T12:00:00.000Z", items }));
        window.dispatchEvent(new StorageEvent("storage", { key: "ambar:vault" }));
        const samples = [];
        for (let frame = 0; frame < 45; frame++) {
          await new Promise(requestAnimationFrame);
          const number = document.querySelector("[data-animated-number]");
          samples.push({
            accessible: Number((number.querySelector(".sr-only") ?? number).textContent),
            visual: Number((number.querySelector('[aria-hidden="true"]') ?? number).textContent),
          });
        }
        return samples;
      });
      if (reducedMotion === "no-preference") assert.ok(numericSamples.some(({ accessible, visual }) => accessible === 30 && visual > 9 && visual < 30), `${label}: a real numeric tween`);
      else assert.ok(numericSamples.some(({ accessible }) => accessible === 30) && numericSamples.filter(({ accessible }) => accessible === 30).every(({ visual }) => visual === 30), `${label}: reduced numbers are immediately final`);
      await expect.poll(() => page.locator("[data-animated-number]").evaluateAll((nodes) => nodes.map((node) => (node.querySelector(".sr-only") ?? node).textContent))).toEqual(["30", "1", "0", "0"]);
      if (pointerEnabled) {
        const hero = page.locator(".overview-hero");
        await hero.hover();
        await expect(hero.locator("[data-spotlight]")).toHaveAttribute("data-active", "true");
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expect(page.locator("[data-spotlight]")).toHaveCount(0);
        await expect(page.locator('[data-animated-number] [aria-hidden="true"]')).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await expect(page.locator("[data-spotlight]")).toHaveCount(2);
      }
      const browse = page.getByRole("button", { name: "Browse library" });
      await browse.focus();
      await expect(browse).toBeFocused();
      const ring = await browse.evaluate((node) => ({ outline: getComputedStyle(node).outlineStyle, shadow: getComputedStyle(node).boxShadow }));
      assert.ok(ring.outline !== "none" || ring.shadow !== "none", `${label}: focus indicator`);
      // Focus in the hero triggers the same brand response as pointer hover.
      await page.keyboard.press("Enter");
      const list = page.getByRole("radio", { name: "List view", exact: true });
      await expect(list).toBeVisible();
      await list.focus();
      await page.keyboard.press("ArrowRight");
      const card = page.getByRole("radio", { name: "Card view", exact: true });
      await page.keyboard.press("Space");
      await expect(card).toBeFocused();
      await expect(card).toBeChecked();
      assert.equal(await page.evaluate(() => window.ambarCanvasAttempts), 0);
      if (reducedMotion === "reduce") {
        await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
      } else {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
      }
      results.push({ width, reducedMotion, themes: ["light", "dark"], canvasAttempts: 0, numericSamples, status: "passed" });
      await context.close();
    }
  }
  assert.deepEqual(requests, [], "No external runtime requests");
  assert.deepEqual(errors, [], "No browser console, hydration, or page errors");
  await writeFile(`${output}/results.json`, JSON.stringify({ browser: await browser.version(), results, requests, errors }, null, 2) + "\n");
}
