const optionFields = [
  "enabled",
  "theme",
  "fontFamily",
  "fontSize",
  "lineHeight",
  "chatWidth",
  "pageRadius",
  "readabilityMode",
  "backgroundMode",
  "backgroundColor",
  "backgroundGradient",
  "backgroundOpacity",
  "backgroundSize",
  "backgroundPosition",
  "backgroundBlur",
  "backgroundVignette",
  "surfaceColor",
  "surfaceText",
  "mutedText",
  "borderColor",
  "accentColor",
  "userBubble",
  "userText",
  "assistantBubble",
  "assistantText",
  "codeBackground",
  "codeText",
  "codeFontFamily",
  "codeFontSize",
  "codeBorderColor",
  "codeRadius",
  "composerBackground",
  "sidebarBackground",
  "brandMask",
  "compactSidebar",
  "zenMode",
  "localNotes",
  "advancedSafeMode",
  "reasoningGuard",
  "promptTools",
  "promptSlashPalette",
  "promptHistory",
  "promptHistoryMax",
  "messageNavigator",
  "navigatorLimit"
];

const settingsTabIds = ["theme", "chat", "branding", "advanced"];
const settingsTabPanels = {
  theme: ["appearance", "colors"],
  chat: ["chat"],
  branding: ["backgrounds", "identity"],
  advanced: ["advanced"]
};

const MAX_IMAGE_DATA_URL_BYTES = 1.5 * 1024 * 1024;
const BACKGROUND_MAX_DIMENSION = 1920;
const BRAND_MAX_DIMENSION = 768;
const PROMPT_SNIPPETS_STORAGE_KEY = "localChatgptStylerPromptSnippets";
const PROMPT_HISTORY_STORAGE_KEY = "localChatgptStylerPromptHistory";
const readabilityFieldIds = ["fontSize", "lineHeight", "chatWidth", "pageRadius"];
const functionalFieldIds = [
  "enabled",
  "zenMode",
  "localNotes",
  "advancedSafeMode",
  "reasoningGuard",
  "promptTools",
  "promptSlashPalette",
  "promptHistory",
  "promptHistoryMax",
  "messageNavigator",
  "navigatorLimit"
];

let optionSettings = { ...LCGS_DEFAULTS };

function normalizePromptSnippetCommand(value) {
  return String(value || "snippet").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32) || "snippet";
}

function normalizePromptSnippets(value) {
  const list = Array.isArray(value?.snippets) ? value.snippets : Array.isArray(value) ? value : [];
  return list
    .map((snippet, index) => ({
      id: String(snippet.id || `imported-${Date.now()}-${index}`),
      name: String(snippet.name || snippet.command || "Snippet").slice(0, 48),
      command: normalizePromptSnippetCommand(snippet.command || snippet.name),
      text: String(snippet.text || "").trim()
    }))
    .filter((snippet) => snippet.text)
    .slice(0, 80);
}

function getPromptSnippets() {
  return lcgsStorageGet(PROMPT_SNIPPETS_STORAGE_KEY)
    .then((result) => normalizePromptSnippets(result[PROMPT_SNIPPETS_STORAGE_KEY]));
}

function setPromptSnippets(snippets) {
  return lcgsStorageSet({ [PROMPT_SNIPPETS_STORAGE_KEY]: normalizePromptSnippets(snippets) });
}

function setOptionField(id, value) {
  const field = document.getElementById(id);
  if (!field) return;
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
  } else {
    field.value = value;
  }
}

function readOptionField(id) {
  const field = document.getElementById(id);
  if (field.type === "checkbox") return field.checked;
  if (field.type === "number" || field.type === "range") return Number(field.value);
  return field.value;
}

