const fs = require("fs");
const path = require("path");
const assert = require("assert");

const playwrightPath = process.env.PLAYWRIGHT_PATH;
if (!playwrightPath) throw new Error("PLAYWRIGHT_PATH is required");
const { chromium } = require(playwrightPath);

const root = path.resolve(__dirname, "..");
const contentScript = path.join(root, "src", "content.js");
const outputPath = process.env.UI_SMOKE_SCREENSHOT || path.join(process.env.TEMP || __dirname, "designergpt-ui-smoke.png");
let browser;

function fileButtons(count) {
  return Array.from({ length: count }, (_, index) => `
    <button type="button" aria-label="File ${index + 1}"><svg></svg><p class="not-prose truncate">attachment-${index + 1}.txt</p></button>
  `).join("");
}

async function createRouteFixture(pathname, markup) {
  const routePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await routePage.route("https://chatgpt.com/**", (route) => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><html><body><main id="main">${markup}</main></body></html>`
  }));
  await routePage.addInitScript(() => {
    window.chrome = {
      runtime: { getURL: () => "", lastError: null },
      storage: {
        local: { get: (_keys, callback) => callback({ localChatgptStylerSettings: { enabled: true, theme: "default", backgroundMode: "solid", localNotes: true } }), set: (_values, callback) => callback?.(), remove: (_keys, callback) => callback?.() },
        onChanged: { addListener: () => {} }
      }
    };
  });
  await routePage.goto(`https://chatgpt.com${pathname}`);
  await routePage.addScriptTag({ path: contentScript });
  await routePage.waitForTimeout(200);
  return routePage;
}

(async () => {
  browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(3000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(`<!doctype html><html><head><title>Fixture - ChatGPT</title></head><body>
    <header id="page-header"><div data-testid="thread-header-right-actions-container" style="overflow:hidden"><div data-testid="thread-header-right-actions" style="overflow:hidden"><div id="conversation-header-actions" style="display:flex;align-items:center;gap:4px"><div id="header-actions" class="flex" style="display:flex;align-items:center"><button data-testid="share-chat-button" style="height:32px">Share</button><button aria-label="More">...</button></div></div></div></div></header>
    <main id="main">
      <div id="thread">
        <section data-turn="user"><div data-message-author-role="user" data-message-id="u1"><div class="user-message-bubble-color">First prompt</div></div></section>
        <section data-turn="assistant"><div data-message-author-role="assistant" data-message-id="a1"><div class="markdown"><h2>First answer 🙂</h2><ul><li>Useful item</li></ul><table><tr><th>Name</th><th>Value | unit</th></tr><tr><td>Alpha</td><td>1</td></tr></table><a href="https://example.com/source">Reference</a></div><button data-testid="copy-turn-action-button" aria-label="Copy response"><svg></svg></button><button aria-label="Sources"><svg></svg><span>Sources</span></button>${fileButtons(9)}</div></section>
        <section data-turn="assistant"><div class="flex items-center"><div aria-label="Announcements"><div style="width:1px;height:1px"></div></div><button>Memory updated</button></div><div data-message-author-role="assistant"><div data-testid="reasoning">Hidden thought</div><div class="markdown">The saved memory response remains visible.</div></div></section>
      </div>
      <form><div id="prompt-textarea" contenteditable="true" role="textbox"></div><button data-testid="send-button" aria-label="Send"><svg></svg></button></form>
      <div class="disclaimer"><div>ChatGPT can make mistakes. Check important info.</div></div>
    </main>
  </body></html>`);
  await page.evaluate(() => {
    const settings = {
      enabled: true,
      theme: "default",
      backgroundMode: "solid",
      promptTools: true,
      messageNavigator: true,
      promptSlashPalette: true,
      localNotes: false,
      zenMode: false
    };
    window.chrome = {
      runtime: { getURL: () => "", lastError: null },
      storage: {
        local: {
          get: (_keys, callback) => callback({ localChatgptStylerSettings: settings }),
          set: (_values, callback) => callback?.(),
          remove: (_keys, callback) => callback?.()
        },
        onChanged: { addListener: () => {} }
      }
    };
  });
  await page.addScriptTag({ path: contentScript });
  await page.waitForTimeout(200);

  const toolbar = page.locator("#local-chatgpt-styler-export");
  assert.strictEqual(await toolbar.isVisible(), true, "toolbar should be visible in a conversation");
  assert.strictEqual(await toolbar.evaluate((node) => node.parentElement.id), "conversation-header-actions", "toolbar must share the native flex alignment context");
  assert.strictEqual(await toolbar.evaluate((node) => Boolean(node.nextElementSibling?.querySelector('[data-testid="share-chat-button"]'))), true, "toolbar should sit before the current Share controls");
  for (const promptTools of [true, false, true]) {
    await page.evaluate((promptTools) => window.postMessage({ type: "LCGS_APPLY_SETTINGS", settings: { enabled: true, promptTools, messageNavigator: true } }, "*"), promptTools);
    await page.waitForTimeout(100);
    assert.ok(await toolbar.evaluate((node) => {
      const a = node.getBoundingClientRect();
      const b = document.querySelector('[data-testid="share-chat-button"]').getBoundingClientRect();
      return Math.abs((a.top + a.bottom - b.top - b.bottom) / 2) < 1;
    }), "toolbar and Share centers must align with Prompt on or off");
  }
  assert.strictEqual(await page.locator("[data-testid='send-button']").getAttribute("data-lcgs-action-control"), null, "send must not be themed as a message action");
  assert.strictEqual(await page.locator("[data-testid='copy-turn-action-button']").getAttribute("data-lcgs-action-control"), "icon", "known message action should be marked");
  assert.strictEqual(await page.locator("[data-lcgs-disclaimer='true']").isVisible(), false, "disclaimer should be hidden");

  await page.getByRole("button", { name: "Prompt", exact: true }).click();
  await page.waitForTimeout(200);
  assert.ok(await page.locator(".lcgs-snippet-list").evaluate((node) => node.scrollWidth <= node.clientWidth), "prompt snippets must not overflow horizontally");
  for (const row of await page.locator(".lcgs-snippet-row").all()) {
    assert.ok(await row.evaluate((node) => {
      const text = node.querySelector(".lcgs-snippet-main").getBoundingClientRect();
      const actions = node.querySelector(".lcgs-snippet-actions").getBoundingClientRect();
      return text.right <= actions.left;
    }), "snippet text must not overlap actions");
  }
  if (process.env.UI_PROMPT_SCREENSHOT) {
    await page.waitForTimeout(5000);
    await page.locator("#local-chatgpt-styler-prompt-tools .lcgs-tool-panel").screenshot({ path: process.env.UI_PROMPT_SCREENSHOT });
  }
  await page.getByRole("button", { name: "Close prompt tools" }).click();

  await page.getByRole("button", { name: "Nav" }).click();
  assert.strictEqual(await page.locator("#local-chatgpt-styler-navigator").getAttribute("data-open"), "true", "navigator should open");
  assert.strictEqual(await page.locator("[data-testid='thread-header-right-actions']").evaluate((node) => getComputedStyle(node).overflowX), "visible", "header wrappers must not clip DesignerGPT panels");
  assert.strictEqual(await page.locator("#local-chatgpt-styler-navigator .lcgs-tool-panel").evaluate((panel) => {
    const rect = panel.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + Math.min(20, rect.width / 2), rect.top + Math.min(20, rect.height / 2));
    return Boolean(hit && panel.contains(hit));
  }), true, "navigator panel must be reachable outside the header bounds");
  assert.strictEqual(await page.locator("#local-chatgpt-styler-navigator .lcgs-nav-list").evaluate((list) => list.scrollWidth <= list.clientWidth), true, "navigator list must not scroll horizontally");
  assert.match(await page.locator(".lcgs-nav-stats").innerText(), /9 files/, "navigator should count each attachment");
  if (process.env.UI_NAV_SCREENSHOT) {
    await page.waitForTimeout(5000);
    await page.locator("#local-chatgpt-styler-navigator .lcgs-tool-panel").screenshot({ path: process.env.UI_NAV_SCREENSHOT });
  }
  await page.locator(".lcgs-nav-row").nth(1).click();
  assert.strictEqual(await page.locator("#local-chatgpt-styler-navigator").getAttribute("data-open"), "false", "navigator should close after a jump");

  await page.getByRole("button", { name: "Download" }).click();
  await page.locator("[data-format='md']").click();
  assert.strictEqual(await page.locator("#local-chatgpt-styler-export-modal").isVisible(), true, "export modal should open");
  await page.locator("#lcgs-export-scope").selectOption("selected");
  assert.strictEqual(await page.locator("#lcgs-export-turns input").count(), 3, "turn picker should list each message once");
  assert.strictEqual(await page.locator("#lcgs-export-copy").isVisible(), true, "text formats should support clipboard export");
  await page.locator("#lcgs-export-turns input").first().uncheck();

  await page.waitForTimeout(5000);
  await page.screenshot({ path: outputPath, fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  const modalBox = await page.locator("#local-chatgpt-styler-export-modal .lcgs-modal").boundingBox();
  assert.ok(modalBox && modalBox.x >= 0 && modalBox.x + modalBox.width <= 390, "export modal must fit a narrow viewport");
  assert.strictEqual(await page.locator("#lcgs-export-confirm").isVisible(), true, "export action must remain reachable on mobile");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#lcgs-export-confirm").click()
  ]);
  const stream = await download.createReadStream();
  let markdown = "";
  for await (const chunk of stream) markdown += chunk.toString("utf8");
  assert.match(download.suggestedFilename(), /\.md$/, "Markdown export should use the correct extension");
  assert.doesNotMatch(markdown, /First prompt/, "unchecked turns must not be exported");
  assert.match(markdown, /First answer/, "checked turns must be exported");
  assert.match(markdown, /- Useful item/, "lists should retain structure");
  assert.match(markdown, /\| Name \| Value \\| unit \|/, "tables should retain structure and escape pipes");
  assert.match(markdown, /Reference \(https:\/\/example\.com\/source\)/, "links should retain their destination");
  assert.match(markdown, /\[Attachment: attachment-9\.txt\]/, "attachment names should be exported");
  assert.doesNotMatch(markdown, /Memory updated/, "memory labels should not enter exports");
  assert.doesNotMatch(markdown, /Hidden thought/, "visible thinking should respect its toggle");
  assert.match(markdown, /saved memory response remains visible/, "later checked turns must be exported");

  await page.getByRole("button", { name: "Download" }).click();
  await page.locator("[data-format='docx']").click();
  await page.locator("#lcgs-export-margin").selectOption("narrow");
  await page.locator("#lcgs-export-font-size").selectOption("18");
  const [docxDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#lcgs-export-confirm").click()
  ]);
  const docxStream = await docxDownload.createReadStream();
  const docxChunks = [];
  for await (const chunk of docxStream) docxChunks.push(chunk);
  const docxBytes = Buffer.concat(docxChunks);
  const docxRaw = docxBytes.toString("utf8");
  assert.match(docxDownload.suggestedFilename(), /\.docx$/, "DOCX export should use the correct extension");
  assert.ok(docxBytes.includes(Buffer.from("🙂")), "DOCX should preserve supplementary Unicode");
  assert.match(docxRaw, /w:pgMar w:top="720"/, "DOCX should honor narrow margins");
  assert.match(docxRaw, /w:sz w:val="36"/, "DOCX should honor font size");
  assert.match(docxRaw, /w:shd w:fill="F1EDF4"/, "DOCX should render assistant bubbles");

  await page.evaluate(() => document.documentElement.classList.add("lcgs-zen-mode-active"));
  assert.strictEqual(await toolbar.isVisible(), false, "Zen should hide the toolbar");
  assert.strictEqual(await page.getByText("Memory updated", { exact: true }).isVisible(), false, "Zen should hide only the memory label");
  assert.strictEqual(await page.locator("#thread").getByText("The saved memory response remains visible.").isVisible(), true, "Zen must preserve the assistant response");
  assert.strictEqual(await page.locator("[data-testid='send-button']").isVisible(), true, "Zen must preserve Send");

  await page.evaluate(() => {
    chrome.runtime.getURL = () => { throw new Error("Extension context invalidated."); };
    window.postMessage({ type: "LCGS_APPLY_SETTINGS", settings: { enabled: true, theme: "default", backgroundMode: "image" } }, "*");
  });
  await page.waitForTimeout(150);

  assert.deepStrictEqual(errors, [], `page errors: ${errors.join("; ")}`);

  const lateConversation = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await lateConversation.setContent('<!doctype html><html><body><main id="main"></main></body></html>');
  await lateConversation.evaluate(() => {
    window.chrome = {
      runtime: { getURL: () => "", lastError: null },
      storage: {
        local: { get: (_keys, callback) => callback({ localChatgptStylerSettings: { enabled: true, theme: "default", backgroundMode: "solid", promptTools: true, messageNavigator: true } }), set: (_values, callback) => callback?.(), remove: (_keys, callback) => callback?.() },
        onChanged: { addListener: () => {} }
      }
    };
  });
  await lateConversation.addScriptTag({ path: contentScript });
  await lateConversation.evaluate(() => {
    document.body.insertAdjacentHTML("afterbegin", '<header id="page-header"><div><button data-testid="share-chat-button">Share</button></div></header>');
    document.querySelector("#main").innerHTML = '<div id="thread"><section data-turn="assistant"><div data-message-author-role="assistant" data-message-id="late-a1"><div class="markdown">Loaded after navigation</div></div></section></div><form><div id="prompt-textarea" contenteditable="true" role="textbox"></div></form>';
  });
  await lateConversation.waitForTimeout(300);
  const lateToolbar = lateConversation.locator("#local-chatgpt-styler-export");
  assert.strictEqual(await lateToolbar.isVisible(), true, "toolbar should remount when a conversation arrives after initial load");
  assert.strictEqual(await lateToolbar.evaluate((node) => node.nextElementSibling?.getAttribute("data-testid")), "share-chat-button", "late toolbar should mount before Share");
  assert.strictEqual(await lateConversation.getByRole("button", { name: "Prompt", exact: true }).isVisible(), true, "Prompt should appear after SPA navigation");
  assert.strictEqual(await lateConversation.getByRole("button", { name: "Nav", exact: true }).isVisible(), true, "Nav should appear after SPA navigation");
  await lateConversation.evaluate(() => {
    document.querySelector("#page-header").outerHTML = '<header id="page-header"><div><button data-testid="share-chat-button">Share</button></div></header>';
  });
  await lateConversation.waitForTimeout(300);
  assert.strictEqual(await lateConversation.locator("#local-chatgpt-styler-export").count(), 1, "toolbar should survive a replaced SPA header without duplication");
  assert.strictEqual(await lateConversation.getByRole("button", { name: "Download", exact: true }).isVisible(), true, "toolbar should reattach after its header is replaced");
  assert.strictEqual(await lateConversation.getByRole("button", { name: "Prompt", exact: true }).isVisible(), true, "Prompt should survive a replaced SPA header");
  assert.strictEqual(await lateConversation.getByRole("button", { name: "Nav", exact: true }).isVisible(), true, "Nav should survive a replaced SPA header");
  await lateConversation.close();

  const work = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await work.setContent(`<!doctype html><html><body><main id="main"><div id="thread" class="group/thread"><div><h1>What should we work on?</h1><img alt="Work"><h2>Meet ChatGPT Work</h2><button><svg></svg>Start</button></div><form><div id="prompt-textarea" contenteditable="true"></div></form><div class="popover bg-token-main-surface-primary"><div class="__menu-item">Add photos &amp; files</div></div></div></main></body></html>`);
  await work.evaluate(() => {
    window.chrome = {
      runtime: { getURL: () => "", lastError: null },
      storage: {
        local: { get: (_keys, callback) => callback({ localChatgptStylerSettings: { enabled: true, theme: "default", backgroundMode: "solid", localNotes: true } }), set: (_values, callback) => callback?.(), remove: (_keys, callback) => callback?.() },
        onChanged: { addListener: () => {} }
      }
    };
  });
  await work.addScriptTag({ path: contentScript });
  await work.waitForTimeout(200);
  const workStyles = await work.evaluate(() => {
    const thread = getComputedStyle(document.querySelector("#thread"));
    const heading = getComputedStyle(document.querySelector("h1"));
    const popover = getComputedStyle(document.querySelector(".popover"));
    return {
      threadBackground: thread.backgroundColor,
      threadBorder: thread.borderTopWidth,
      headingBackground: heading.backgroundColor,
      headingMarked: document.querySelector("h1").hasAttribute("data-lcgs-splash-heading"),
      popoverBackground: popover.backgroundColor,
      viewerActive: document.documentElement.classList.contains("lcgs-image-viewer-active")
    };
  });
  assert.strictEqual(workStyles.threadBackground, "rgba(0, 0, 0, 0)", "Work thread must not become a card");
  assert.strictEqual(workStyles.threadBorder, "0px", "Work thread must keep native borders");
  assert.strictEqual(workStyles.headingBackground, "rgba(0, 0, 0, 0)", "Work heading must not become a bubble");
  assert.strictEqual(workStyles.headingMarked, false, "Work heading must not receive the chat splash marker");
  assert.notStrictEqual(workStyles.popoverBackground, "rgba(0, 0, 0, 0)", "upload popovers must remain opaque");
  assert.strictEqual(workStyles.viewerActive, false, "ordinary Work images and controls must not trigger image-viewer mode");
  assert.strictEqual(await work.locator("#local-chatgpt-styler-notes").count(), 0, "notes should not appear without a conversation");

  await work.evaluate(() => {
    const viewer = document.createElement("div");
    viewer.setAttribute("role", "dialog");
    viewer.innerHTML = '<button aria-label="Zoom level, 100%">100%</button><button>Comment</button><img alt="Edited image">';
    document.body.appendChild(viewer);
  });
  await work.waitForTimeout(250);
  assert.strictEqual(await work.locator("[role='dialog']").getAttribute("data-lcgs-image-viewer"), "true", "real image viewer should be marked");
  assert.strictEqual(await work.locator("#thread").isVisible(), true, "image viewer mode must not hide the underlying thread");

  const routeFixtures = [
    {
      path: "/library",
      className: "lcgs-view-library",
      markup: '<input id="artifacts-library-search-input" placeholder="Search"><div data-testid="page-table-toolbar-shell" data-toolbar style="background:#000"><div data-testid="artifacts-surface-library-toolbar-controls"><button>All</button></div></div><div role="list"><article data-surface>Library item</article></div>',
      surface: "article"
    },
    {
      path: "/scheduled",
      className: "lcgs-view-scheduled",
      markup: '<main class="bg-primary"><article data-surface>Scheduled task</article></main>',
      surface: "article"
    },
    {
      path: "/plugins",
      className: "lcgs-view-plugins",
      markup: '<div class="bg-primary min-h-screen"><article data-surface>Plugin</article></div>',
      surface: "article"
    }
  ];
  for (const fixture of routeFixtures) {
    const routePage = await createRouteFixture(fixture.path, fixture.markup);
    assert.strictEqual(await routePage.locator("html").getAttribute("class").then((value) => value?.includes(fixture.className)), true, `${fixture.path} should activate its route class`);
    assert.notStrictEqual(await routePage.locator(fixture.surface).evaluate((node) => getComputedStyle(node).backgroundColor), "rgba(0, 0, 0, 0)", `${fixture.path} content should remain readable over a wallpaper`);
    if (fixture.path === "/library") assert.strictEqual(await routePage.locator("[data-toolbar]").evaluate((node) => getComputedStyle(node).backgroundColor), "rgba(0, 0, 0, 0)", "Library toolbar shell should not render as a black band");
    assert.strictEqual(await routePage.locator("#local-chatgpt-styler-notes").count(), 0, `${fixture.path} should not show conversation notes`);
    await routePage.close();
  }

  const home = await createRouteFixture("/", '<h1>Where should we begin?</h1>');
  assert.strictEqual(await home.locator("h1").getAttribute("data-lcgs-splash-heading"), "true", "current home heading should receive splash styling");
  assert.strictEqual(await home.locator("#local-chatgpt-styler-notes").count(), 0, "home should not show conversation notes");
  await home.close();

  const project = await createRouteFixture("/g/g-p-example/project/", '<div id="thread"><h1>Project name</h1><button>New chat</button></div>');
  assert.ok((await project.locator("html").getAttribute("class"))?.includes("lcgs-view-project"), "project dashboard should activate its route class");
  assert.strictEqual(await project.locator("#thread").evaluate((node) => getComputedStyle(node).borderTopWidth), "0px", "project dashboard must not become a bordered chat card");
  assert.strictEqual(await project.locator("#thread").evaluate((node) => getComputedStyle(node).borderTopLeftRadius), "0px", "project dashboard must not inherit chat rounding");
  assert.strictEqual(await project.locator("#local-chatgpt-styler-notes").count(), 0, "project dashboard should not show conversation notes");
  await project.close();

  const popup = await browser.newPage({ viewport: { width: 456, height: 600 } });
  await popup.addInitScript(() => {
    window.__writes = [];
    window.chrome = {
      runtime: { getURL: (value) => value, openOptionsPage: () => {} },
      storage: {
        local: {
          get: (_keys, callback) => callback({}),
          set: (values, callback) => { window.__writes.push(values); callback?.(); },
          remove: (_keys, callback) => callback?.()
        },
        onChanged: { addListener: () => {} }
      }
    };
  });
  await popup.goto(`file://${path.join(root, "src", "popup.html").replace(/\\/g, "/")}`);
  const popupLayout = await popup.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    viewport: innerHeight,
    bodyWidth: document.body.getBoundingClientRect().width,
    promptTools: Boolean(document.querySelector("#promptTools")),
    navigator: Boolean(document.querySelector("#messageNavigator"))
  }));
  assert.ok(popupLayout.height <= popupLayout.viewport, "popup must not scroll");
  assert.strictEqual(popupLayout.bodyWidth, 456, "popup must declare a stable intrinsic browser-action width");
  assert.strictEqual(popupLayout.promptTools, true, "popup should expose Prompt tools");
  assert.strictEqual(popupLayout.navigator, true, "popup should expose Navigator");
  await popup.locator("#promptTools").check();
  await popup.locator("#messageNavigator").check();
  assert.ok(await popup.evaluate(() => window.__writes.some((entry) => entry.localChatgptStylerSettings?.promptTools && entry.localChatgptStylerSettings?.messageNavigator)), "popup toggles should persist");

  const optionsPage = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  await optionsPage.addInitScript(() => {
    window.__writes = [];
    window.chrome = {
      runtime: { getURL: (value) => value, lastError: null },
      storage: {
        local: {
          get: (_keys, callback) => callback({}),
          set: (values, callback) => { window.__writes.push(values); callback?.(); },
          remove: (_keys, callback) => callback?.()
        },
        onChanged: { addListener: () => {} }
      }
    };
  });
  await optionsPage.goto(`file://${path.join(root, "src", "options.html").replace(/\\/g, "/")}`);
  for (const tabId of ["theme", "chat", "branding", "advanced"]) {
    const tab = optionsPage.locator(`[data-settings-tab="${tabId}"]`);
    await tab.click();
    assert.strictEqual(await tab.getAttribute("aria-selected"), "true", `${tabId} tab should activate`);
    const controls = (await tab.getAttribute("aria-controls")).split(/\s+/).filter(Boolean);
    for (const panelId of controls) assert.strictEqual(await optionsPage.locator(`#${panelId}`).isVisible(), true, `${panelId} should be visible for ${tabId}`);
  }
  assert.strictEqual(await optionsPage.locator("#reasoningGuard").count(), 1, "Reasoning Guard should be configurable");
  await optionsPage.locator("#reasoningGuard").uncheck();
  assert.ok(await optionsPage.evaluate(() => window.__writes.some((entry) => entry.localChatgptStylerSettings?.reasoningGuard === false)), "advanced toggles should persist");
  await optionsPage.locator('[data-settings-tab="theme"]').click();
  await optionsPage.locator('[data-settings-tab="theme"]').press("ArrowRight");
  assert.strictEqual(await optionsPage.locator('[data-settings-tab="chat"]').getAttribute("aria-selected"), "true", "settings tabs should support keyboard navigation");
  const importControl = optionsPage.locator("#importSettings");
  assert.notStrictEqual(await importControl.evaluate((input) => getComputedStyle(input).display), "none", "import controls must remain keyboard focusable");
  const normalized = await optionsPage.evaluate(() => lcgsNormalizeSettings({ theme: "custom", customSettings: { fontSize: 999, chatWidth: "", pageRadius: -3, codeFontSize: NaN } }));
  assert.deepStrictEqual({ fontSize: normalized.fontSize, chatWidth: normalized.chatWidth, pageRadius: normalized.pageRadius, codeFontSize: normalized.codeFontSize }, { fontSize: 28, chatWidth: 1180, pageRadius: 0, codeFontSize: 14 }, "numeric settings should clamp and recover defaults");

  const failedPopup = await browser.newPage({ viewport: { width: 456, height: 600 } });
  await failedPopup.addInitScript(() => {
    window.chrome = {
      runtime: { getURL: (value) => value, lastError: { message: "Storage unavailable" } },
      storage: { local: { get: (_keys, callback) => callback({}), set: (_values, callback) => callback?.(), remove: (_keys, callback) => callback?.() }, onChanged: { addListener: () => {} } }
    };
  });
  await failedPopup.goto(`file://${path.join(root, "src", "popup.html").replace(/\\/g, "/")}`);
  assert.match(await failedPopup.locator("#popupStatus").innerText(), /Storage unavailable/, "popup should recover visibly from storage errors");

  await browser.close();
  console.log("UI smoke test passed");
})().catch(async (error) => {
  await browser?.close();
  console.error(error.message);
  process.exit(1);
});
