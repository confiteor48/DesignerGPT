const path = require("path");
const assert = require("assert");
const { pathToFileURL } = require("url");
const { chromium } = require(process.env.PLAYWRIGHT_PATH);

const root = path.resolve(__dirname, "..");
const output = process.env.UI_REVIEW_OUTPUT || path.join(root, "assets", "screenshots");

(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const values = {};
      window.chrome = {
        runtime: { getURL: (value) => value, lastError: null },
        storage: {
          local: {
            get: (_keys, callback) => callback(values),
            set: (next, callback) => { Object.assign(values, next); callback?.(); },
            remove: (key, callback) => { delete values[key]; callback?.(); }
          },
          onChanged: { addListener: () => {} }
        }
      };
    });
    await page.goto(pathToFileURL(path.join(root, "src/options.html")).href);
    for (const tab of ["theme", "chat", "branding", "advanced"]) {
      await page.locator(`[data-settings-tab="${tab}"]`).click();
      await page.waitForTimeout(5000);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${tab} overflow`);
      await page.screenshot({ path: path.join(output, `settings-${tab}.png`) });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    for (const tab of ["theme", "chat", "branding", "advanced"]) {
      await page.locator(`[data-settings-tab="${tab}"]`).click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `mobile ${tab} overflow`);
      assert.ok(await page.locator(".settings-panels").evaluate((node) => node.scrollWidth <= node.clientWidth), `mobile ${tab} panel overflow`);
    }
    await page.locator('[data-settings-tab="theme"]').click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(output, "settings-mobile.png") });
    await page.setViewportSize({ width: 456, height: 600 });
    await page.goto(pathToFileURL(path.join(root, "src/popup.html")).href);
    await page.waitForTimeout(5000);
    assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), "popup overflow");
    await page.screenshot({ path: path.join(output, "popup.png") });
    assert.deepStrictEqual(errors, []);
    console.log("Visual review: four desktop tabs, four mobile tabs, and popup passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
