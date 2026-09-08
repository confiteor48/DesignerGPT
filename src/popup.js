const popupFields = [
  "enabled",
  "theme",
  "accentColor",
  "backgroundColor",
  "userBubble",
  "assistantBubble",
  "fontFamily",
  "brandMask",
  "fontSize",
  "chatWidth",
  "compactSidebar",
  "zenMode",
  "localNotes",
  "promptTools",
  "messageNavigator"
];

let popupSettings = { ...LCGS_DEFAULTS };
const popupReadabilityFieldIds = ["fontSize", "chatWidth"];
const popupFunctionalFieldIds = ["enabled", "zenMode", "localNotes", "promptTools", "messageNavigator"];

function applyPopupSettings(settings) {
  popupSettings = lcgsNormalizeSettings(settings || LCGS_DEFAULTS);
  for (const id of popupFields) setFieldValue(id, popupSettings[id]);
  syncOutputs();
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (!field) return;
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
  } else {
    field.value = value;
  }
}

function readFieldValue(id) {
  const field = document.getElementById(id);
  if (field.type === "checkbox") return field.checked;
  if (field.type === "range" || field.type === "number") return Number(field.value);
  return field.value;
}

function syncPopupTheme() {
  document.documentElement.style.setProperty("--accent", popupSettings.accentColor);
  document.documentElement.style.setProperty("--preview-user", popupSettings.userBubble);
  document.documentElement.style.setProperty("--preview-assistant", popupSettings.assistantBubble);
}

function syncOutputs() {
  document.getElementById("fontSizeValue").textContent = `${popupSettings.fontSize}px`;
  document.getElementById("chatWidthValue").textContent = `${popupSettings.chatWidth}px`;
  syncPopupTheme();
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

async function applyPopupThemePreset(theme) {
  popupSettings = lcgsApplyThemePreset(popupSettings, theme);
  if (!lcgsThemeUsesBundledBackground(theme)) return;

  popupSettings = {
    ...popupSettings,
    backgroundImage: await readDefaultThemeBackground(),
    backgroundImageName: LCGS_THEME_PRESETS[theme].backgroundImageName || LCGS_DEFAULTS.backgroundImageName
  };
}

async function initPopup() {
  lcgsPopulateSelect(document.getElementById("theme"), LCGS_THEME_OPTIONS);
  lcgsPopulateSelect(document.getElementById("fontFamily"), LCGS_FONT_OPTIONS);

  applyPopupSettings(await lcgsGetSettings());

  for (const id of popupFields) {
    const field = document.getElementById(id);
    const eventName = field.tagName === "SELECT" || field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventName, async () => {
      if (id === "theme") {
        await applyPopupThemePreset(readFieldValue(id));
      } else if (popupFunctionalFieldIds.includes(id)) {
        popupSettings = { ...popupSettings, [id]: readFieldValue(id) };
      } else {
        popupSettings = lcgsApplyCustomSettings(popupSettings, {
          [id]: readFieldValue(id),
          ...(popupReadabilityFieldIds.includes(id) ? { readabilityMode: "custom" } : {})
        });
      }
      syncOutputs();
      for (const fieldId of popupFields) setFieldValue(fieldId, popupSettings[fieldId]);
      await lcgsSaveSettings(popupSettings);
    });
  }

  document.getElementById("reset").addEventListener("click", async () => {
    popupSettings = { ...LCGS_DEFAULTS };
    await lcgsSaveSettings(popupSettings);
    applyPopupSettings(popupSettings);
  });

  if (globalThis.chrome?.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes[LCGS_STORAGE_KEY]) {
        applyPopupSettings(changes[LCGS_STORAGE_KEY].newValue);
      }
    });
  }
}

initPopup().catch((error) => {
  applyPopupSettings(LCGS_DEFAULTS);
  const status = document.getElementById("popupStatus");
  if (status) status.textContent = error?.message || "Settings are temporarily unavailable.";
});