function syncOptionPreview() {
  document.documentElement.style.setProperty("--accent", optionSettings.accentColor);
  document.documentElement.style.setProperty("--preview-user", optionSettings.userBubble);
  document.documentElement.style.setProperty("--preview-user-text", optionSettings.userText);
  document.documentElement.style.setProperty("--preview-assistant", optionSettings.assistantBubble);
  document.documentElement.style.setProperty("--preview-assistant-text", optionSettings.assistantText);
  document.documentElement.style.setProperty("--preview-font-family", optionSettings.fontFamily);
  document.documentElement.style.setProperty("--preview-font-size", `${optionSettings.fontSize}px`);
  document.documentElement.style.setProperty("--preview-line-height", optionSettings.lineHeight);
  document.documentElement.style.setProperty("--preview-code-bg", optionSettings.codeBackground);
  document.documentElement.style.setProperty("--preview-code-text", optionSettings.codeText);
  document.documentElement.style.setProperty("--preview-code-font-family", optionSettings.codeFontFamily);
  document.documentElement.style.setProperty("--preview-code-font-size", `${optionSettings.codeFontSize}px`);
  document.documentElement.style.setProperty("--preview-code-border", optionSettings.codeBorderColor);
  document.documentElement.style.setProperty("--preview-code-radius", `${optionSettings.codeRadius}px`);
  const fontSizeValue = document.getElementById("fontSizePreviewValue");
  if (fontSizeValue) fontSizeValue.textContent = `${optionSettings.fontSize}px`;
  document.querySelectorAll("[data-theme-preview]").forEach((button) => {
    const active = button.dataset.themePreview === optionSettings.theme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  syncFileNames();
  syncRangeProgress(document.getElementById("fontSize"));
}

function syncFileNames() {
  const backgroundName = document.getElementById("backgroundImageName");
  const brandName = document.getElementById("brandImageName");
  if (backgroundName) {
    backgroundName.textContent = optionSettings.backgroundImageName || (optionSettings.backgroundImage ? "Uploaded image" : LCGS_DEFAULTS.backgroundImageName);
  }
  if (brandName) {
    brandName.textContent = optionSettings.brandImageName || (optionSettings.brandImage ? "Uploaded image" : LCGS_DEFAULTS.brandImageName);
  }
}

function syncRangeProgress(field) {
  if (!field || field.type !== "range") return;
  const min = Number(field.min) || 0;
  const max = Number(field.max) || 100;
  const value = Number(field.value);
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  field.style.setProperty("--range-progress", `${Math.max(0, Math.min(100, progress))}%`);
}

function setSettingsStatus(message = "", tone = "") {
  const status = document.getElementById("settingsStatus");
  if (!status) return;
  status.textContent = message;
  if (tone) {
    status.dataset.tone = tone;
  } else {
    delete status.dataset.tone;
  }
}

async function saveOptionsSettings(message = "") {
  try {
    await lcgsSaveSettings(optionSettings);
    setSettingsStatus(message);
    return true;
  } catch (error) {
    setSettingsStatus(`Could not save settings. ${error?.message || "The selected image may be too large."}`, "error");
    return false;
  }
}

async function saveOptionField(id) {
  if (id === "theme") {
    const theme = readOptionField(id);
    optionSettings = lcgsApplyThemePreset(optionSettings, theme);
    if (lcgsThemeUsesBundledBackground(theme)) {
      let backgroundImage = "";
      try {
        backgroundImage = await readDefaultThemeBackground();
      } catch (error) {
        setSettingsStatus(error?.message || "Could not load default background image.", "error");
        return;
      }
      optionSettings = {
        ...optionSettings,
        backgroundImage,
        backgroundImageName: LCGS_THEME_PRESETS[theme].backgroundImageName || LCGS_DEFAULTS.backgroundImageName
      };
    }
  } else if (id === "readabilityMode") {
    optionSettings = lcgsApplyReadabilityPreset(optionSettings, readOptionField(id));
  } else {
    let updates = { [id]: readOptionField(id) };
    if (readabilityFieldIds.includes(id)) {
      updates.readabilityMode = "custom";
    }
    if (id === "backgroundMode" && updates.backgroundMode === "image" && !optionSettings.backgroundImage) {
      let backgroundImage = "";
      try {
        backgroundImage = await readDefaultThemeBackground();
      } catch (error) {
        setSettingsStatus(error?.message || "Could not load default background image.", "error");
        return;
      }
      updates = {
        ...updates,
        backgroundImage,
        backgroundImageName: LCGS_DEFAULTS.backgroundImageName,
        backgroundOpacity: 0
      };
    }
    optionSettings = functionalFieldIds.includes(id)
      ? { ...optionSettings, [id]: readOptionField(id) }
      : lcgsApplyCustomSettings(optionSettings, updates);
  }
  if (id === "theme" || id !== "enabled") {
    for (const fieldId of optionFields) setOptionField(fieldId, optionSettings[fieldId]);
  }
  syncOptionPreview();
  await saveOptionsSettings();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readAssetAsDataUrl(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}.`);
  return readFileAsDataUrl(await response.blob());
}

function readDefaultThemeBackground() {
  return readAssetAsDataUrl("../assets/theme-background.jpg");
}

function dataUrlBytes(dataUrl) {
  return Math.ceil(String(dataUrl).length * 0.75);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Could not compress image."));
      }
    }, type, quality);
  });
}

function loadImageBitmap(file) {
  if (globalThis.createImageBitmap) {
    return createImageBitmap(file);
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    image.src = url;
  });
}

async function compressImageFile(file, options = {}) {
  const originalDataUrl = await readFileAsDataUrl(file);
  if (dataUrlBytes(originalDataUrl) <= MAX_IMAGE_DATA_URL_BYTES) {
    return {
      dataUrl: originalDataUrl,
      compressed: false,
      bytes: dataUrlBytes(originalDataUrl)
    };
  }

  const image = await loadImageBitmap(file);
  const maxDimension = options.maxDimension || BACKGROUND_MAX_DIMENSION;
  let scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  let width = Math.max(1, Math.round(image.width * scale));
  let height = Math.max(1, Math.round(image.height * scale));
  const mimeType = options.mimeType || "image/jpeg";
  const qualities = [0.86, 0.78, 0.7, 0.62, 0.54, 0.46, 0.38];

  for (let pass = 0; pass < 8; pass += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: mimeType !== "image/jpeg" });
    if (mimeType === "image/jpeg") {
      context.fillStyle = "#0a0911";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0, width, height);

    for (const quality of qualities) {
      const blob = await canvasToBlob(canvas, mimeType, quality);
      const dataUrl = await readFileAsDataUrl(blob);
      const bytes = dataUrlBytes(dataUrl);
      if (bytes <= MAX_IMAGE_DATA_URL_BYTES) {
        image.close?.();
        return { dataUrl, compressed: true, bytes };
      }
    }

    width = Math.max(1, Math.round(width * 0.82));
    height = Math.max(1, Math.round(height * 0.82));
  }

  image.close?.();
  throw new Error("Image is too large to compress below 1.5MB.");
}

function normalizeSettingsTabId(value) {
  const id = String(value || "").replace(/^#/, "");
  if (id === "top" || id === "appearance" || id === "colors") return "theme";
  if (id === "background" || id === "backgrounds" || id === "canvas" || id === "identity") return "branding";
  if (id === "advanced") return "advanced";
  return settingsTabIds.includes(id) ? id : "theme";
}

function activateSettingsTab(id, updateUrl = true) {
  const activeId = normalizeSettingsTabId(id);
  const activePanels = settingsTabPanels[activeId] || settingsTabPanels.theme;
  document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
    panel.hidden = !activePanels.includes(panel.dataset.settingsPanel);
  });
  document.querySelectorAll("[data-settings-tab]").forEach((tab) => {
    const active = tab.dataset.settingsTab === activeId;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  if (updateUrl && window.location.hash !== `#${activeId}`) {
    history.pushState(null, "", `#${activeId}`);
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function initSettingsTabs() {
  const links = Array.from(document.querySelectorAll(".settings-tabs a"));
  links.forEach((link, index) => {
    const id = settingsTabIds[index] || normalizeSettingsTabId(link.getAttribute("href"));
    link.href = `#${id}`;
    link.dataset.settingsTab = id;
    link.id = `settings-tab-${id}`;
    link.setAttribute("role", "tab");
    link.setAttribute("aria-controls", (settingsTabPanels[id] || [id]).join(" "));
    link.setAttribute("aria-selected", "false");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      activateSettingsTab(id);
    });
  });

  document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
    const owner = settingsTabIds.find((id) => settingsTabPanels[id]?.includes(panel.dataset.settingsPanel));
    if (owner) panel.setAttribute("aria-labelledby", `settings-tab-${owner}`);
  });

  const nav = document.querySelector(".settings-tabs");
  if (nav) {
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Settings sections");
    nav.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      const currentId = normalizeSettingsTabId(document.querySelector("[data-settings-tab].is-active")?.dataset.settingsTab);
      const currentIndex = settingsTabIds.indexOf(currentId);
      const nextIndex = event.key === "Home"
        ? 0
        : event.key === "End"
          ? settingsTabIds.length - 1
          : event.key === "ArrowDown" || event.key === "ArrowRight"
            ? (currentIndex + 1) % settingsTabIds.length
            : (currentIndex - 1 + settingsTabIds.length) % settingsTabIds.length;
      event.preventDefault();
      activateSettingsTab(settingsTabIds[nextIndex]);
      document.querySelector(`[data-settings-tab="${settingsTabIds[nextIndex]}"]`)?.focus();
    });
  }

  window.addEventListener("hashchange", () => activateSettingsTab(window.location.hash, false));
  window.addEventListener("popstate", () => activateSettingsTab(window.location.hash, false));
  activateSettingsTab(window.location.hash, false);
}

