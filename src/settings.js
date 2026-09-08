const LCGS_STORAGE_KEY = "localChatgptStylerSettings";
const LCGS_LEGACY_DEFAULT_THEME = ["cla", "raos"].join("");

const LCGS_DEFAULTS = {
  enabled: true,
  theme: "default",
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  fontSize: 16,
  lineHeight: 1.7,
  chatWidth: 1180,
  pageRadius: 14,
  readabilityMode: "custom",
  backgroundMode: "solid",
  backgroundColor: "#0b0d10",
  backgroundGradient: "linear-gradient(135deg, #070809 0%, #11151a 52%, #0b0d10 100%)",
  backgroundImage: "",
  backgroundImageName: "theme-background.jpg",
  backgroundOpacity: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundBlur: 0,
  backgroundVignette: 0,
  surfaceColor: "#202123",
  surfaceText: "#ececf1",
  mutedText: "#acacbe",
  borderColor: "#3f4147",
  accentColor: "#7d8491",
  userBubble: "#2f3033",
  userText: "#f4f4f5",
  assistantBubble: "#202123",
  assistantText: "#ececf1",
  codeBackground: "#151619",
  codeText: "#f1f1f2",
  codeFontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  codeFontSize: 14,
  codeBorderColor: "#3f4147",
  codeRadius: 10,
  composerBackground: "#2b2c30",
  sidebarBackground: "#0b0d10",
  brandMask: "",
  brandImage: "",
  brandImageName: "brand-default.png",
  compactSidebar: false,
  zenMode: false,
  localNotes: false,
  advancedSafeMode: false,
  reasoningGuard: true,
  promptTools: false,
  promptSlashPalette: true,
  promptHistory: false,
  promptHistoryMax: 50,
  messageNavigator: false,
  navigatorLimit: 80,
  customSettings: null
};

const LCGS_CUSTOM_FIELDS = [
  "fontFamily",
  "fontSize",
  "lineHeight",
  "chatWidth",
  "pageRadius",
  "readabilityMode",
  "backgroundMode",
  "backgroundColor",
  "backgroundGradient",
  "backgroundImage",
  "backgroundImageName",
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
  "brandImage",
  "brandImageName",
  "compactSidebar"
];

const LCGS_COLOR_FIELDS = [
  "backgroundColor",
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
  "composerBackground",
  "sidebarBackground"
];

