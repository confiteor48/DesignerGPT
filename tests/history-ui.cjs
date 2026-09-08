const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_PATH);
const root = path.resolve(__dirname, "..");
const id = "00000000-0000-4000-8000-000000000000";
const mid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
let browser;
(async () => {
  browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let fail = false;
  let apiCalls = 0;
  await page.route("https://chatgpt.com/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/auth/session") return route.fulfill({ json: { accessToken: "fixture-token" } });
    if (url.pathname.startsWith("/backend-api/")) {
      apiCalls++;
      if (fail) return route.fulfill({ status: 429, json: {} });
      const before = url.searchParams.get("before");
      const end = before ? Number(before.slice(-12)) - 1 : 300;
      const start = Math.max(1, end - 99);
      return route.fulfill({ json: {
        title: "Complete history fixture",
        messages: Array.from({ length: end - start + 1 }, (_, i) => {
          const n = start + i;
          return { id: mid(n), author: { role: n % 2 ? "user" : "assistant" }, content: { content_type: "text", parts: [`Message ${n}${n === 1 ? " ".repeat(2) + "Earlier content ".repeat(30) + "oldest-search-marker" : ""}`] } };
        }),
        page_info: { has_previous_page: start > 1, start_cursor: mid(start) }
      } });
    }
    return route.fulfill({ contentType: "text/html", body: `<!doctype html><title>History fixture</title><main id="main"><header id="page-header"><div id="conversation-header-actions" style="display:flex;align-items:center"><button data-testid="share-chat-button">Share</button></div></header><div id="thread">${Array.from({ length: 10 }, (_, i) => `<section data-turn="user"><div data-message-author-role="user" data-message-id="${mid(291 + i)}">Rendered ${291 + i}</div></section>`).join("")}</div><form><div id="prompt-textarea" contenteditable="true"></div></form></main>` });
  });
  await page.addInitScript(() => {
    window.chrome = { runtime: { getURL: () => "", lastError: null }, storage: {
      local: { get: (_keys, cb) => cb({ localChatgptStylerSettings: { enabled: true, messageNavigator: true, navigatorLimit: 20 } }), set: (_values, cb) => cb?.() },
      onChanged: { addListener: () => {} }
    } };
    window.copied = "";
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text) => { window.copied = text; } } });
  });
  await page.goto(`https://chatgpt.com/c/${id}`);
  await page.addScriptTag({ path: path.join(root, "src/history.js") });
  await page.addScriptTag({ path: path.join(root, "src/content.js") });
  await page.getByRole("button", { name: "Nav", exact: true }).click();
  await page.locator("[data-nav-status]").filter({ hasText: "Full saved conversation" }).waitFor();
  assert.match(await page.locator(".lcgs-nav-stats").innerText(), /300 turns/);
  assert.equal(await page.locator(".lcgs-nav-row").count(), 20);
  await page.locator("[data-nav-more]").click();
  await page.waitForFunction(() => document.querySelectorAll(".lcgs-nav-row").length === 40);
  await page.locator("[data-nav-filter]").fill("oldest-search-marker");
  await page.waitForFunction(() => document.querySelectorAll(".lcgs-nav-row").length === 1);
  assert.match(await page.locator(".lcgs-nav-index").innerText(), /U1/);
  assert.equal(apiCalls, 3, "filtering and paging reuse the complete history snapshot");
  await page.evaluate(() => {
    document.querySelector("#prompt-textarea").textContent = "Unsent draft";
    window.open = (url, target, features) => { window.jump = { url, target, features }; return null; };
  });
  await page.locator(".lcgs-nav-row").click();
  const jump = await page.evaluate(() => window.jump);
  assert.equal(new URL(jump.url).searchParams.get("messageId"), mid(1));
  assert.equal(jump.target, "_blank");
  assert.match(jump.features, /noopener/);
  assert.equal(await page.locator("#prompt-textarea").innerText(), "Unsent draft");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  await page.locator('button[data-format="json"]').click();
  await page.locator("[data-history-status]").filter({ hasText: "300 messages" }).waitFor();
  await page.locator("#lcgs-export-copy").click();
  await page.waitForFunction(() => window.copied.startsWith("{"));
  let exported = JSON.parse(await page.evaluate(() => window.copied));
  assert.equal(exported.messages.length, 300);
  assert.match(exported.messages[0].text, /oldest-search-marker/);
  assert.equal(exported.messages[299].text, "Message 300");
  assert.equal(exported.historySource, "complete-saved-conversation");
  assert.doesNotMatch(JSON.stringify(exported), /fixture-token/);
  await page.locator("#lcgs-export-scope").selectOption("selected");
  await page.locator("#lcgs-export-turns input").first().uncheck();
  await page.locator("[data-more-turns]").click();
  assert.equal(await page.locator("#lcgs-export-turns input").count(), 200);
  assert.equal(await page.locator("#lcgs-export-turns input").first().isChecked(), false);
  await page.evaluate(() => { window.copied = ""; });
  await page.locator("#lcgs-export-copy").click();
  await page.waitForFunction(() => window.copied.startsWith("{"));
  exported = JSON.parse(await page.evaluate(() => window.copied));
  assert.equal(exported.messages.length, 299, "selection includes checked messages beyond visible picker rows");
  assert.equal(exported.messages[0].text, "Message 2");
  await page.locator("[data-modal-close]").first().click();
  fail = true;
  await page.getByRole("button", { name: "Nav", exact: true }).click();
  await page.locator("[data-nav-status]").filter({ hasText: "rate-limiting" }).waitFor();
  assert.equal(await page.locator("[data-nav-copy]").isDisabled(), true);
  assert.equal(await page.locator(".lcgs-nav-row").count(), 0);
  fail = false;
  await page.locator("[data-nav-refresh]").click();
  await page.locator("[data-nav-status]").filter({ hasText: "Full saved conversation" }).waitFor();
  await page.getByRole("button", { name: "Close navigator" }).click();
  fail = true;
  await page.getByRole("button", { name: "Download", exact: true }).click();
  await page.locator('button[data-format="json"]').click();
  await page.locator("[data-history-status]").filter({ hasText: "rate-limiting" }).waitFor();
  assert.equal(await page.locator("#lcgs-export-confirm").isDisabled(), true);
  assert.equal(await page.locator("#lcgs-export-copy").isDisabled(), true);
  assert.equal(await page.locator("[data-history-retry]").isVisible(), true);
  await page.locator("#lcgs-export-scope").selectOption("rendered");
  await page.locator("[data-history-status]").filter({ hasText: "10 messages loaded" }).waitFor();
  assert.equal(await page.locator("#lcgs-export-copy").isDisabled(), false);
  assert.equal(await page.locator("[data-history-retry]").isVisible(), false);
  await page.locator("#lcgs-export-scope").selectOption("conversation");
  await page.locator("[data-history-status]").filter({ hasText: "rate-limiting" }).waitFor();
  fail = false;
  await page.locator("[data-history-retry]").click();
  await page.locator("[data-history-status]").filter({ hasText: "300 messages" }).waitFor();
  await page.evaluate(() => {
    history.pushState({}, "", "/");
    document.querySelector("#thread").appendChild(document.createElement("span"));
  });
  await page.locator("#local-chatgpt-styler-export-modal").waitFor({ state: "hidden" });
  assert.deepEqual(errors, []);
  console.log("Full-history UI tests passed (300 saved messages, 10 rendered)");
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => browser?.close());