function renderThemeGallery() {
  const gallery = document.getElementById("themeGallery");
  if (!gallery) return;
  gallery.innerHTML = "";

  LCGS_THEME_OPTIONS
    .filter(([value]) => value !== "custom")
    .forEach(([value, label]) => {
      const preset = { ...LCGS_DEFAULTS, ...(LCGS_THEME_PRESETS[value] || {}) };
      const button = document.createElement("button");
      button.type = "button";
      button.className = "theme-preview-card";
      button.dataset.themePreview = value;
      button.style.setProperty("--theme-preview-bg", preset.backgroundMode === "solid" ? preset.backgroundColor : preset.backgroundGradient);
      button.style.setProperty("--theme-preview-surface", preset.surfaceColor);
      button.style.setProperty("--theme-preview-text", preset.surfaceText);
      button.style.setProperty("--theme-preview-muted", preset.mutedText);
      button.style.setProperty("--theme-preview-accent", preset.accentColor);
      button.style.setProperty("--theme-preview-user", preset.userBubble);
      button.style.setProperty("--theme-preview-assistant", preset.assistantBubble);
      button.innerHTML = `
        <span class="theme-preview-name">${label}</span>
        <span class="theme-preview-canvas" aria-hidden="true">
          <span class="theme-preview-line"></span>
          <span class="theme-preview-bubble user"></span>
          <span class="theme-preview-bubble assistant"></span>
        </span>
      `;
      button.addEventListener("click", async () => {
        setOptionField("theme", value);
        await saveOptionField("theme");
      });
      gallery.appendChild(button);
    });
}