const LCGS_THEME_PRESETS = {
  default: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    backgroundMode: "solid",
    backgroundColor: "#0b0d10",
    backgroundGradient: "linear-gradient(135deg, #070809 0%, #11151a 52%, #0b0d10 100%)",
    backgroundImage: "",
    backgroundImageName: "theme-background.jpg",
    backgroundOpacity: 0,
    surfaceColor: "#202123",
    surfaceText: "#ececf1",
    mutedText: "#acacbe",
    borderColor: "#3f4147",
    accentColor: "#7d8491",
    userBubble: "#2f3033",
    userText: "#f4f4f5",
    assistantBubble: "#202123",
    assistantText: "#ececf1",
    codeBackground: "#151619",
    codeText: "#f1f1f2",
    composerBackground: "#2b2c30",
    sidebarBackground: "#0b0d10"
  },
  developersTaste: {
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
    backgroundMode: "image",
    backgroundColor: "#0a0911",
    backgroundGradient: "linear-gradient(135deg, #0a0911 0%, #151320 52%, #09070e 100%)",
    backgroundImage: "",
    backgroundImageName: "theme-background.jpg",
    backgroundOpacity: 0,
    surfaceColor: "#562950",
    surfaceText: "#f4edf6",
    mutedText: "#c9b2d4",
    borderColor: "#b67bc6",
    accentColor: "#e017b8",
    userBubble: "#202944",
    userText: "#fff7ff",
    assistantBubble: "#5b2b6f",
    assistantText: "#fff7ff",
    codeBackground: "#17131f",
    codeText: "#f8f8f2",
    composerBackground: "#160a19",
    sidebarBackground: "#38073b",
    compactSidebar: true
  },
  graphite: {
    backgroundMode: "gradient",
    backgroundColor: "#111315",
    backgroundGradient: "linear-gradient(135deg, #101214 0%, #262a2e 48%, #0b0d0f 100%)",
    surfaceColor: "#1c2024",
    surfaceText: "#f4f6f8",
    mutedText: "#aeb7c0",
    borderColor: "#3a424b",
    accentColor: "#8fb3c7",
    userBubble: "#26313a",
    userText: "#f7fbff",
    assistantBubble: "#202429",
    assistantText: "#f4f6f8",
    codeBackground: "#14181d",
    codeText: "#edf3f7",
    composerBackground: "#101315",
    sidebarBackground: "#111315"
  },
  paper: {
    backgroundMode: "gradient",
    backgroundColor: "#f4f1ea",
    backgroundGradient: "linear-gradient(135deg, #f4f1ea 0%, #e5edf0 54%, #fbfaf7 100%)",
    surfaceColor: "#fffdf8",
    surfaceText: "#20252a",
    mutedText: "#66707a",
    borderColor: "#d7d3ca",
    accentColor: "#276f77",
    userBubble: "#dbe9e5",
    userText: "#14211e",
    assistantBubble: "#fffdf8",
    assistantText: "#20252a",
    codeBackground: "#eef1f1",
    codeText: "#192126",
    composerBackground: "#fffdf8",
    sidebarBackground: "#ebe7dd"
  },
  midnight: {
    backgroundMode: "gradient",
    backgroundColor: "#080b12",
    backgroundGradient: "linear-gradient(135deg, #080b12 0%, #19233a 52%, #111827 100%)",
    surfaceColor: "#101522",
    surfaceText: "#eef4ff",
    mutedText: "#a9b4ca",
    borderColor: "#293349",
    accentColor: "#7db5ff",
    userBubble: "#24385b",
    userText: "#f5f9ff",
    assistantBubble: "#111827",
    assistantText: "#eef6ff",
    codeBackground: "#070a10",
    codeText: "#dce9ff",
    composerBackground: "#0f1420",
    sidebarBackground: "#080b12"
  },
  meadow: {
    backgroundMode: "gradient",
    backgroundColor: "#172016",
    backgroundGradient: "linear-gradient(135deg, #172016 0%, #263523 46%, #1a2524 100%)",
    surfaceColor: "#1d281f",
    surfaceText: "#eef6ea",
    mutedText: "#afbea9",
    borderColor: "#364536",
    accentColor: "#a7d66d",
    userBubble: "#33442a",
    userText: "#f5ffe9",
    assistantBubble: "#202a21",
    assistantText: "#eef6ea",
    codeBackground: "#111811",
    codeText: "#e2f0d8",
    composerBackground: "#1a241b",
    sidebarBackground: "#121a12"
  },
  dracula: {
    backgroundMode: "gradient",
    backgroundColor: "#282a36",
    backgroundGradient: "linear-gradient(135deg, #282a36 0%, #1f2130 52%, #191a21 100%)",
    surfaceColor: "#343746",
    surfaceText: "#f8f8f2",
    mutedText: "#bd93f9",
    borderColor: "#6272a4",
    accentColor: "#ff79c6",
    userBubble: "#44475a",
    userText: "#f8f8f2",
    assistantBubble: "#2f3240",
    assistantText: "#f8f8f2",
    codeBackground: "#1e1f29",
    codeText: "#50fa7b",
    composerBackground: "#242631",
    sidebarBackground: "#21222c"
  },
  nord: {
    backgroundMode: "gradient",
    backgroundColor: "#2e3440",
    backgroundGradient: "linear-gradient(135deg, #2e3440 0%, #3b4252 50%, #242933 100%)",
    surfaceColor: "#3b4252",
    surfaceText: "#eceff4",
    mutedText: "#d8dee9",
    borderColor: "#4c566a",
    accentColor: "#88c0d0",
    userBubble: "#434c5e",
    userText: "#eceff4",
    assistantBubble: "#333b49",
    assistantText: "#eceff4",
    codeBackground: "#242933",
    codeText: "#a3be8c",
    composerBackground: "#2b303b",
    sidebarBackground: "#242933"
  },
  gruvbox: {
    backgroundMode: "gradient",
    backgroundColor: "#282828",
    backgroundGradient: "linear-gradient(135deg, #282828 0%, #32302f 48%, #1d2021 100%)",
    surfaceColor: "#3c3836",
    surfaceText: "#fbf1c7",
    mutedText: "#d5c4a1",
    borderColor: "#665c54",
    accentColor: "#fabd2f",
    userBubble: "#504945",
    userText: "#fbf1c7",
    assistantBubble: "#32302f",
    assistantText: "#fbf1c7",
    codeBackground: "#1d2021",
    codeText: "#b8bb26",
    composerBackground: "#282828",
    sidebarBackground: "#1d2021"
  },
  catppuccin: {
    backgroundMode: "gradient",
    backgroundColor: "#1e1e2e",
    backgroundGradient: "linear-gradient(135deg, #1e1e2e 0%, #24273a 48%, #181825 100%)",
    surfaceColor: "#313244",
    surfaceText: "#cdd6f4",
    mutedText: "#bac2de",
    borderColor: "#585b70",
    accentColor: "#cba6f7",
    userBubble: "#45475a",
    userText: "#cdd6f4",
    assistantBubble: "#282a3a",
    assistantText: "#cdd6f4",
    codeBackground: "#181825",
    codeText: "#a6e3a1",
    composerBackground: "#1e1e2e",
    sidebarBackground: "#181825"
  },
  solarized: {
    backgroundMode: "gradient",
    backgroundColor: "#002b36",
    backgroundGradient: "linear-gradient(135deg, #002b36 0%, #073642 52%, #001f27 100%)",
    surfaceColor: "#073642",
    surfaceText: "#eee8d5",
    mutedText: "#93a1a1",
    borderColor: "#586e75",
    accentColor: "#2aa198",
    userBubble: "#0f4552",
    userText: "#fdf6e3",
    assistantBubble: "#06313b",
    assistantText: "#eee8d5",
    codeBackground: "#00212a",
    codeText: "#859900",
    composerBackground: "#002b36",
    sidebarBackground: "#00212a"
  },
  monokai: {
    backgroundMode: "gradient",
    backgroundColor: "#272822",
    backgroundGradient: "linear-gradient(135deg, #272822 0%, #34352d 48%, #1f201b 100%)",
    surfaceColor: "#3e3d32",
    surfaceText: "#f8f8f2",
    mutedText: "#cfcfc2",
    borderColor: "#75715e",
    accentColor: "#a6e22e",
    userBubble: "#49483e",
    userText: "#f8f8f2",
    assistantBubble: "#33342c",
    assistantText: "#f8f8f2",
    codeBackground: "#1f201b",
    codeText: "#e6db74",
    composerBackground: "#272822",
    sidebarBackground: "#1f201b"
  }
};

