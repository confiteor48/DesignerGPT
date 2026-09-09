const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_PATH);
const root = path.resolve(__dirname, "..");
let browser;

(async () => {
  browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(`<!doctype html><html class="dark"><head><style>
    * { box-sizing: border-box; } body { margin:0; }
    .bg-token-bg-primary { background:var(--bg-primary); }
    .bg-token-bg-elevated-secondary { background:var(--bg-elevated-secondary,#000); }
    .bg-token-main-surface-primary { background:var(--main-surface-primary); }
    .bg-token-main-surface-tertiary { background:var(--main-surface-tertiary); }
    .hardcoded-dropdown { background:#353535; }
    [role=dialog] { border:1px solid; border-radius:16px; padding:24px; }
    #settings { width:min(680px,calc(100vw - 32px)); margin:16px; }
    [role=tablist] { display:flex; gap:8px; }
    button,input,select { font:inherit; border:1px solid; padding:8px; border-radius:6px; }
    [role=switch] { width:32px;height:20px;padding:2px; border:0; border-radius:999px; background:#777; }
    [role=switch][aria-checked=true] { background:#3a83f7; }
    [role=switch]>span { display:block; width:16px;height:16px;border-radius:50%;background:white; }
    [role=switch][aria-checked=true]>span { transform:translateX(12px); }
    .row { display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:20px; }
    [role=listbox],[role=menu],[role=tooltip],[role=alertdialog] { border:1px solid; padding:12px; width:240px; margin:16px; }
    #dialog-shell,#search-shell { background:rgba(0,0,0,.5); }
    #pricing { margin:16px; }
    [data-testid=pricing-modal-plan-grid] { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px; }
    [data-testid$="-pricing-modal-column"] { padding:16px;border:1px solid;border-radius:8px; }
    #image-preview { background:#202124 !important; }
    [data-testid="pro-pricing-modal-column"] { background-image:linear-gradient(#274b72,#212121); }
    @layer native { .btn-blue { background-color:var(--accent-blue,#2c67c5) !important; } }
    @media(max-width:700px){[data-testid=pricing-modal-plan-grid]{grid-template-columns:1fr;}}
  </style></head><body>
    <nav aria-label="Chat history"><a href="/images">Images</a><a href="/images?view=all">Images query</a><a href="/library">Library</a></nav>
    <main id="main"><a href="/images" id="content-image-link">An image link in content</a>
      <div id="profile-fixture"><section id="profile-stats">Stats</section><button aria-pressed="true">Daily</button><button aria-pressed="false">Weekly</button><div id="profile-cell" style="width:12px;height:12px;background:var(--profile-usage-level-2)"></div></div>
      <div id="settings" class="popover bg-token-bg-primary" role="dialog">
        <h2>Settings</h2><div role="tablist"><button role="tab" aria-selected="true">General</button><button role="tab" aria-selected="false">Notifications</button></div>
        <div class="row"><label for="search">Search settings</label><input id="search" placeholder="Search"></div>
        <div class="row"><span>Appearance</span><button role="combobox" aria-label="Appearance" aria-expanded="false">Dark</button></div>
        <div class="row"><span>Higher intelligence</span><button role="switch" aria-label="Higher intelligence" aria-checked="true"><span data-state="checked"></span></button></div>
        <div class="row"><span>Dictation</span><button role="switch" aria-label="Dictation" aria-checked="false"><span data-state="unchecked"></span></button></div>
        <div class="row"><span>Unavailable</span><button disabled role="switch" aria-checked="true"><span data-state="checked"></span></button></div>
        <div class="row"><label><input type="checkbox" checked>Native checkbox</label><button class="btn-primary">Save</button><button class="btn-secondary">Cancel</button></div>
      </div>
    </main>
    <div data-radix-popper-content-wrapper><div id="dropdown" role="listbox" class="popover hardcoded-dropdown"><div role="option" tabindex="0" aria-selected="true">Dark</div><div role="option" tabindex="0" aria-selected="false">Light</div><div role="option" aria-disabled="true">Unavailable</div></div></div>
    <div id="context-menu" role="menu" class="popover"><div role="menuitem" tabindex="0">Settings</div><div role="menuitem" aria-disabled="true">Unavailable</div></div>
    <div id="tooltip" role="tooltip">Theme tooltip</div><div id="alert" role="alertdialog">Confirmation<button class="btn-secondary">Cancel</button></div>
    <dialog id="dialog-shell" open><div id="profile-edit" role="dialog"><header>Edit profile</header><label>Display name <input value="Fixture"></label><footer><button class="btn-secondary">Cancel</button><button class="btn-primary">Save</button></footer></div></dialog>
    <div id="search-shell" role="dialog"><div id="search-panel" class="popover"><input placeholder="Search"><div>Recent chats</div></div></div>
    <div id="pricing" role="dialog" class="bg-token-bg-primary bg-token-bg-elevated-secondary"><div data-testid="pricing-modal-non-footer-content" class="bg-token-bg-elevated-secondary"><h2>Choose your plan</h2><div role="radiogroup" class="bg-token-main-surface-tertiary"><button role="radio" aria-checked="true">Personal</button><button role="radio" aria-checked="false">Business</button></div><div data-testid="pricing-modal-plan-grid">${["go","plus","pro"].map(plan=>`<div data-testid="${plan}-pricing-modal-column" class="bg-token-main-surface-primary"><div data-testid="${plan}-pricing-modal-column-top-half" class="bg-token-main-surface-primary"><h3>${plan}</h3></div><p>Plan details</p><button class="btn-secondary">Plan action</button></div>`).join("")}</div></div></div>
    <div id="image-preview" role="dialog"><canvas width="100" height="60"></canvas><button aria-label="Zoom level 100%">100%</button><button>Erase</button></div>
  </body></html>`);
  await page.evaluate(() => {
    document.querySelector('[data-testid="pro-pricing-modal-column"] .btn-secondary').className = 'btn btn-blue';
    window.chrome = { runtime: { getURL: () => "", lastError: null }, storage: { local: {
      get: (_keys, cb) => cb({ localChatgptStylerSettings: { enabled:true, theme:"default", compactSidebar:true, backgroundMode:"solid" } }),
      set: (_values, cb) => cb?.()
    }, onChanged: { addListener: () => {} } } };
    document.querySelectorAll('[role="switch"]:not(:disabled)').forEach(button => button.addEventListener('click', () => {
      const checked = button.getAttribute('aria-checked') !== 'true';
      button.setAttribute('aria-checked', String(checked));
      button.firstElementChild.dataset.state = checked ? 'checked' : 'unchecked';
    }));
  });
  await page.addScriptTag({ path:path.join(root,"src/content.js") });
  const color = (selector, property="backgroundColor") => page.locator(selector).evaluate((node, property)=>getComputedStyle(node)[property], property);
  const pixel = (selector) => page.locator(selector).evaluate(node => {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
    const ctx=canvas.getContext('2d');ctx.fillStyle=getComputedStyle(node).backgroundColor;ctx.fillRect(0,0,1,1);
    return Array.from(ctx.getImageData(0,0,1,1).data);
  });
  const panelColors=new Set();
  for (const [theme, rgb] of [["default",[32,33,35]],["paper",[255,253,248]],["developersTaste",[86,41,80]]]) {
    await page.evaluate(theme=>window.postMessage({type:"LCGS_APPLY_SETTINGS",settings:{enabled:true,theme,compactSidebar:true,backgroundMode:"solid"}},"*"),theme);
    await page.waitForTimeout(200);
    const panelPixel=await pixel('#settings');
    panelColors.add(JSON.stringify(panelPixel));
    for (const selector of ["#settings","#dropdown","#context-menu","#tooltip","#alert","#profile-edit","#search-panel","#pricing",'[data-testid="pricing-modal-non-footer-content"]']) {
      assert.deepEqual(await pixel(selector),panelPixel,`${theme} ${selector} must use the same opaque panel surface`);
    }
    assert.notEqual(await color('[data-testid="plus-pricing-modal-column"]'),await color('#pricing'),"pricing cards must be distinguishable");
    assert.equal(await color('[data-testid="pro-pricing-modal-column"]',"backgroundImage"),"none","Pro must not retain its hard-coded blue gradient");
    assert.equal((await pixel('[data-testid="pro-pricing-modal-column"]'))[3],255,"plan cards must be opaque");
    assert.notDeepEqual(await pixel('[data-testid="pro-pricing-modal-column"]'),await pixel('[data-testid="plus-pricing-modal-column"]'),"Pro must retain its accent treatment");
    assert.deepEqual(await pixel('.btn-blue'),await pixel('[role="switch"][aria-label="Higher intelligence"]'),"layered native blue actions must use the theme accent");
    assert.equal(await page.locator('#settings').evaluate(n=>getComputedStyle(n).colorScheme),theme==="paper"?"light":"dark");
    assert.notEqual(await color('[role="switch"][aria-label="Higher intelligence"]'),await color('[role="switch"][aria-label="Dictation"]'));
    assert.equal(await color('[role="switch"]:disabled',"opacity"),"0.5");
    assert.equal(await color('#dropdown [aria-disabled="true"]',"cursor"),"not-allowed");
    assert.notEqual(await color('#dropdown [aria-selected="true"]'),await color('#dropdown [aria-selected="false"]'));
    assert.notEqual(await color('[role="combobox"]'),"rgba(0, 0, 0, 0)");
    const backdropAlpha=(await pixel('#dialog-shell'))[3];
    assert.ok(backdropAlpha>130&&backdropAlpha<160,"dialog backdrop must remain a translucent dimmer");
    const searchBackdropAlpha=(await pixel('#search-shell'))[3];
    assert.ok(searchBackdropAlpha>130&&searchBackdropAlpha<160,"role-dialog wrapper must remain a translucent dimmer");
    assert.notEqual(await color('#profile-edit > header'),await color('#profile-edit'),"modal header must remain visually organized");
    assert.equal(await page.locator('nav a[href="/images"]').isVisible(),theme!=="developersTaste");
    assert.equal(await page.locator('nav a[href="/images?view=all"]').isVisible(),theme!=="developersTaste");
    assert.equal(await page.locator('nav a[href="/library"]').isVisible(),true);
    assert.equal(await page.locator('#content-image-link').isVisible(),true);
    assert.deepEqual(await pixel('#image-preview'),[32,33,36,255],"image viewer must retain its separate treatment");
    await page.evaluate(()=>document.documentElement.classList.add('lcgs-view-profile'));
    assert.deepEqual(await pixel('main#main'),[...rgb,255],`${theme} Profile must use an opaque data canvas`);
    assert.notDeepEqual(await pixel('#profile-stats'),await pixel('main#main'),`${theme} Profile stats must remain grouped`);
    assert.notEqual(await color('#profile-fixture [aria-pressed="true"]'),await color('#profile-fixture [aria-pressed="false"]'),`${theme} Profile segment state must be visible`);
    assert.equal((await pixel('#profile-cell'))[3],255,`${theme} Profile activity cells must be opaque over its canvas`);
    await page.evaluate(()=>document.documentElement.classList.remove('lcgs-view-profile'));
  }
  assert.equal(panelColors.size,3,"overlay panels must adapt to each theme palette");
  const toggle=page.getByRole('switch',{name:'Dictation',exact:true});
  const before=await toggle.boundingBox();
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-checked'),"true");
  const after=await toggle.boundingBox();
  assert.equal(after.width,before.width);assert.equal(after.height,before.height);
  await page.locator('#search').focus();
  await page.keyboard.press('Tab');
  assert.equal(await color('[role="combobox"]',"outlineStyle"),"solid");
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.locator('#settings').evaluate(n=>n.scrollWidth<=n.clientWidth),true);
    if(process.env.OVERLAY_SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.OVERLAY_SCREENSHOT_DIR,`overlays-${width}.png`),fullPage:true});
  }
  if(process.env.OVERLAY_PREVIEW) {
    const css=await page.locator('#local-chatgpt-styler-runtime').textContent();
    console.log(require('node:zlib').gzipSync(css.slice(css.indexOf('/* Portalled surfaces'),css.lastIndexOf('@media (max-width: 760px)'))).toString('base64'));
  }
  await page.evaluate(()=>window.postMessage({type:"LCGS_APPLY_SETTINGS",settings:{enabled:true,compactSidebar:false}},"*"));
  await page.waitForTimeout(100);
  assert.equal(await page.locator('nav a[href="/images"]').isVisible(),true);
  await page.evaluate(()=>window.postMessage({type:"LCGS_APPLY_SETTINGS",settings:{enabled:false}},"*"));
  await page.waitForTimeout(100);
  assert.equal(await color('#settings'),"rgba(0, 0, 0, 0)","disable must remove overlay styling");
  assert.deepEqual(errors,[]);
  console.log("Overlay tests passed: opaque surfaces, plans, controls, compact Images, three palettes and two viewports.");
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>browser?.close());