async function initOptions() {
  initSettingsTabs();
  lcgsPopulateSelect(document.getElementById("theme"), LCGS_THEME_OPTIONS);
  lcgsPopulateSelect(document.getElementById("fontFamily"), LCGS_FONT_OPTIONS);
  lcgsPopulateSelect(document.getElementById("codeFontFamily"), LCGS_FONT_OPTIONS);
  lcgsPopulateSelect(document.getElementById("backgroundMode"), LCGS_BACKGROUND_OPTIONS);
  lcgsPopulateSelect(document.getElementById("backgroundSize"), LCGS_BACKGROUND_SIZE_OPTIONS);
  lcgsPopulateSelect(document.getElementById("backgroundPosition"), LCGS_BACKGROUND_POSITION_OPTIONS);
  lcgsPopulateSelect(document.getElementById("readabilityMode"), LCGS_READABILITY_OPTIONS);
  renderThemeGallery();

  optionSettings = await lcgsGetSettings();
  for (const id of optionFields) setOptionField(id, optionSettings[id]);
  syncOptionPreview();

  for (const id of optionFields) {
    const field = document.getElementById(id);
    if (!field) continue;
    const eventName = field.tagName === "SELECT" || field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventName, () => {
      syncRangeProgress(field);
      saveOptionField(id);
    });
  }

  document.getElementById("backgroundImageFile").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const previousSettings = optionSettings;
    let image;
    try {
      image = await compressImageFile(file, {
        mimeType: "image/jpeg",
        maxDimension: BACKGROUND_MAX_DIMENSION
      });
    } catch (error) {
      setSettingsStatus(error?.message || "Could not compress background image.", "error");
      event.target.value = "";
      return;
    }
    optionSettings = {
      ...lcgsApplyCustomSettings(optionSettings, {
        backgroundMode: "image",
        backgroundImage: image.dataUrl,
        backgroundImageName: file.name
      })
    };
    setOptionField("backgroundMode", "image");
    setOptionField("theme", "custom");
    syncOptionPreview();
    const savedMessage = image.compressed
      ? `Background image compressed and saved: ${file.name}`
      : `Background image saved: ${file.name}`;
    if (!(await saveOptionsSettings(savedMessage))) {
      optionSettings = previousSettings;
      event.target.value = "";
      for (const id of optionFields) setOptionField(id, optionSettings[id]);
      syncOptionPreview();
    }
    event.target.value = "";
  });

  document.getElementById("brandImageFile").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const previousSettings = optionSettings;
    let image;
    try {
      image = await compressImageFile(file, {
        mimeType: "image/webp",
        maxDimension: BRAND_MAX_DIMENSION
      });
    } catch (error) {
      setSettingsStatus(error?.message || "Could not compress brand image.", "error");
      event.target.value = "";
      return;
    }
    optionSettings = {
      ...lcgsApplyCustomSettings(optionSettings, {
        brandImage: image.dataUrl,
        brandImageName: file.name
      })
    };
    setOptionField("theme", "custom");
    syncOptionPreview();
    const savedMessage = image.compressed
      ? `Brand image compressed and saved: ${file.name}`
      : `Brand image saved: ${file.name}`;
    if (!(await saveOptionsSettings(savedMessage))) {
      optionSettings = previousSettings;
      event.target.value = "";
      for (const id of optionFields) setOptionField(id, optionSettings[id]);
      syncOptionPreview();
    }
    event.target.value = "";
  });

  document.getElementById("resetBackgroundImage").addEventListener("click", async () => {
    let backgroundImage = "";
    try {
      backgroundImage = await readDefaultThemeBackground();
    } catch (error) {
      setSettingsStatus(error?.message || "Could not load default background image.", "error");
      return;
    }
    optionSettings = {
      ...lcgsApplyCustomSettings(optionSettings, {
        backgroundMode: "image",
        backgroundImage,
        backgroundImageName: LCGS_DEFAULTS.backgroundImageName,
        backgroundOpacity: LCGS_DEFAULTS.backgroundOpacity
      })
    };
    document.getElementById("backgroundImageFile").value = "";
    setOptionField("backgroundMode", "image");
    setOptionField("theme", "custom");
    syncOptionPreview();
    await saveOptionsSettings("Background image reset.");
  });

  document.getElementById("resetBrandImage").addEventListener("click", async () => {
    optionSettings = {
      ...lcgsApplyCustomSettings(optionSettings, {
        brandImage: "",
        brandImageName: LCGS_DEFAULTS.brandImageName
      })
    };
    document.getElementById("brandImageFile").value = "";
    setOptionField("theme", "custom");
    syncOptionPreview();
    await saveOptionsSettings();
  });

  document.getElementById("reset").addEventListener("click", async () => {
    optionSettings = { ...LCGS_DEFAULTS };
    await saveOptionsSettings("Settings reset.");
    for (const id of optionFields) setOptionField(id, optionSettings[id]);
    syncOptionPreview();
  });

  document.getElementById("exportSettings").addEventListener("click", () => {
    lcgsDownloadJson("designergpt-settings.json", optionSettings);
  });

  document.getElementById("exportTheme").addEventListener("click", () => {
    lcgsDownloadJson("designergpt-theme.json", lcgsCreateThemeExport(optionSettings));
  });

  document.getElementById("clearPromptHistory").addEventListener("click", async () => {
    try {
      await lcgsStorageRemove(PROMPT_HISTORY_STORAGE_KEY);
      setSettingsStatus("Prompt history cleared.");
    } catch (error) {
      setSettingsStatus(error?.message || "Could not clear prompt history.", "error");
    }
  });

  document.getElementById("exportPromptSnippets").addEventListener("click", async () => {
    lcgsDownloadJson("designergpt-prompt-snippets.json", {
      exportedAt: new Date().toISOString(),
      snippets: await getPromptSnippets()
    });
    setSettingsStatus("Prompt snippets exported.");
  });

  document.getElementById("importTheme").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      const themeSettings = lcgsReadThemeExport(imported);
      optionSettings = lcgsApplyCustomSettings(optionSettings, themeSettings);
      await saveOptionsSettings("Theme imported.");
      for (const id of optionFields) setOptionField(id, optionSettings[id]);
      syncOptionPreview();
    } catch (error) {
      setSettingsStatus(error?.message || "Could not import theme.", "error");
    } finally {
      event.target.value = "";
    }
  });

  document.getElementById("importSettings").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported || typeof imported !== "object" || Array.isArray(imported)) throw new Error("Settings file must contain a JSON object.");
      optionSettings = lcgsNormalizeSettings({ ...LCGS_DEFAULTS, ...imported });
      await saveOptionsSettings("Settings imported.");
      for (const id of optionFields) setOptionField(id, optionSettings[id]);
      syncOptionPreview();
    } catch (error) {
      setSettingsStatus(error?.message || "Could not import settings.", "error");
    } finally {
      event.target.value = "";
    }
  });

  document.getElementById("importPromptSnippets").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      const snippets = normalizePromptSnippets(JSON.parse(await file.text()));
      await setPromptSnippets(snippets);
      setSettingsStatus(`${snippets.length} prompt snippet${snippets.length === 1 ? "" : "s"} imported.`);
    } catch (error) {
      setSettingsStatus(error?.message || "Could not import prompt snippets.", "error");
    } finally {
      event.target.value = "";
    }
  });
}

initOptions().catch((error) => {
  setSettingsStatus(error?.message || "DesignerGPT settings could not be loaded.", "error");
});