const LCGS_THEME_OPTIONS = [
  ["default", "Default"],
  ["developersTaste", "Developer's Taste"],
  ["graphite", "Graphite"],
  ["paper", "Paper"],
  ["midnight", "Midnight"],
  ["meadow", "Meadow"],
  ["dracula", "Dracula"],
  ["nord", "Nord"],
  ["gruvbox", "Gruvbox"],
  ["catppuccin", "Catppuccin"],
  ["solarized", "Solarized Dark"],
  ["monokai", "Monokai"],
  ["custom", "Custom"]
];

const LCGS_FONT_OPTIONS = [
  ["Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", "System / Inter"],
  ["Arial, Helvetica, sans-serif", "Arial"],
  ["Georgia, Times New Roman, serif", "Georgia"],
  ["Verdana, Geneva, sans-serif", "Verdana"],
  ["ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace", "Monospace"]
];

const LCGS_BACKGROUND_OPTIONS = [
  ["image", "Image"],
  ["gradient", "Gradient"],
  ["solid", "Solid"]
];

const LCGS_BACKGROUND_SIZE_OPTIONS = [
  ["cover", "Cover"],
  ["contain", "Contain"],
  ["auto", "Actual size"]
];

const LCGS_BACKGROUND_POSITION_OPTIONS = [
  ["center", "Center"],
  ["top", "Top"],
  ["bottom", "Bottom"],
  ["left", "Left"],
  ["right", "Right"],
  ["top left", "Top left"],
  ["top right", "Top right"],
  ["bottom left", "Bottom left"],
  ["bottom right", "Bottom right"]
];

const LCGS_READABILITY_OPTIONS = [
  ["custom", "Custom"],
  ["compact", "Compact"],
  ["comfortable", "Comfortable"],
  ["focus", "Focus"],
  ["wide", "Wide"]
];

const LCGS_READABILITY_PRESETS = {
  compact: {
    fontSize: 14,
    lineHeight: 1.45,
    chatWidth: 980,
    pageRadius: 8
  },
  comfortable: {
    fontSize: 16,
    lineHeight: 1.7,
    chatWidth: 1180,
    pageRadius: 14
  },
  focus: {
    fontSize: 17,
    lineHeight: 1.85,
    chatWidth: 920,
    pageRadius: 18
  },
  wide: {
    fontSize: 16,
    lineHeight: 1.65,
    chatWidth: 1500,
    pageRadius: 12
  }
};

let lcgsSaveQueue = Promise.resolve();

function lcgsStorageGet(keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(keys, (result) => {
        const error = chrome.runtime?.lastError;
        if (error) reject(new Error(error.message));
        else resolve(result || {});
      });
    } catch (error) {
      reject(error);
    }
  });
}

function lcgsStorageSet(values) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(values, () => {
        const error = chrome.runtime?.lastError;
        if (error) reject(new Error(error.message));
        else resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

function lcgsStorageRemove(keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(keys, () => {
        const error = chrome.runtime?.lastError;
        if (error) reject(new Error(error.message));
        else resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

function lcgsGetSettings() {
  if (!globalThis.chrome?.storage?.local) {
    const stored = localStorage.getItem(LCGS_STORAGE_KEY);
    try {
      return Promise.resolve(lcgsNormalizeSettings({
        ...LCGS_DEFAULTS,
        ...(stored ? JSON.parse(stored) : {})
      }));
    } catch (error) {
      return Promise.resolve(lcgsNormalizeSettings(LCGS_DEFAULTS));
    }
  }
  return lcgsStorageGet(LCGS_STORAGE_KEY).then((result) => lcgsNormalizeSettings({
    ...LCGS_DEFAULTS,
    ...(result[LCGS_STORAGE_KEY] || {})
  }));
}

function lcgsSaveSettings(settings) {
  const normalized = lcgsNormalizeSettings(settings);
  if (!globalThis.chrome?.storage?.local) {
    localStorage.setItem(LCGS_STORAGE_KEY, JSON.stringify(normalized));
    return Promise.resolve();
  }
  const write = () => lcgsStorageSet({ [LCGS_STORAGE_KEY]: normalized });
  const next = lcgsSaveQueue.catch(() => {}).then(write);
  lcgsSaveQueue = next;
  return next;
}

function lcgsApplyThemePreset(settings, theme) {
  const normalized = lcgsNormalizeSettings(settings);
  if (theme === "custom") {
    const customSettings = normalized.customSettings || lcgsExtractCustomSettings(normalized);
    return lcgsNormalizeSettings({
      ...normalized,
      ...customSettings,
      theme: "custom",
      customSettings
    });
  }

  return {
    ...LCGS_DEFAULTS,
    enabled: normalized.enabled,
    zenMode: normalized.zenMode,
    localNotes: normalized.localNotes,
    advancedSafeMode: normalized.advancedSafeMode,
    reasoningGuard: normalized.reasoningGuard,
    promptTools: normalized.promptTools,
    promptSlashPalette: normalized.promptSlashPalette,
    promptHistory: normalized.promptHistory,
    promptHistoryMax: normalized.promptHistoryMax,
    messageNavigator: normalized.messageNavigator,
    navigatorLimit: normalized.navigatorLimit,
    customSettings: normalized.customSettings || lcgsExtractCustomSettings(normalized),
    theme,
    ...(LCGS_THEME_PRESETS[theme] || {})
  };
}

function lcgsThemeUsesBundledBackground(theme) {
  const preset = LCGS_THEME_PRESETS[theme];
  return preset?.backgroundMode === "image" && !preset.backgroundImage;
}

function lcgsApplyCustomSettings(settings, updates) {
  const normalized = lcgsNormalizeSettings(settings);
  const customBase = normalized.theme === "custom" && normalized.customSettings
    ? normalized.customSettings
    : lcgsExtractCustomSettings(normalized);
  const customSettings = {
    ...customBase,
    ...updates
  };
  return lcgsNormalizeSettings({
    ...normalized,
    ...customSettings,
    theme: "custom",
    customSettings
  });
}

function lcgsApplyReadabilityPreset(settings, mode) {
  if (!LCGS_READABILITY_PRESETS[mode]) {
    return lcgsApplyCustomSettings(settings, { readabilityMode: "custom" });
  }
  return lcgsApplyCustomSettings(settings, {
    readabilityMode: mode,
    ...LCGS_READABILITY_PRESETS[mode]
  });
}

function lcgsExtractCustomSettings(settings) {
  const result = {};
  for (const field of LCGS_CUSTOM_FIELDS) {
    result[field] = settings[field] ?? LCGS_DEFAULTS[field];
  }
  return result;
}

function lcgsClampNumber(value, min, max, fallback) {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function lcgsNormalizeSettings(settings) {
  const hasBackgroundImageName = Object.prototype.hasOwnProperty.call(settings || {}, "backgroundImageName");
  const hasBrandImageName = Object.prototype.hasOwnProperty.call(settings || {}, "brandImageName");
  let normalized = {
    ...LCGS_DEFAULTS,
    ...settings
  };
  delete normalized.mood;
  if (normalized.theme === LCGS_LEGACY_DEFAULT_THEME) {
    normalized.theme = "default";
  }
  if (Object.prototype.hasOwnProperty.call(normalized, "readingMode") && !Object.prototype.hasOwnProperty.call(settings || {}, "zenMode")) {
    normalized.zenMode = Boolean(normalized.readingMode);
  }
  delete normalized.readingMode;
  delete normalized.printMode;
  if (normalized.backgroundMode === "asset") {
    normalized.backgroundMode = "image";
    normalized.backgroundImageName = normalized.backgroundImageName || LCGS_DEFAULTS.backgroundImageName;
    if (!normalized.backgroundImage) {
      normalized.backgroundOpacity = 0;
    }
  }

  if (normalized.theme === "custom") {
    const customSettings = normalized.customSettings || lcgsExtractCustomSettings(normalized);
    normalized = {
      ...normalized,
      ...customSettings,
      theme: "custom",
      customSettings
    };
  } else if (LCGS_THEME_PRESETS[normalized.theme]) {
    const preset = LCGS_THEME_PRESETS[normalized.theme];
    const presetBackgroundImage = preset.backgroundMode === "image" && normalized.backgroundImage
      ? {
          backgroundImage: normalized.backgroundImage,
          backgroundImageName: normalized.backgroundImageName || preset.backgroundImageName || LCGS_DEFAULTS.backgroundImageName
        }
      : {};
    normalized = {
      ...LCGS_DEFAULTS,
      enabled: normalized.enabled,
      zenMode: normalized.zenMode,
      localNotes: normalized.localNotes,
      advancedSafeMode: normalized.advancedSafeMode,
      reasoningGuard: normalized.reasoningGuard,
      promptTools: normalized.promptTools,
      promptSlashPalette: normalized.promptSlashPalette,
      promptHistory: normalized.promptHistory,
      promptHistoryMax: normalized.promptHistoryMax,
      messageNavigator: normalized.messageNavigator,
      navigatorLimit: normalized.navigatorLimit,
      customSettings: normalized.customSettings || lcgsExtractCustomSettings(normalized),
      theme: normalized.theme,
      ...preset,
      ...presetBackgroundImage
    };
  } else {
    const customSettings = normalized.customSettings || lcgsExtractCustomSettings(normalized);
    normalized = {
      ...normalized,
      ...customSettings,
      theme: "custom",
      customSettings
    };
  }
  if (normalized.backgroundImage && !hasBackgroundImageName) {
    normalized.backgroundImageName = "Uploaded image";
  }
  if (normalized.backgroundMode === "image" && !normalized.backgroundImage) {
    normalized.backgroundImageName = normalized.backgroundImageName || LCGS_DEFAULTS.backgroundImageName;
    if (Number(normalized.backgroundOpacity) >= 1) {
      normalized.backgroundOpacity = 0;
    }
  }
  if (normalized.brandImage && !hasBrandImageName) {
    normalized.brandImageName = "Uploaded image";
  }
  if (!normalized.brandImage && normalized.brandImageName === "icon128.png") {
    normalized.brandImageName = LCGS_DEFAULTS.brandImageName;
  }
  normalized.promptHistoryMax = lcgsClampNumber(normalized.promptHistoryMax, 5, 200, LCGS_DEFAULTS.promptHistoryMax);
  normalized.navigatorLimit = lcgsClampNumber(normalized.navigatorLimit, 20, 200, LCGS_DEFAULTS.navigatorLimit);
  normalized.fontSize = lcgsClampNumber(normalized.fontSize, 12, 28, LCGS_DEFAULTS.fontSize);
  normalized.lineHeight = lcgsClampNumber(normalized.lineHeight, 1.2, 2.2, LCGS_DEFAULTS.lineHeight);
  normalized.chatWidth = lcgsClampNumber(normalized.chatWidth, 600, 1800, LCGS_DEFAULTS.chatWidth);
  normalized.pageRadius = lcgsClampNumber(normalized.pageRadius, 0, 28, LCGS_DEFAULTS.pageRadius);
  normalized.backgroundOpacity = lcgsClampNumber(normalized.backgroundOpacity, 0, 0.9, LCGS_DEFAULTS.backgroundOpacity);
  normalized.backgroundBlur = lcgsClampNumber(normalized.backgroundBlur, 0, 24, LCGS_DEFAULTS.backgroundBlur);
  normalized.backgroundVignette = lcgsClampNumber(normalized.backgroundVignette, 0, 0.8, LCGS_DEFAULTS.backgroundVignette);
  normalized.codeFontSize = lcgsClampNumber(normalized.codeFontSize, 11, 22, LCGS_DEFAULTS.codeFontSize);
  normalized.codeRadius = lcgsClampNumber(normalized.codeRadius, 0, 24, LCGS_DEFAULTS.codeRadius);
  return normalized;
}

function lcgsPopulateSelect(select, options) {
  select.innerHTML = "";
  for (const [value, label] of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

function lcgsDownloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function lcgsCreateThemeExport(settings) {
  const normalized = lcgsNormalizeSettings(settings);
  return {
    format: "DesignerGPT Theme",
    version: 1,
    exportedAt: new Date().toISOString(),
    theme: {
      ...lcgsExtractCustomSettings(normalized),
      themeName: normalized.theme === "custom" ? "Custom" : normalized.theme
    }
  };
}

function lcgsReadThemeExport(data) {
  const source = data?.theme || data;
  const themeSettings = {};
  for (const field of LCGS_CUSTOM_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source || {}, field)) {
      themeSettings[field] = source[field];
    }
  }
  return themeSettings;
}
