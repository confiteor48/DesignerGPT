(function () {
  const STORAGE_KEY = "localChatgptStylerSettings";
  const LEGACY_DEFAULT_THEME = ["cla", "raos"].join("");
  const STYLE_ID = "local-chatgpt-styler-runtime";
  const BRAND_ID = "local-chatgpt-styler-brand-mask";
  const FAVICON_ID = "local-chatgpt-styler-favicon";
  const EXPORT_ID = "local-chatgpt-styler-export";
  const EXPORT_MODAL_ID = "local-chatgpt-styler-export-modal";
  const NOTES_ID = "local-chatgpt-styler-notes";
  const PROMPT_TOOLS_ID = "local-chatgpt-styler-prompt-tools";
  const SLASH_PALETTE_ID = "local-chatgpt-styler-slash-palette";
  const NAVIGATOR_ID = "local-chatgpt-styler-navigator";
  const NOTES_STORAGE_PREFIX = "localChatgptStylerNotes:";
  const PROMPT_SNIPPETS_STORAGE_KEY = "localChatgptStylerPromptSnippets";
  const PROMPT_HISTORY_STORAGE_KEY = "localChatgptStylerPromptHistory";
  const MESSAGE_NOTE_BUTTON_CLASS = "lcgs-message-note-button";
  const ACTION_CONTROL_ATTRIBUTE = "data-lcgs-action-control";
  const DEFAULT_BACKGROUND_PATH = "assets/theme-background.jpg";
  const DEFAULT_BRAND_IMAGE_PATH = "assets/brand-default.png";
  let defaultBackgroundUrl = "";
  let defaultBackgroundLoad = null;
  let activeSettings = null;

  const defaults = {
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
    navigatorLimit: 80
  };
  activeSettings = { ...defaults };

  const defaultPromptSnippets = [
    {
      id: "critique",
      name: "Critique",
      command: "critique",
      text: "Review this for clarity, UX friction, implementation risk, and missing edge cases. Prioritize actionable fixes."
    },
    {
      id: "plan",
      name: "Implementation Plan",
      command: "plan",
      text: "Create a compact implementation plan. Include assumptions, files likely touched, risks, and verification steps."
    },
    {
      id: "tighten",
      name: "Tighten",
      command: "tighten",
      text: "Rewrite this to be shorter, sharper, and more direct while preserving the meaning and technical constraints."
    }
  ];

  const themes = {
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
      assistantText: "#eef4ff",
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

  function mergeSettings(settings) {
    const raw = { ...defaults, ...(settings || {}) };
    delete raw.mood;
    raw.zenMode = Object.prototype.hasOwnProperty.call(raw, "zenMode") ? raw.zenMode : raw.readingMode;
    delete raw.readingMode;
    delete raw.printMode;
    if (raw.theme === LEGACY_DEFAULT_THEME) {
      raw.theme = "default";
    }
    if (raw.backgroundMode === "asset") {
      raw.backgroundMode = "image";
      raw.backgroundImageName = raw.backgroundImageName || defaults.backgroundImageName;
      if (!raw.backgroundImage) {
        raw.backgroundOpacity = 0;
      }
    }
    const themePreset = themes[raw.theme] || themes[defaults.theme] || {};
    const presetBackgroundImage = themePreset.backgroundMode === "image" && raw.backgroundImage
      ? {
          backgroundImage: raw.backgroundImage,
          backgroundImageName: raw.backgroundImageName || themePreset.backgroundImageName || defaults.backgroundImageName
        }
      : {};
    const withTheme = raw.theme === "custom"
      ? { ...defaults, ...(raw.customSettings || {}), ...raw, theme: "custom" }
      : {
          ...defaults,
          enabled: raw.enabled,
          zenMode: raw.zenMode,
          localNotes: raw.localNotes,
          advancedSafeMode: raw.advancedSafeMode,
          reasoningGuard: raw.reasoningGuard,
          promptTools: raw.promptTools,
          promptSlashPalette: raw.promptSlashPalette,
          promptHistory: raw.promptHistory,
          promptHistoryMax: raw.promptHistoryMax,
          messageNavigator: raw.messageNavigator,
          navigatorLimit: raw.navigatorLimit,
          customSettings: raw.customSettings || null,
          theme: themes[raw.theme] ? raw.theme : defaults.theme,
          ...themePreset,
          ...presetBackgroundImage
        };
    if (withTheme.backgroundMode === "image" && !withTheme.backgroundImage && Number(withTheme.backgroundOpacity) >= 1) {
      withTheme.backgroundOpacity = 0;
    }
    if (!withTheme.brandImage && withTheme.brandImageName === "icon128.png") {
      withTheme.brandImageName = defaults.brandImageName;
    }
    withTheme.promptHistoryMax = Math.max(5, Math.min(200, Number(withTheme.promptHistoryMax) || defaults.promptHistoryMax));
    withTheme.navigatorLimit = Math.max(20, Math.min(200, Number(withTheme.navigatorLimit) || defaults.navigatorLimit));
    return withTheme.enabled === false ? { ...withTheme, enabled: false } : withTheme;
  }

  function cssValue(settings, key) {
    return String(settings[key]).replace(/[<>{}]/g, "");
  }

  let extensionContextValid = true;

  function markExtensionContextInvalid(error) {
    const message = String(error?.message || error || "");
    if (/Extension context invalidated/i.test(message)) {
      extensionContextValid = false;
      return true;
    }
    return false;
  }

  function safeRuntimeUrl(path) {
    if (!extensionContextValid) return "";
    try {
      return chrome.runtime?.getURL?.(path) || "";
    } catch (error) {
      if (markExtensionContextInvalid(error)) return "";
      throw error;
    }
  }

  function safeStorageGet(keys, fallback = {}) {
    if (!extensionContextValid) return Promise.resolve(fallback);
    return new Promise((resolve) => {
      try {
        chrome.storage?.local?.get?.(keys, (result) => {
          try {
            const error = chrome.runtime?.lastError;
            if (error && markExtensionContextInvalid(error)) {
              resolve(fallback);
              return;
            }
          } catch (runtimeError) {
            if (markExtensionContextInvalid(runtimeError)) {
              resolve(fallback);
              return;
            }
          }
          resolve(result || fallback);
        });
      } catch (error) {
        if (!markExtensionContextInvalid(error)) {
          console.warn("DesignerGPT storage get failed", error);
        }
        resolve(fallback);
      }
    });
  }

  function safeStorageSet(values, callback) {
    if (!extensionContextValid) return;
    try {
      chrome.storage?.local?.set?.(values, () => {
        try {
          const error = chrome.runtime?.lastError;
          if (error && markExtensionContextInvalid(error)) return;
        } catch (runtimeError) {
          if (markExtensionContextInvalid(runtimeError)) return;
        }
        callback?.();
      });
    } catch (error) {
      if (!markExtensionContextInvalid(error)) {
        console.warn("DesignerGPT storage set failed", error);
      }
    }
  }

  function safeStorageRemove(keys, callback) {
    if (!extensionContextValid) return;
    try {
      chrome.storage?.local?.remove?.(keys, () => {
        try {
          const error = chrome.runtime?.lastError;
          if (error && markExtensionContextInvalid(error)) return;
        } catch (runtimeError) {
          if (markExtensionContextInvalid(runtimeError)) return;
        }
        callback?.();
      });
    } catch (error) {
      if (!markExtensionContextInvalid(error)) {
        console.warn("DesignerGPT storage remove failed", error);
      }
    }
  }

  function safeAddStorageChangeListener(listener) {
    if (!extensionContextValid) return;
    try {
      chrome.storage?.onChanged?.addListener?.(listener);
    } catch (error) {
      if (!markExtensionContextInvalid(error)) {
        console.warn("DesignerGPT storage listener failed", error);
      }
    }
  }

  function backgroundCss(settings) {
    if (settings.backgroundMode === "image") {
      const imageUrl = settings.backgroundImage || defaultBackgroundUrl || safeRuntimeUrl(DEFAULT_BACKGROUND_PATH);
      const opacity = Math.max(0, Math.min(0.9, Number(settings.backgroundOpacity) || 0));
      const safeUrl = String(imageUrl).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return `linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity})), url("${safeUrl}")`;
    }

    if (settings.backgroundMode === "solid") {
      return cssValue(settings, "backgroundColor");
    }

    return cssValue(settings, "backgroundGradient");
  }

  function backgroundBaseCss(settings) {
    return settings.backgroundMode === "solid" ? cssValue(settings, "backgroundColor") : cssValue(settings, "backgroundColor");
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function ensureDefaultBackground(settings) {
    if (settings.backgroundMode !== "image" || settings.backgroundImage || defaultBackgroundUrl || defaultBackgroundLoad) {
      return;
    }

    const backgroundUrl = safeRuntimeUrl(DEFAULT_BACKGROUND_PATH);
    if (!backgroundUrl) return;

    defaultBackgroundLoad = fetch(backgroundUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${DEFAULT_BACKGROUND_PATH}`);
        return response.blob();
      })
      .then(blobToDataUrl)
      .then((dataUrl) => {
        defaultBackgroundUrl = dataUrl;
        apply(settings);
      })
      .catch(() => {
        defaultBackgroundLoad = null;
      });
  }

  function buildCss(settings) {
    if (!settings.enabled) {
      return "";
    }

    return `
:root {
  color-scheme: dark;
  --sgpt-gray-light-accents-50: #fff;
  --sgpt-gray-light-accents-75: #fdf4ff;
  --sgpt-gray-light-accents-100: #fae8ff;
  --sgpt-gray-light-accents-150: #f8dcff;
  --sgpt-gray-light-accents-200: #f5d0fe;
  --sgpt-gray-light-accents-300: #f0abfc;
  --sgpt-gray-light-accents-400: #e879f9;
  --sgpt-gray-light-accents-500: #d946ef;
  --sgpt-gray-light-accents-600: #c026d3;
  --sgpt-gray-light-accents-700: #a21caf;
  --sgpt-gray-light-accents-750: #941b9f;
  --sgpt-gray-light-accents-800: #86198f;
  --sgpt-gray-light-accents-850: #781681;
  --sgpt-gray-light-accents-900: #701a75;
  --sgpt-gray-light-accents-950: #4a044e;
  --sgpt-gray-dark-accents-50: #fcf7fd;
  --sgpt-gray-dark-accents-100: #f0e0f5;
  --sgpt-gray-dark-accents-200: #e2c4e9;
  --sgpt-gray-dark-accents-300: #ca92d3;
  --sgpt-gray-dark-accents-400: #b468bf;
  --sgpt-gray-dark-accents-500: #9b4ea7;
  --sgpt-gray-dark-accents-600: #77457d;
  --sgpt-gray-dark-accents-700: #522f56;
  --sgpt-gray-dark-accents-750: #452947;
  --sgpt-gray-dark-accents-800: #38223a;
  --sgpt-gray-dark-accents-850: #2b1b2d;
  --sgpt-gray-dark-accents-900: #212121;
  --sgpt-gray-dark-accents-950: #271628;
  --sgpt-gray-dark-colored-50: #fff;
  --sgpt-gray-dark-colored-100: #fae8ff;
  --sgpt-gray-dark-colored-200: #f5d0fe;
  --sgpt-gray-dark-colored-300: #f0abfc;
  --sgpt-gray-dark-colored-400: #e879f9;
  --sgpt-gray-dark-colored-500: #d946ef;
  --sgpt-gray-dark-colored-600: #c026d3;
  --sgpt-gray-dark-colored-700: #682471;
  --sgpt-gray-dark-colored-750: #5a2260;
  --sgpt-gray-dark-colored-800: #4d1f52;
  --sgpt-gray-dark-colored-850: #3f1a45;
  --sgpt-gray-dark-colored-900: #351738;
  --sgpt-gray-dark-colored-950: #2a122c;
  --gray-50: var(--sgpt-gray-dark-colored-50) !important;
  --gray-100: var(--sgpt-gray-dark-colored-100) !important;
  --gray-200: var(--sgpt-gray-dark-colored-200) !important;
  --gray-300: var(--sgpt-gray-dark-colored-300) !important;
  --gray-400: var(--sgpt-gray-dark-colored-400) !important;
  --gray-500: var(--sgpt-gray-dark-colored-500) !important;
  --gray-600: var(--sgpt-gray-dark-colored-600) !important;
  --gray-700: var(--sgpt-gray-dark-colored-700) !important;
  --gray-750: var(--sgpt-gray-dark-colored-750) !important;
  --gray-800: var(--sgpt-gray-dark-colored-800) !important;
  --gray-850: var(--sgpt-gray-dark-colored-850) !important;
  --gray-900: var(--sgpt-gray-dark-colored-900) !important;
  --gray-950: var(--sgpt-gray-dark-colored-950) !important;
  --lcgs-font-family: ${cssValue(settings, "fontFamily")};
  --lcgs-font-size: ${Number(settings.fontSize)}px;
  --lcgs-line-height: ${Number(settings.lineHeight)};
  --lcgs-chat-width: ${Number(settings.chatWidth)}px;
  --lcgs-radius: ${Number(settings.pageRadius)}px;
  --lcgs-bg: ${backgroundCss(settings)};
  --lcgs-bg-base: ${backgroundBaseCss(settings)};
  --lcgs-bg-size: ${cssValue(settings, "backgroundSize")};
  --lcgs-bg-position: ${cssValue(settings, "backgroundPosition")};
  --lcgs-bg-blur: ${Math.max(0, Math.min(24, Number(settings.backgroundBlur) || 0))}px;
  --lcgs-bg-scale: ${1 + (Math.max(0, Math.min(24, Number(settings.backgroundBlur) || 0)) / 120)};
  --lcgs-bg-vignette: ${Math.max(0, Math.min(0.8, Number(settings.backgroundVignette) || 0))};
  --lcgs-surface: ${cssValue(settings, "surfaceColor")};
  --lcgs-text: ${cssValue(settings, "surfaceText")};
  --lcgs-muted: ${cssValue(settings, "mutedText")};
  --lcgs-border: ${cssValue(settings, "borderColor")};
  --lcgs-accent: ${cssValue(settings, "accentColor")};
  --lcgs-user-bg: ${cssValue(settings, "userBubble")};
  --lcgs-user-text: ${cssValue(settings, "userText")};
  --lcgs-assistant-bg: ${cssValue(settings, "assistantBubble")};
  --lcgs-assistant-text: ${cssValue(settings, "assistantText")};
  --lcgs-code-bg: ${cssValue(settings, "codeBackground")};
  --lcgs-code-text: ${cssValue(settings, "codeText")};
  --lcgs-code-font-family: ${cssValue(settings, "codeFontFamily")};
  --lcgs-code-font-size: ${Number(settings.codeFontSize) || 14}px;
  --lcgs-code-border: ${cssValue(settings, "codeBorderColor")};
  --lcgs-code-radius: ${Number(settings.codeRadius)}px;
  --lcgs-composer-bg: ${cssValue(settings, "composerBackground")};
  --lcgs-sidebar-bg: ${cssValue(settings, "sidebarBackground")};
  --stylergpt-bg-url: var(--lcgs-bg);
  --stylergpt-main-page-surface: var(--gray-850);
  --stylergpt-main-page-primary: var(--gray-800);
  --stylergpt-main-page-secondary: var(--gray-750);
  --stylergpt-main-page-tertiary: var(--gray-700);
  --theme-user-msg-bg: var(--lcgs-user-bg);
  --theme-user-msg-text: var(--lcgs-user-text);
}

html, body, #__next, main {
  font-family: var(--lcgs-font-family) !important;
  color: var(--lcgs-text) !important;
}

html,
body {
  overflow-x: hidden !important;
}

body {
  background: var(--lcgs-bg) !important;
  background-position: var(--lcgs-bg-position) !important;
  background-repeat: no-repeat !important;
  background-size: var(--lcgs-bg-size) !important;
  background-attachment: fixed !important;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: var(--lcgs-bg);
  background-position: var(--lcgs-bg-position) !important;
  background-repeat: no-repeat !important;
  background-size: var(--lcgs-bg-size) !important;
  background-attachment: fixed !important;
  filter: blur(var(--lcgs-bg-blur));
  transform: scale(var(--lcgs-bg-scale));
  transform-origin: center;
  z-index: -2;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 42%, rgba(0, 0, 0, var(--lcgs-bg-vignette)) 100%);
  z-index: -1;
}

main#main::before {
  content: none !important;
}

main#main {
  isolation: isolate !important;
}

* {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--lcgs-accent) 54%, var(--lcgs-border) 46%) color-mix(in srgb, var(--lcgs-sidebar-bg) 68%, #050308 32%);
}

*::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

*::-webkit-scrollbar-track {
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 68%, #050308 32%);
  border-left: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent);
}

*::-webkit-scrollbar-thumb {
  min-height: 44px;
  border: 3px solid color-mix(in srgb, var(--lcgs-sidebar-bg) 68%, #050308 32%);
  border-radius: 999px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--lcgs-accent) 70%, #fff 8%), color-mix(in srgb, var(--lcgs-border) 82%, #000 18%));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, #fff 12%, transparent), 0 0 12px color-mix(in srgb, var(--lcgs-accent) 28%, transparent);
}

*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, color-mix(in srgb, var(--lcgs-accent) 84%, #fff 10%), color-mix(in srgb, var(--lcgs-border) 72%, var(--lcgs-accent) 28%));
}

*::-webkit-scrollbar-corner {
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 68%, #050308 32%);
}

main#main:has(section[data-turn], [data-message-author-role]) div#thread,
main#main:has(section[data-turn], [data-message-author-role]) #thread,
main#main div[class*="max-w-"][class*="mx-auto"]:has([data-message-author-role]) {
  --thread-content-max-width: var(--lcgs-chat-width) !important;
  --conversation-max-width: var(--lcgs-chat-width) !important;
  max-width: var(--lcgs-chat-width) !important;
}

main#main:has(section[data-turn], [data-message-author-role]) div#thread,
main#main:has(section[data-turn], [data-message-author-role]) #thread {
  margin-left: auto !important;
  margin-right: auto !important;
  width: min(100%, var(--lcgs-chat-width)) !important;
}

body, .dark body, html.dark {
  --text-primary: var(--lcgs-text) !important;
  --text-secondary: var(--lcgs-muted) !important;
  --text-tertiary: color-mix(in srgb, var(--lcgs-muted) 78%, transparent) !important;
  --text-placeholder: color-mix(in srgb, var(--lcgs-muted) 85%, transparent) !important;
  --bg-primary: transparent !important;
  --bg-secondary: transparent !important;
  --main-surface-background: transparent !important;
  --main-surface-primary: transparent !important;
  --main-surface-secondary: var(--gray-800) !important;
  --main-surface-tertiary: var(--gray-750) !important;
  --surface-primary: color-mix(in srgb, var(--lcgs-surface) 86%, transparent) !important;
  --surface-secondary: var(--lcgs-surface) !important;
  --surface-tertiary: color-mix(in srgb, var(--lcgs-surface) 84%, white 8%) !important;
  --sidebar-surface-primary: var(--lcgs-sidebar-bg) !important;
  --sidebar-surface-secondary: color-mix(in srgb, var(--lcgs-sidebar-bg) 72%, var(--lcgs-accent) 18%) !important;
  --sidebar-surface-tertiary: color-mix(in srgb, var(--lcgs-sidebar-bg) 58%, var(--lcgs-accent) 24%) !important;
  --sidebar-bg: var(--lcgs-sidebar-bg) !important;
  --border-primary: var(--lcgs-border) !important;
  --border-light: color-mix(in srgb, var(--lcgs-border) 46%, transparent) !important;
  --border-medium: color-mix(in srgb, var(--lcgs-border) 68%, transparent) !important;
  --border-heavy: color-mix(in srgb, var(--lcgs-border) 82%, transparent) !important;
}

main#main,
main#main > .contents,
main#main .composer-parent,
main#main [data-scroll-root],
main#main > div {
  background: transparent !important;
}

main,
[role="main"],
.composer-parent,
[data-scroll-root],
main#main > div {
  min-width: 0 !important;
}

nav[aria-label="Chat history"],
[data-testid="sidebar"],
#stage-slideover-sidebar {
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 96%, #000 4%) !important;
  border-color: var(--lcgs-border) !important;
}

nav[aria-label="Chat history"] a[href],
nav[aria-label="Chat history"] button {
  color: var(--lcgs-text) !important;
}

nav[aria-label="Chat history"] a[href="/"],
nav[aria-label="Chat history"] a:has([data-testid="create-new-chat-button"]),
button[data-testid="create-new-chat-button"] {
  background: color-mix(in srgb, var(--lcgs-accent) 24%, var(--lcgs-sidebar-bg) 76%) !important;
  color: #fff !important;
}

article,
[data-message-author-role],
[data-message-author-role] *,
main section[data-turn],
main section[data-turn] * {
  font-family: var(--lcgs-font-family) !important;
  font-size: var(--lcgs-font-size) !important;
  line-height: var(--lcgs-line-height) !important;
}

main section[data-turn="assistant"] {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
  position: relative !important;
}

main section[data-turn="user"],
main section [data-message-id][class~="group/message"].items-end {
  background: transparent !important;
  border: 0 !important;
}

main section[data-turn="user"] > *,
main section [data-message-id][class~="group/message"].items-end > * {
  max-width: inherit !important;
}

[data-message-author-role="assistant"],
main section div.agent-turn {
  color: var(--lcgs-assistant-text) !important;
}

[data-message-author-role="user"] .user-message-bubble-color,
main#main .user-message-bubble-color,
main section[data-turn="user"] div.bg-token-main-surface-secondary,
main section div[data-message-author-role="user"] .user-message-bubble-color,
main section [data-message-id][class~="group/message"].items-end div.bg-token-main-surface-secondary,
main section [data-message-id][class~="group/message"].items-end .group\/message {
  background: var(--lcgs-user-bg) !important;
  color: var(--lcgs-user-text) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 62%, var(--lcgs-accent) 38%) !important;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--lcgs-border) 62%, var(--lcgs-accent) 38%) inset !important;
  border-radius: var(--lcgs-radius) var(--lcgs-radius) 0 var(--lcgs-radius) !important;
  padding: 10px 14px !important;
}

.stylergpt-message-timestamp,
[class*="message-timestamp"] {
  display: block !important;
  font: 700 11px/1.2 ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace !important;
  color: var(--lcgs-text) !important;
}

main section[data-turn="assistant"] .stylergpt-message-timestamp,
main section[data-turn="assistant"] [class*="message-timestamp"] {
  position: absolute !important;
  top: 14px !important;
  right: 18px !important;
}

main section[data-turn="user"] .stylergpt-message-timestamp,
main section[data-turn="user"] [class*="message-timestamp"] {
  margin: 0 0 6px auto !important;
  text-align: right !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn],
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] {
  border-radius: calc(var(--lcgs-radius) + 8px) !important;
  transition: background-color .16s ease, box-shadow .16s ease !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn]:hover,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"]:hover {
  background-color: color-mix(in srgb, var(--lcgs-surface) 30%, transparent) !important;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--lcgs-accent) 46%, transparent) inset !important;
}

html:not(.lcgs-image-viewer-active) main [${ACTION_CONTROL_ATTRIBUTE}="icon"] {
  inline-size: 34px !important;
  block-size: 32px !important;
  min-inline-size: 34px !important;
  min-block-size: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  padding: 0 !important;
  color: var(--lcgs-text) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 62%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 6px)) !important;
  box-shadow: none !important;
}

html:not(.lcgs-image-viewer-active) main [${ACTION_CONTROL_ATTRIBUTE}="icon"] svg {
  width: 18px !important;
  inline-size: 18px !important;
  min-width: 18px !important;
  min-inline-size: 18px !important;
  height: 18px !important;
  block-size: 18px !important;
  min-height: 18px !important;
  min-block-size: 18px !important;
  flex: 0 0 18px !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] :is(button, a[role="button"], [role="button"]):is([aria-label*="regenerate" i], [aria-label*="retry" i], [aria-label*="try again" i], [title*="regenerate" i], [title*="retry" i], [title*="try again" i], [data-testid*="regenerate" i], [data-testid*="retry" i]) svg,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] :is(button, a[role="button"], [role="button"]):is([aria-label*="regenerate" i], [aria-label*="retry" i], [aria-label*="try again" i], [title*="regenerate" i], [title*="retry" i], [title*="try again" i], [data-testid*="regenerate" i], [data-testid*="retry" i]) svg {
  position: relative !important;
  top: 1px !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] span:has(> button[aria-label*="switch model" i]),
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] span:has(> button[aria-label*="switch model" i]),
html:not(.lcgs-image-viewer-active) main#main span:has(> button[aria-label*="switch model" i]) {
  padding-top: 1px !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] :is(button[data-testid="copy-turn-action-button"], button[data-testid="project-save-turn-action-button"], button[aria-label="Copy response"], button[aria-label="Copy message"], button[aria-label="Edit message"], button[aria-label="Add to project sources"], button[aria-label="Switch model"], button[aria-label="More actions"]),
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] :is(button[data-testid="copy-turn-action-button"], button[data-testid="project-save-turn-action-button"], button[aria-label="Copy response"], button[aria-label="Copy message"], button[aria-label="Edit message"], button[aria-label="Add to project sources"], button[aria-label="Switch model"], button[aria-label="More actions"]) {
  inline-size: 34px !important;
  block-size: 32px !important;
  min-inline-size: 34px !important;
  min-block-size: 32px !important;
  width: 34px !important;
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  padding: 0 !important;
  color: var(--lcgs-text) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 48%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 46%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 6px)) !important;
  box-shadow: none !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] :is(button[data-testid="copy-turn-action-button"], button[data-testid="project-save-turn-action-button"], button[aria-label="Copy response"], button[aria-label="Copy message"], button[aria-label="Edit message"], button[aria-label="Add to project sources"], button[aria-label="Switch model"], button[aria-label="More actions"]) :is(span, div),
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] :is(button[data-testid="copy-turn-action-button"], button[data-testid="project-save-turn-action-button"], button[aria-label="Copy response"], button[aria-label="Copy message"], button[aria-label="Edit message"], button[aria-label="Add to project sources"], button[aria-label="Switch model"], button[aria-label="More actions"]) :is(span, div) {
  inline-size: 100% !important;
  block-size: 100% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] :is(button[data-testid="copy-turn-action-button"], button[data-testid="project-save-turn-action-button"], button[aria-label="Copy response"], button[aria-label="Copy message"], button[aria-label="Edit message"], button[aria-label="Add to project sources"], button[aria-label="Switch model"], button[aria-label="More actions"]) svg,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] :is(button[data-testid="copy-turn-action-button"], button[data-testid="project-save-turn-action-button"], button[aria-label="Copy response"], button[aria-label="Copy message"], button[aria-label="Edit message"], button[aria-label="Add to project sources"], button[aria-label="Switch model"], button[aria-label="More actions"]) svg {
  width: 18px !important;
  height: 18px !important;
  flex: 0 0 18px !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] button:has(.truncate),
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button:has(.truncate) {
  inline-size: auto !important;
  block-size: auto !important;
  min-inline-size: 0 !important;
  min-block-size: 0 !important;
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  min-height: 0 !important;
  max-width: 100% !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  color: var(--lcgs-text) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 62%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 6px)) !important;
  box-shadow: none !important;
  padding: 5px 8px !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] button:has(.truncate) .truncate,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button:has(.truncate) .truncate,
html:not(.lcgs-image-viewer-active) main section[data-turn] button[aria-label="Sources"] :is(div, span, p),
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button[aria-label="Sources"] :is(div, span, p) {
  color: var(--lcgs-text) !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] button.text-start:has(> svg.icon-xs),
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button.text-start:has(> svg.icon-xs),
html:not(.lcgs-image-viewer-active) main#main button.text-start:has(> svg.icon-xs) {
  inline-size: auto !important;
  block-size: auto !important;
  min-inline-size: 0 !important;
  min-block-size: 0 !important;
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  min-height: 0 !important;
  max-width: 100% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 4px !important;
  padding: 5px 8px !important;
  white-space: normal !important;
  color: var(--lcgs-text) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 62%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 6px)) !important;
  box-shadow: none !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] button.text-start:has(> svg.icon-xs) svg,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button.text-start:has(> svg.icon-xs) svg,
html:not(.lcgs-image-viewer-active) main#main button.text-start:has(> svg.icon-xs) svg {
  width: 16px !important;
  inline-size: 16px !important;
  min-width: 16px !important;
  height: 16px !important;
  block-size: 16px !important;
  min-height: 16px !important;
  flex: 0 0 16px !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] button[aria-label="Sources"],
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button[aria-label="Sources"] {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  inline-size: auto !important;
  block-size: 32px !important;
  min-inline-size: 0 !important;
  min-block-size: 32px !important;
  width: auto !important;
  min-width: 0 !important;
  height: 32px !important;
  min-height: 32px !important;
  padding: 0 10px !important;
  color: var(--lcgs-text) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 62%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 6px)) !important;
  box-shadow: none !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] button[aria-label="Sources"] :is(img, svg),
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button[aria-label="Sources"] :is(img, svg) {
  width: 18px !important;
  height: 18px !important;
  flex: 0 0 18px !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] :is(button[aria-label="Share"], button[aria-label*="Share" i], button[data-testid*="share" i], a[role="button"][aria-label*="Share" i], [role="button"][aria-label*="Share" i]),
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] :is(button[aria-label="Share"], button[aria-label*="Share" i], button[data-testid*="share" i], a[role="button"][aria-label*="Share" i], [role="button"][aria-label*="Share" i]) {
  inline-size: 34px !important;
  block-size: 32px !important;
  min-inline-size: 34px !important;
  min-block-size: 32px !important;
  width: 34px !important;
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  padding: 0 !important;
  color: var(--lcgs-text) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 62%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 6px)) !important;
  box-shadow: none !important;
}

html:not(.lcgs-image-viewer-active) main section[data-turn] :is(button[aria-label="Share"], button[aria-label*="Share" i], button[data-testid*="share" i], a[role="button"][aria-label*="Share" i], [role="button"][aria-label*="Share" i]) svg,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] :is(button[aria-label="Share"], button[aria-label*="Share" i], button[data-testid*="share" i], a[role="button"][aria-label*="Share" i], [role="button"][aria-label*="Share" i]) svg {
  width: 18px !important;
  height: 18px !important;
  flex: 0 0 18px !important;
}

html:not(.lcgs-image-viewer-active) main#main [data-testid="webpage-citation-pill"],
html:not(.lcgs-image-viewer-active) main section[data-turn] [data-testid="webpage-citation-pill"],
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] [data-testid="webpage-citation-pill"] {
  top: 0 !important;
  transform: none !important;
  vertical-align: baseline !important;
}

html:not(.lcgs-image-viewer-active) main#main [data-testid="webpage-citation-pill"] a,
html:not(.lcgs-image-viewer-active) main#main [data-testid="webpage-citation-pill"] a[class*="bg-token-text-primary"],
html:not(.lcgs-image-viewer-active) main section[data-turn] [data-testid="webpage-citation-pill"] a,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] [data-testid="webpage-citation-pill"] a {
  height: 20px !important;
  max-width: 100% !important;
  padding: 0 7px 0 5px !important;
  color: var(--lcgs-text) !important;
  background: color-mix(in srgb, var(--lcgs-surface) 24%, transparent) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 24%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 8px)) !important;
  box-shadow: none !important;
}

html:not(.lcgs-image-viewer-active) main#main [data-testid="webpage-citation-pill"] img,
html:not(.lcgs-image-viewer-active) main section[data-turn] [data-testid="webpage-citation-pill"] img,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] [data-testid="webpage-citation-pill"] img {
  width: 14px !important;
  height: 14px !important;
}

html:not(.lcgs-image-viewer-active) main [${ACTION_CONTROL_ATTRIBUTE}="icon"]:hover,
html:not(.lcgs-image-viewer-active) main section[data-turn] button:has(.truncate):hover,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button:has(.truncate):hover,
html:not(.lcgs-image-viewer-active) main section[data-turn] button.text-start:has(> svg.icon-xs):hover,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button.text-start:has(> svg.icon-xs):hover,
html:not(.lcgs-image-viewer-active) main#main button.text-start:has(> svg.icon-xs):hover,
html:not(.lcgs-image-viewer-active) main section[data-turn] :is(button[data-testid="copy-turn-action-button"], button[data-testid="project-save-turn-action-button"], button[aria-label="Copy response"], button[aria-label="Copy message"], button[aria-label="Edit message"], button[aria-label="Add to project sources"], button[aria-label="Switch model"], button[aria-label="More actions"]):hover,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] :is(button[data-testid="copy-turn-action-button"], button[data-testid="project-save-turn-action-button"], button[aria-label="Copy response"], button[aria-label="Copy message"], button[aria-label="Edit message"], button[aria-label="Add to project sources"], button[aria-label="Switch model"], button[aria-label="More actions"]):hover,
html:not(.lcgs-image-viewer-active) main section[data-turn] button[aria-label="Sources"]:hover,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] button[aria-label="Sources"]:hover,
html:not(.lcgs-image-viewer-active) main section[data-turn] :is(button[aria-label="Share"], button[aria-label*="Share" i], button[data-testid*="share" i], a[role="button"][aria-label*="Share" i], [role="button"][aria-label*="Share" i]):hover,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] :is(button[aria-label="Share"], button[aria-label*="Share" i], button[data-testid*="share" i], a[role="button"][aria-label*="Share" i], [role="button"][aria-label*="Share" i]):hover {
  background-color: color-mix(in srgb, var(--lcgs-accent) 24%, var(--lcgs-surface) 62%) !important;
  border-color: color-mix(in srgb, var(--lcgs-accent) 58%, var(--lcgs-border) 42%) !important;
}

html:not(.lcgs-image-viewer-active) main#main [data-testid="webpage-citation-pill"] a:hover,
html:not(.lcgs-image-viewer-active) main#main [data-testid="webpage-citation-pill"] a[class*="bg-token-text-primary"]:hover,
html:not(.lcgs-image-viewer-active) main section[data-turn] [data-testid="webpage-citation-pill"] a:hover,
html:not(.lcgs-image-viewer-active) main section [data-message-id][class~="group/message"] [data-testid="webpage-citation-pill"] a:hover {
  background: color-mix(in srgb, var(--lcgs-accent) 18%, transparent) !important;
  background-color: color-mix(in srgb, var(--lcgs-accent) 18%, transparent) !important;
  border-color: color-mix(in srgb, var(--lcgs-accent) 58%, var(--lcgs-border) 42%) !important;
}

html.lcgs-image-viewer-active #${EXPORT_ID} {
  display: none !important;
}

[data-lcgs-image-viewer="true"] {
  --main-surface-primary: #202124 !important;
  --token-main-surface-primary: #202124 !important;
  --bg-primary: #202124 !important;
  background: #202124 !important;
  color: #f5f5f5 !important;
}

[data-lcgs-image-viewer="true"] :is([class*="bg-token-bg-primary"], [class*="bg-token-main-surface-primary"]) {
  background-color: #202124 !important;
}

[data-lcgs-image-viewer="true"] img {
  box-shadow: 0 18px 48px rgba(0, 0, 0, .32) !important;
}

html.lcgs-zen-mode-active body {
  overflow-x: hidden !important;
}

html.lcgs-zen-mode-active #page-header,
html.lcgs-zen-mode-active #calpico-page-header,
html.lcgs-zen-mode-active #stage-slideover-sidebar,
html.lcgs-zen-mode-active #stage-sidebar-tiny-bar,
html.lcgs-zen-mode-active #${EXPORT_ID},
html.lcgs-zen-mode-active #${EXPORT_MODAL_ID},
html.lcgs-zen-mode-active #${PROMPT_TOOLS_ID},
html.lcgs-zen-mode-active #${NAVIGATOR_ID},
html.lcgs-zen-mode-active #${SLASH_PALETTE_ID},
html.lcgs-zen-mode-active #${NOTES_ID},
html.lcgs-zen-mode-active .${MESSAGE_NOTE_BUTTON_CLASS} {
  display: none !important;
}

html.lcgs-zen-mode-active main#main {
  width: 100vw !important;
}

html.lcgs-zen-mode-active main#main div#thread,
html.lcgs-zen-mode-active main#main #thread {
  width: min(100%, var(--lcgs-chat-width)) !important;
  margin-inline: auto !important;
  padding-bottom: 48px !important;
}

html.lcgs-zen-mode-active main#main :is(
  [data-lcgs-memory-update="true"],
  [data-lcgs-memory-label="true"]
) {
  display: none !important;
}

html.lcgs-zen-mode-active main#main :is(
  button[data-testid="copy-turn-action-button"],
  button[data-testid="project-save-turn-action-button"],
  button[data-testid*="share" i],
  button[data-testid*="copy" i],
  button[data-testid*="thread-action" i],
  button[aria-label="Sources"],
  button[aria-label="Copy response"],
  button[aria-label="Copy message"],
  button[aria-label="Edit message"],
  button[aria-label="Add to project sources"],
  button[aria-label="Switch model"],
  button[aria-label="More actions"],
  button[aria-label*="Share" i],
  button[aria-label*="copy" i],
  button[aria-label*="source" i],
  button[aria-label*="reaction" i],
  button[aria-label*="read aloud" i],
  button[aria-label*="regenerate" i],
  button[aria-label*="retry" i],
  a[role="button"][aria-label*="Share" i],
  [role="button"][aria-label*="Share" i],
  [data-testid="webpage-citation-pill"],
  [data-testid*="citation" i],
  [data-testid*="sources" i],
  section[data-turn] button:has(.truncate),
  [class*="message-timestamp"],
  .stylergpt-message-timestamp
):not([data-testid="send-button"]):not([aria-label*="Voice" i]):not([aria-label*="Microphone" i]):not([aria-label*="dictation" i]) {
  display: none !important;
}

@media print {
  html,
  body,
  main#main {
    background: #fff !important;
    color: #111 !important;
    overflow: visible !important;
  }

  body::before,
  body::after,
  #page-header,
  #calpico-page-header,
  #stage-slideover-sidebar,
  #stage-sidebar-tiny-bar,
  #${EXPORT_ID},
  #${EXPORT_MODAL_ID},
  #${NOTES_ID} {
    display: none !important;
  }

  main#main div#thread,
  main#main #thread,
  main section[data-turn],
  main section div.agent-turn .markdown.prose {
    width: 100% !important;
    max-width: none !important;
    background: transparent !important;
    border-color: #d0d0d0 !important;
    box-shadow: none !important;
    color: #111 !important;
  }

  main section[data-turn] {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  pre,
  code,
  .markdown .lcgs-table-scroll,
  [class*="markdown"] .lcgs-table-scroll {
    border-color: #c9c9c9 !important;
    background: #f6f6f6 !important;
    color: #111 !important;
  }
}

main section div.agent-turn {
  color: var(--lcgs-assistant-text) !important;
}

main section div.agent-turn {
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
}

main section div.agent-turn .markdown.prose {
  font-family: var(--lcgs-font-family) !important;
  font-size: var(--lcgs-font-size) !important;
  line-height: var(--lcgs-line-height) !important;
  background: color-mix(in srgb, var(--lcgs-assistant-bg) 88%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-accent) 70%, var(--lcgs-border) 30%) !important;
  border-radius: calc(var(--lcgs-radius) + 8px) calc(var(--lcgs-radius) + 8px) calc(var(--lcgs-radius) + 8px) 0 !important;
  color: var(--lcgs-assistant-text) !important;
  padding: 22px 18px !important;
  width: fit-content !important;
  max-width: 100% !important;
}

.markdown p, .markdown li, .markdown table,
[class*="markdown"] p, [class*="markdown"] li, [class*="markdown"] table {
  font-family: var(--lcgs-font-family) !important;
  font-size: var(--lcgs-font-size) !important;
  color: inherit !important;
  line-height: var(--lcgs-line-height) !important;
}

main section div.agent-turn .markdown.prose:has(table),
main section[data-turn="assistant"] .markdown.prose:has(table) {
  width: 100% !important;
  overflow: hidden !important;
}

.markdown .lcgs-table-scroll,
[class*="markdown"] .lcgs-table-scroll {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 12px 0 !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  overscroll-behavior-x: contain !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 62%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 4px)) !important;
}

.markdown .lcgs-table-scroll[data-table-density="dense"],
[class*="markdown"] .lcgs-table-scroll[data-table-density="dense"] {
  overflow-x: auto !important;
}

.markdown .lcgs-table-scroll table,
[class*="markdown"] .lcgs-table-scroll table {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  table-layout: auto !important;
}

.markdown .lcgs-table-scroll[data-table-density="dense"] table,
[class*="markdown"] .lcgs-table-scroll[data-table-density="dense"] table {
  width: max-content !important;
  max-width: none !important;
}

.markdown :is(th, td),
[class*="markdown"] :is(th, td) {
  min-width: 0 !important;
  max-width: min(30ch, 36vw) !important;
  padding: 10px 12px !important;
  vertical-align: top !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: normal !important;
  border-color: color-mix(in srgb, var(--lcgs-border) 46%, transparent) !important;
}

.markdown th,
[class*="markdown"] th {
  background: color-mix(in srgb, var(--lcgs-surface) 62%, transparent) !important;
  color: var(--lcgs-text) !important;
  font-weight: 800 !important;
}

.markdown td,
[class*="markdown"] td {
  color: inherit !important;
}

pre,
.markdown pre,
[class*="markdown"] pre,
[id="code-block-viewer"],
.cm-editor,
.cm-scroller,
.cm-content,
pre > div,
.markdown pre > div,
[class*="markdown"] pre > div {
  background: var(--lcgs-code-bg) !important;
  color: var(--lcgs-code-text) !important;
  border-color: var(--lcgs-code-border) !important;
  font-family: var(--lcgs-code-font-family) !important;
  font-size: var(--lcgs-code-font-size) !important;
}

pre:has(#code-block-viewer),
.markdown pre:has(#code-block-viewer),
[class*="markdown"] pre:has(#code-block-viewer),
pre:not(.cm-content),
.markdown pre:not(.cm-content),
[class*="markdown"] pre:not(.cm-content) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  border: 1px solid var(--lcgs-code-border) !important;
  border-radius: var(--lcgs-code-radius) !important;
  padding: 0 !important;
  overflow: hidden !important;
  box-shadow: none !important;
}

pre.cm-content,
.markdown pre.cm-content,
[class*="markdown"] pre.cm-content {
  width: max-content !important;
  max-width: none !important;
  min-width: 100% !important;
  border: 0 !important;
  border-radius: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
}

pre:has(#code-block-viewer) *:not(.cm-content):not(.cm-content *),
.markdown pre:has(#code-block-viewer) *:not(.cm-content):not(.cm-content *),
[class*="markdown"] pre:has(#code-block-viewer) *:not(.cm-content):not(.cm-content *) {
  max-width: 100%;
  min-width: 0;
}

pre > div,
.markdown pre > div,
[class*="markdown"] pre > div,
[id="code-block-viewer"],
.cm-editor,
.cm-scroller,
.cm-content,
pre [class*="bg-token"],
pre [class*="bg-gray"],
pre [class*="bg-black"],
pre [class*="bg-white"],
.markdown pre [class*="bg-token"],
.markdown pre [class*="bg-gray"],
.markdown pre [class*="bg-black"],
.markdown pre [class*="bg-white"],
[class*="markdown"] pre [class*="bg-token"],
[class*="markdown"] pre [class*="bg-gray"],
[class*="markdown"] pre [class*="bg-black"],
[class*="markdown"] pre [class*="bg-white"] {
  background: var(--lcgs-code-bg) !important;
  border-color: var(--lcgs-code-border) !important;
}

[id="code-block-viewer"],
.cm-editor {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow: hidden !important;
}

.cm-scroller {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
}

pre:has(#code-block-viewer) :is(.border-token-border-light, [class*="border-token-border"]),
.markdown pre:has(#code-block-viewer) :is(.border-token-border-light, [class*="border-token-border"]),
[class*="markdown"] pre:has(#code-block-viewer) :is(.border-token-border-light, [class*="border-token-border"]) {
  border-color: var(--lcgs-code-border) !important;
}

pre:has(#code-block-viewer) :is(.rounded-3xl, [class*="border-radius-3xl"]),
.markdown pre:has(#code-block-viewer) :is(.rounded-3xl, [class*="border-radius-3xl"]),
[class*="markdown"] pre:has(#code-block-viewer) :is(.rounded-3xl, [class*="border-radius-3xl"]) {
  border-radius: var(--lcgs-code-radius) !important;
}

pre:has(#code-block-viewer) :is(.sticky, [class*="sticky"]):not(.cm-content *),
.markdown pre:has(#code-block-viewer) :is(.sticky, [class*="sticky"]):not(.cm-content *),
[class*="markdown"] pre:has(#code-block-viewer) :is(.sticky, [class*="sticky"]):not(.cm-content *) {
  background: var(--lcgs-code-bg) !important;
  color: var(--lcgs-code-text) !important;
}

pre:has(#code-block-viewer) button[aria-label="Copy"],
.markdown pre:has(#code-block-viewer) button[aria-label="Copy"],
[class*="markdown"] pre:has(#code-block-viewer) button[aria-label="Copy"] {
  color: var(--lcgs-code-text) !important;
  background: color-mix(in srgb, var(--lcgs-code-bg) 82%, var(--lcgs-code-border) 18%) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-code-border) 68%, transparent) !important;
}

div.pt-3:has(> pre),
.markdown div.pt-3:has(> pre),
[class*="markdown"] div.pt-3:has(> pre) {
  padding-top: 0 !important;
}

div.pe-11:has(> pre),
.markdown div.pe-11:has(> pre),
[class*="markdown"] div.pe-11:has(> pre) {
  padding-inline-end: 0 !important;
}

code:not(pre code) {
  background: color-mix(in srgb, var(--lcgs-code-bg) 86%, white 6%) !important;
  color: var(--lcgs-code-text) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-code-border) 72%, transparent) !important;
  border-radius: max(4px, calc(var(--lcgs-code-radius) - 4px)) !important;
  font-family: var(--lcgs-code-font-family) !important;
  font-size: 0.94em !important;
  padding: 1px 5px !important;
}

pre code,
.markdown pre code,
[class*="markdown"] pre code,
.cm-content,
.cm-line {
  color: var(--lcgs-code-text) !important;
  font-family: var(--lcgs-code-font-family) !important;
  font-size: var(--lcgs-code-font-size) !important;
}

pre code *,
.markdown pre code *,
[class*="markdown"] pre code *,
.cm-content *,
.cm-line * {
  font-family: var(--lcgs-code-font-family) !important;
  font-size: var(--lcgs-code-font-size) !important;
}

pre code span:not([class]),
.markdown pre code span:not([class]),
[class*="markdown"] pre code span:not([class]),
.cm-content span:not([class]),
.cm-line span:not([class]) {
  color: var(--lcgs-code-text) !important;
}

main section[data-turn="assistant"] pre,
main section[data-turn="assistant"] .markdown pre,
main section div.agent-turn pre {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
}

main section[data-turn="assistant"] .markdown,
main section[data-turn="assistant"] .markdown.prose {
  max-width: 100% !important;
}

main section[data-turn] :is(img, picture, video, canvas) {
  border-radius: calc(var(--lcgs-radius) + 8px) !important;
}

main section[data-turn="assistant"] .markdown.prose:has(img),
main section[data-turn="assistant"] .group\/imagegen-image,
main section[data-turn="assistant"] figure:has(img) {
  background: color-mix(in srgb, var(--lcgs-assistant-bg) 88%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-accent) 70%, var(--lcgs-border) 30%) !important;
  border-radius: calc(var(--lcgs-radius) + 10px) calc(var(--lcgs-radius) + 10px) calc(var(--lcgs-radius) + 10px) 0 !important;
  padding: 10px !important;
  width: fit-content !important;
  max-width: min(100%, var(--lcgs-chat-width)) !important;
  overflow: hidden !important;
}

main section[data-turn="user"] :is(div:has(> img), figure:has(img), [data-testid*="attachment"], [class*="attachment"]) {
  background: var(--lcgs-user-bg) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-user-bg) 78%, white 12%) !important;
  border-radius: var(--lcgs-radius) var(--lcgs-radius) 0 var(--lcgs-radius) !important;
  padding: 8px !important;
  width: fit-content !important;
  max-width: min(100%, var(--lcgs-chat-width)) !important;
  overflow: hidden !important;
}

main section[data-turn="user"] [class*="message-image"],
main section[data-turn="user"] [aria-label^="Open image"],
main section[data-turn="user"] [aria-label^="Open image"] img {
  border-radius: var(--lcgs-radius) var(--lcgs-radius) 0 var(--lcgs-radius) !important;
}

main section[data-turn="assistant"] .markdown.prose:has(img) :is(div, button, a),
main section[data-turn="assistant"] .group\/imagegen-image :is(div, button, a),
main section[data-turn="assistant"] figure:has(img) :is(div, button, a) {
  border-color: transparent !important;
  box-shadow: none !important;
}

main section[data-turn="assistant"] .markdown.prose:has(img) img,
main section[data-turn="assistant"] .group\/imagegen-image img,
main section[data-turn="assistant"] figure:has(img) img,
main section[data-turn="user"] :is(div:has(> img), figure:has(img), [data-testid*="attachment"], [class*="attachment"]) img {
  display: block !important;
  max-width: 100% !important;
  height: auto !important;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-section,
.hljs-link {
  color: #ff79c6 !important;
}

.hljs-string,
.hljs-title,
.hljs-name,
.hljs-type,
.hljs-attribute,
.hljs-symbol,
.hljs-bullet {
  color: #f1fa8c !important;
}

.hljs-built_in,
.hljs-builtin-name,
.hljs-number,
.hljs-meta {
  color: #bd93f9 !important;
}

.hljs-function,
.hljs-variable,
.hljs-template-variable {
  color: #50fa7b !important;
}

textarea, [contenteditable="true"], form [role="textbox"] {
  font-family: var(--lcgs-font-family) !important;
  font-size: var(--lcgs-font-size) !important;
  line-height: var(--lcgs-line-height) !important;
  color: var(--lcgs-text) !important;
}

[data-testid="composer-root"],
form.group\/composer .bg-token-bg-primary,
form.group\/composer [class*="bg-token-bg-primary"],
main form [class*="rounded-"]:has(#prompt-textarea),
main form [class*="rounded-"]:has(textarea[name="prompt-textarea"]),
main form [class*="rounded-"]:has(div[contenteditable="true"].ProseMirror),
main form:has(#prompt-textarea),
main form:has(textarea[name="prompt-textarea"]),
main form:has(div[contenteditable="true"].ProseMirror) {
  background: var(--lcgs-composer-bg) !important;
  border-color: var(--lcgs-border) !important;
  border-radius: calc(var(--lcgs-radius) + 14px) !important;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--lcgs-border) 74%, transparent), 0 18px 54px rgba(0, 0, 0, 0.22) !important;
}

main form:has(#prompt-textarea),
main form:has(textarea[name="prompt-textarea"]),
main form:has(div[contenteditable="true"].ProseMirror) {
  position: relative !important;
  isolation: isolate !important;
}

main form:has(#prompt-textarea)::after,
main form:has(textarea[name="prompt-textarea"])::after,
main form:has(div[contenteditable="true"].ProseMirror)::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: -1 !important;
  border-radius: calc(var(--lcgs-radius) + 14px) !important;
  background: var(--lcgs-composer-bg) !important;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--lcgs-border) 78%, transparent) !important;
}

main form textarea,
main form #prompt-textarea,
main form div[contenteditable="true"],
main form .ProseMirror {
  background: transparent !important;
}

main form:has(#prompt-textarea)::before,
main form:has(textarea[name="prompt-textarea"])::before,
main form:has(div[contenteditable="true"].ProseMirror)::before {
  background: none !important;
}

#page-header,
#calpico-page-header,
header[class*="h-header-height"] {
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 84%, #000 16%) !important;
  border-color: var(--lcgs-border) !important;
  backdrop-filter: none !important;
}

[data-lcgs-splash-heading="true"] {
  backdrop-filter: blur(10px) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 78%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 72%, transparent) !important;
  border-radius: 14px !important;
  color: var(--lcgs-text) !important;
  opacity: 1 !important;
  padding: 12px 24px !important;
}

html.lcgs-view-scheduled main#main > main.bg-primary {
  background-color: color-mix(in srgb, #08090c 46%, transparent) !important;
}

html.lcgs-view-scheduled main#main article,
html.lcgs-view-scheduled main#main [role="list"] > * > button {
  background-color: color-mix(in srgb, var(--lcgs-surface) 84%, var(--lcgs-sidebar-bg) 16%) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 54%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 2px)) !important;
  color: var(--lcgs-text) !important;
}

html.lcgs-view-scheduled main#main article:hover,
html.lcgs-view-scheduled main#main [role="list"] > * > button:hover {
  background-color: color-mix(in srgb, var(--lcgs-surface) 74%, var(--lcgs-accent) 26%) !important;
}

html.lcgs-view-plugins main#main .bg-primary.min-h-screen {
  background-color: color-mix(in srgb, #08090c 46%, transparent) !important;
}

html.lcgs-view-plugins main#main article {
  background-color: color-mix(in srgb, var(--lcgs-surface) 84%, var(--lcgs-sidebar-bg) 16%) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 50%, transparent) !important;
  color: var(--lcgs-text) !important;
}

html.lcgs-view-plugins main#main article:hover {
  background-color: color-mix(in srgb, var(--lcgs-surface) 74%, var(--lcgs-accent) 26%) !important;
}

html.lcgs-view-plugins main#main #plugin-search,
html.lcgs-view-plugins main#main [role="tab"],
html.lcgs-view-plugins main#main form[role="search"] ~ button {
  background-color: color-mix(in srgb, var(--lcgs-surface) 84%, var(--lcgs-sidebar-bg) 16%) !important;
  border-color: color-mix(in srgb, var(--lcgs-border) 54%, transparent) !important;
  color: var(--lcgs-text) !important;
}

html.lcgs-view-project main#main {
  background-color: color-mix(in srgb, #08090c 42%, transparent) !important;
}

html.lcgs-view-project main#main #thread {
  width: 100% !important;
  max-width: none !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is([role="tablist"], nav:has([role="tab"]), div:has(> [role="tab"])) {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  color: var(--lcgs-text) !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) [data-testid="artifacts-surface-top-controls-shell"],
main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) [data-testid="artifacts-surface-top-controls"],
main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) [data-testid="artifacts-surface-top-controls-shell-inner"],
main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) [data-testid="artifacts-surface-library-toolbar-controls"],
main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) [data-testid="page-table-toolbar-shell"],
main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) [data-testid="page-table-toolbar-shell-inner"] {
  --main-surface-primary: transparent !important;
  --token-main-surface-primary: transparent !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is([role="tab"], button:has(svg), [role="button"]:has(svg)) {
  background-color: color-mix(in srgb, var(--lcgs-surface) 68%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 4px)) !important;
  color: var(--lcgs-text) !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is([role="tab"][aria-selected="true"], [role="tab"][data-state="active"], button[aria-pressed="true"], [role="button"][aria-pressed="true"]) {
  background-color: color-mix(in srgb, var(--lcgs-surface) 92%, #000 8%) !important;
  border-color: color-mix(in srgb, var(--lcgs-accent) 48%, var(--lcgs-border) 52%) !important;
  color: var(--lcgs-text) !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is([role="tab"], button:has(svg), [role="button"]:has(svg)):hover {
  background-color: color-mix(in srgb, var(--lcgs-surface) 82%, transparent) !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is(table, [role="table"], [role="grid"], [data-testid*="library"], [data-testid*="file-list"], [class*="library"]:has([role="row"])) {
  background-color: color-mix(in srgb, var(--lcgs-surface) 90%, var(--lcgs-sidebar-bg) 10%) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 48%, transparent) !important;
  border-radius: calc(var(--lcgs-radius) + 8px) !important;
  color: var(--lcgs-text) !important;
  overflow: hidden !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is(tr, [role="row"], li, article):has(:is(img, svg, [role="cell"], [data-testid*="file"], [href*="/library"])),
main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) [role="list"] > article {
  background-color: color-mix(in srgb, var(--lcgs-surface) 84%, var(--lcgs-sidebar-bg) 16%) !important;
  border-color: color-mix(in srgb, var(--lcgs-border) 42%, transparent) !important;
  color: var(--lcgs-text) !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is(tr, [role="row"], li, article):has(:is(img, svg, [role="cell"], [data-testid*="file"], [href*="/library"])):hover,
main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) [role="list"] > article:hover {
  background-color: color-mix(in srgb, var(--lcgs-surface) 76%, var(--lcgs-accent) 24%) !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is([role="cell"], [role="columnheader"], td, th) {
  color: inherit !important;
  border-color: color-mix(in srgb, var(--lcgs-border) 34%, transparent) !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) :is(
  [data-testid="artifacts-surface-top-controls"] button,
  [data-testid="artifacts-surface-top-controls-shell"] button,
  button[aria-label="Open filters"],
  [role="tab"],
  select
) {
  border-color: color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 82%, var(--lcgs-sidebar-bg) 18%) !important;
  color: var(--lcgs-text) !important;
}

main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) div:has(> button[aria-label*="modified" i]),
main#main:has(:is(#artifacts-library-search-input, input[placeholder*="Search library"])) div:has(> button[aria-label^="Open folder" i]) {
  padding: 8px !important;
  background-color: color-mix(in srgb, var(--lcgs-surface) 84%, var(--lcgs-sidebar-bg) 16%) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 48%, transparent) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 2px)) !important;
}

main#main:has(input[placeholder*="Search GPTs"]) :is([class*="bg-token-main-surface"], [class*="bg-token-bg"], [class*="bg-surface"], [class*="sticky"], [role="tablist"], nav:has(a), div:has(> input[placeholder*="Search GPTs"])) {
  --main-surface-primary: transparent !important;
  --token-main-surface-primary: transparent !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

main#main:has(input[placeholder*="Search GPTs"]) :is(input[placeholder*="Search GPTs"], a[href*="/g/"], a[href*="/gpts"], button, [role="button"], [role="tab"]) {
  border-color: color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
}

main#main:has(input[placeholder*="Search GPTs"]) :is(a[href*="/g/"], a[href*="/gpts"], button, [role="button"], [role="tab"]) {
  background-color: color-mix(in srgb, var(--lcgs-surface) 68%, transparent) !important;
  color: var(--lcgs-text) !important;
  border-radius: max(8px, calc(var(--lcgs-radius) - 4px)) !important;
}

main#main:has(input[placeholder*="Search GPTs"]) :is(a[href*="/g/"], a[href*="/gpts"], button, [role="button"], [role="tab"]):hover,
main#main:has(input[placeholder*="Search GPTs"]) :is([aria-selected="true"], [aria-current="page"], [data-state="active"], [aria-pressed="true"]) {
  background-color: color-mix(in srgb, var(--lcgs-surface) 86%, transparent) !important;
  border-color: color-mix(in srgb, var(--lcgs-accent) 48%, var(--lcgs-border) 52%) !important;
}

main#main:has(input[placeholder*="Search GPTs"]) :is(article, li, [role="article"], [role="listitem"], div[class*="rounded"], div[class*="border"], [class*="group"]):has(:is(img, picture, svg)):has(:is(h2, h3, [class*="font-semibold"], [class*="font-bold"])) {
  background-color: color-mix(in srgb, var(--lcgs-surface) 76%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 48%, transparent) !important;
  border-radius: calc(var(--lcgs-radius) + 8px) !important;
  color: var(--lcgs-text) !important;
  box-shadow: 0 18px 54px rgba(0, 0, 0, .16) !important;
}

main#main:has(input[placeholder*="Search GPTs"]) :is(article, li, [role="article"], [role="listitem"], div[class*="rounded"], div[class*="border"], [class*="group"]):has(:is(img, picture, svg)):has(:is(h2, h3, [class*="font-semibold"], [class*="font-bold"])):hover {
  background-color: color-mix(in srgb, var(--lcgs-surface) 88%, transparent) !important;
  border-color: color-mix(in srgb, var(--lcgs-accent) 48%, var(--lcgs-border) 52%) !important;
}

main#main form:has(#prompt-textarea) :is(#prompt-textarea, textarea, [contenteditable="true"], [role="textbox"], .ProseMirror),
main#main form:has(textarea[name="prompt-textarea"]) :is(#prompt-textarea, textarea, [contenteditable="true"], [role="textbox"], .ProseMirror),
main#main form:has(div[contenteditable="true"].ProseMirror) :is(#prompt-textarea, textarea, [contenteditable="true"], [role="textbox"], .ProseMirror),
main#main [data-testid="composer-root"] :is(#prompt-textarea, textarea, [contenteditable="true"], [role="textbox"], .ProseMirror) {
  background: transparent !important;
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

main#main .popover {
  background-color: color-mix(in srgb, var(--lcgs-sidebar-bg) 94%, #08090c 6%) !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent) !important;
  color: var(--lcgs-text) !important;
  box-shadow: 0 18px 48px rgba(0, 0, 0, .36) !important;
}

main#main .popover .__menu-item {
  background-color: transparent !important;
}

main#main .popover .__menu-item:hover {
  background-color: color-mix(in srgb, var(--lcgs-accent) 16%, transparent) !important;
}

main#main div#thread #thread-bottom-container > div,
main#main > div.relative.min-w-0.grow > section.flex.min-h-screen.flex-1.flex-col > div.bg-token-bg-primary.sticky.bottom-0.z-20 {
  background: transparent !important;
  background-image: none !important;
}

main#main div#thread div.composer-parent div.content-fade-top::after,
main#main div#thread div.composer-parent [class*="content-fade"]::after,
main#main div#thread div.composer-parent [class*="content-fade"]::before {
  display: none !important;
  background: none !important;
  background-image: none !important;
}

main#main div#thread div#thread-bottom-container > div.-mt-4.text-token-text-secondary,
main#main > div.relative.min-w-0.grow > section.flex.min-h-screen.flex-1.flex-col div.text-token-text-secondary.relative.mt-auto.flex.min-h-8,
main#main .select-none.active\\:select-auto.flex.min-h-8.w-full.items-center.justify-center:has(.text-token-text-tertiary > div) {
  visibility: hidden !important;
}

svg {
  color: currentColor;
}

html.lcgs-custom-logo-active #sidebar-header a[href="/"],
html.lcgs-custom-logo-active #sidebar-header a[data-sidebar-item="true"][href="/"],
html.lcgs-custom-logo-active #sidebar-header :is(a, button):has(> .header-wordmark),
html.lcgs-custom-logo-active #stage-sidebar-tiny-bar button:not(.__menu-item) {
  position: relative !important;
}

html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header a[href="/"],
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header a[data-sidebar-item="true"][href="/"],
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header :is(a, button):has(> .header-wordmark),
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #stage-sidebar-tiny-bar button:not(.__menu-item) {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 8px !important;
  padding-left: 34px !important;
}

html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header a[href="/"] > *,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header a[data-sidebar-item="true"][href="/"] > *,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header :is(a, button):has(> .header-wordmark) > *,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #stage-sidebar-tiny-bar button:not(.__menu-item) > * {
  opacity: 1 !important;
  visibility: visible !important;
}

html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header a[href="/"] svg,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header a[data-sidebar-item="true"][href="/"] svg,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header :is(a, button):has(> .header-wordmark) svg,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #stage-sidebar-tiny-bar button:not(.__menu-item) svg {
  opacity: 0 !important;
  visibility: hidden !important;
}

html.lcgs-custom-logo-active #sidebar-header a[href="/"]::before,
html.lcgs-custom-logo-active #sidebar-header a[data-sidebar-item="true"][href="/"]::before,
html.lcgs-custom-logo-active #sidebar-header :is(a, button):has(> .header-wordmark)::before,
html.lcgs-custom-logo-active #stage-sidebar-tiny-bar button:not(.__menu-item)::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-width: 28px !important;
  max-height: 28px !important;
  margin: auto !important;
  background-image: var(--lcgs-brand-logo-url, none) !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: contain !important;
  pointer-events: none !important;
}

html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header a[href="/"]::before,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header a[data-sidebar-item="true"][href="/"]::before,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #sidebar-header :is(a, button):has(> .header-wordmark)::before,
html.lcgs-custom-logo-active:not(.lcgs-custom-brand-active) #stage-sidebar-tiny-bar button:not(.__menu-item)::before {
  inset: auto !important;
  top: 50% !important;
  left: 6px !important;
  width: 22px !important;
  height: 22px !important;
  max-width: 22px !important;
  max-height: 22px !important;
  margin: 0 !important;
  transform: translateY(-50%) !important;
}

html.lcgs-custom-brand-active #stage-slideover-sidebar #sidebar-header,
html.lcgs-custom-brand-active #sidebar-header:has(a[data-sidebar-item="true"][href="/"]) {
  gap: 8px !important;
}

html.lcgs-custom-brand-active #stage-slideover-sidebar #sidebar-header a[href="/"],
html.lcgs-custom-brand-active #sidebar-header a[href="/"],
html.lcgs-custom-brand-active #sidebar-header a[data-sidebar-item="true"][href="/"],
html.lcgs-custom-brand-active #sidebar-header :is(a, button):has(> .header-wordmark) {
  position: relative !important;
  display: flex !important;
  flex: 1 1 auto !important;
  align-items: center !important;
  justify-content: flex-start !important;
  min-width: 0 !important;
  max-width: calc(100% - 44px) !important;
  width: auto !important;
  padding: 0 6px 0 34px !important;
  gap: 8px !important;
  overflow: hidden !important;
  font-size: 0 !important;
  white-space: nowrap !important;
}

html.lcgs-custom-brand-active #stage-slideover-sidebar #sidebar-header a[href="/"] > *,
html.lcgs-custom-brand-active #sidebar-header a[href="/"] > *,
html.lcgs-custom-brand-active #sidebar-header a[data-sidebar-item="true"][href="/"] > *,
html.lcgs-custom-brand-active #sidebar-header :is(a, button):has(> .header-wordmark) > * {
  display: none !important;
}

html.lcgs-custom-logo-active.lcgs-custom-brand-active #stage-slideover-sidebar #sidebar-header a[href="/"]::before,
html.lcgs-custom-logo-active.lcgs-custom-brand-active #sidebar-header a[href="/"]::before,
html.lcgs-custom-logo-active.lcgs-custom-brand-active #sidebar-header a[data-sidebar-item="true"][href="/"]::before,
html.lcgs-custom-logo-active.lcgs-custom-brand-active #sidebar-header :is(a, button):has(> .header-wordmark)::before {
  inset: auto !important;
  top: 50% !important;
  left: 8px !important;
  width: 20px !important;
  height: 20px !important;
  max-width: 20px !important;
  max-height: 20px !important;
  margin: 0 !important;
  transform: translateY(-50%) !important;
}

html.lcgs-custom-brand-active #stage-slideover-sidebar #sidebar-header a[href="/"]::after,
html.lcgs-custom-brand-active #sidebar-header a[href="/"]::after,
html.lcgs-custom-brand-active #sidebar-header a[data-sidebar-item="true"][href="/"]::after,
html.lcgs-custom-brand-active #sidebar-header :is(a, button):has(> .header-wordmark)::after {
  content: var(--lcgs-brand-name, "") !important;
  display: block !important;
  min-width: 0 !important;
  margin-left: 0 !important;
  overflow: hidden !important;
  color: var(--lcgs-text) !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

${settings.compactSidebar ? `
aside a,
nav a {
  min-height: 32px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

a[href="/codex"],
a[data-testid="apps-button"],
button[aria-label="Download apps"],
button[class="group __menu-item hoverable gap-1.5 w-full"],
span.inline-flex.items-center.gap-1.truncate.text-xs.font-normal.text-token-text-tertiary,
div[class="pb-[calc(var(--sidebar-section-margin-top)-var(--sidebar-section-first-margin-top))]"] {
  display: none !important;
}
` : ""}

nav[aria-label="Chat history"] .__menu-label[data-lcgs-sidebar-label] {
  visibility: hidden !important;
}

nav[aria-label="Chat history"] .__menu-label[data-lcgs-sidebar-label]::after {
  visibility: visible !important;
  content: "Folders";
  display: block;
  padding-bottom: 2px;
}

nav[aria-label="Chat history"] .__menu-label[data-lcgs-sidebar-label="loose-files"]::after {
  content: "Loose files";
}

html.lcgs-compact-sidebar-active [data-lcgs-profile-status="true"] {
  display: none !important;
}

#${EXPORT_ID} {
  position: relative;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
  font: 700 12px/1 var(--lcgs-font-family);
  pointer-events: auto;
}

#${EXPORT_ID}[hidden] {
  display: none !important;
}

#${EXPORT_ID} button {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 62%, transparent);
  border-radius: 8px !important;
  background: color-mix(in srgb, var(--lcgs-surface) 44%, transparent) !important;
  color: var(--lcgs-text) !important;
  cursor: pointer;
}

main#main [data-lcgs-disclaimer="true"] {
  display: none !important;
}

#${EXPORT_ID} .lcgs-export-trigger {
  background: color-mix(in srgb, var(--lcgs-surface) 44%, transparent) !important;
}

#${EXPORT_ID} button:hover,
#${EXPORT_ID} button:focus-visible {
  background: color-mix(in srgb, var(--lcgs-accent) 22%, transparent) !important;
  outline: none;
}

#${EXPORT_ID} svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

#${EXPORT_ID} .lcgs-export-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  display: none;
  min-width: 180px;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 72%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 96%, #000 4%);
  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
}

#${EXPORT_ID}[data-open="true"] .lcgs-export-menu {
  display: grid;
  gap: 4px;
}

#${EXPORT_ID} .lcgs-export-menu button {
  justify-content: flex-start;
  width: 100%;
  padding: 0 8px;
  font-weight: 600;
}

#${EXPORT_ID} .lcgs-export-ext {
  min-width: 34px;
  color: #fff;
  font: 900 11px/1 ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace;
  text-transform: uppercase;
}

#${PROMPT_TOOLS_ID}[hidden],
#${SLASH_PALETTE_ID}[hidden],
#${NAVIGATOR_ID}[hidden] {
  display: none !important;
}

#${PROMPT_TOOLS_ID},
#${NAVIGATOR_ID} {
  position: relative;
  top: auto;
  right: auto;
  z-index: auto;
  flex: 0 0 auto;
  width: auto;
  color: var(--lcgs-text);
  font: 700 13px/1.35 var(--lcgs-font-family);
  pointer-events: auto;
}

#${PROMPT_TOOLS_ID} {
  order: -1;
}

#${PROMPT_TOOLS_ID} .lcgs-tool-trigger,
#${NAVIGATOR_ID} .lcgs-tool-trigger {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 62%, transparent);
  border-radius: 8px !important;
  background: color-mix(in srgb, var(--lcgs-surface) 44%, transparent) !important;
  color: var(--lcgs-text) !important;
  box-shadow: none;
  cursor: pointer;
}

:is(#page-header, #calpico-page-header) :is(
  button[aria-label="Share"],
  button[aria-label*="Share" i],
  button[aria-label="More actions"]
) {
  min-height: 32px !important;
  height: 32px !important;
  padding: 0 10px !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 62%, transparent) !important;
  border-radius: 8px !important;
  background: color-mix(in srgb, var(--lcgs-surface) 44%, transparent) !important;
  color: var(--lcgs-text) !important;
  box-shadow: none !important;
}

#${PROMPT_TOOLS_ID} .lcgs-tool-trigger:hover,
#${PROMPT_TOOLS_ID} .lcgs-tool-trigger:focus-visible,
#${NAVIGATOR_ID} .lcgs-tool-trigger:hover,
#${NAVIGATOR_ID} .lcgs-tool-trigger:focus-visible {
  background: color-mix(in srgb, var(--lcgs-accent) 22%, transparent) !important;
  outline: none;
}

#${PROMPT_TOOLS_ID} .lcgs-tool-panel,
#${NAVIGATOR_ID} .lcgs-tool-panel,
#${SLASH_PALETTE_ID} {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: min(380px, calc(100vw - 32px));
  margin-top: 8px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 72%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 94%, #000 6%);
  color: var(--lcgs-text);
  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.38);
  overflow: hidden;
  pointer-events: auto;
}

#${PROMPT_TOOLS_ID}[data-open="true"] .lcgs-tool-panel,
#${NAVIGATOR_ID}[data-open="true"] .lcgs-tool-panel,
#${SLASH_PALETTE_ID}[data-open="true"] {
  display: grid;
}

#${PROMPT_TOOLS_ID} .lcgs-tool-panel {
  max-height: min(560px, calc(100vh - 96px));
  grid-template-rows: auto auto minmax(120px, 1fr);
}

#${NAVIGATOR_ID} .lcgs-tool-panel {
  max-height: min(520px, calc(100vh - 144px));
  grid-template-rows: auto auto minmax(140px, 1fr);
}

#${PROMPT_TOOLS_ID} header,
#${NAVIGATOR_ID} header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--lcgs-border) 56%, transparent);
  background: color-mix(in srgb, var(--lcgs-surface) 64%, transparent);
}

#${PROMPT_TOOLS_ID} .lcgs-tool-title,
#${NAVIGATOR_ID} .lcgs-tool-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 900;
}

#${PROMPT_TOOLS_ID} .lcgs-tool-panel button,
#${NAVIGATOR_ID} .lcgs-tool-panel button,
#${SLASH_PALETTE_ID} button {
  appearance: none;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 54%, transparent);
  border-radius: 8px !important;
  background: color-mix(in srgb, var(--lcgs-surface) 72%, transparent) !important;
  color: var(--lcgs-text) !important;
  cursor: pointer;
}

#${PROMPT_TOOLS_ID} .lcgs-panel-close,
#${NAVIGATOR_ID} .lcgs-panel-close {
  min-width: 30px;
  min-height: 28px;
  padding: 0 8px;
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-form,
#${PROMPT_TOOLS_ID} .lcgs-prompt-history-tools,
#${NAVIGATOR_ID} .lcgs-nav-tools {
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--lcgs-border) 50%, transparent);
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

#${PROMPT_TOOLS_ID} input,
#${PROMPT_TOOLS_ID} textarea,
#${NAVIGATOR_ID} input {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent);
  border-radius: 8px !important;
  background: color-mix(in srgb, var(--lcgs-surface) 78%, transparent) !important;
  color: var(--lcgs-text) !important;
  padding: 8px 10px !important;
  font: 600 12px/1.35 var(--lcgs-font-family) !important;
  outline: none !important;
}

#${PROMPT_TOOLS_ID} textarea {
  min-height: 78px;
  max-height: 160px;
  resize: vertical;
}

#${PROMPT_TOOLS_ID} .lcgs-primary-action {
  min-height: 34px;
  border-color: color-mix(in srgb, var(--lcgs-accent) 58%, var(--lcgs-border) 42%) !important;
  background: color-mix(in srgb, var(--lcgs-accent) 28%, var(--lcgs-surface) 72%) !important;
  font-weight: 900;
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-list,
#${PROMPT_TOOLS_ID} .lcgs-history-list,
#${NAVIGATOR_ID} .lcgs-nav-list {
  display: grid;
  gap: 6px;
  padding: 10px 12px;
  overflow: auto;
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-row,
#${PROMPT_TOOLS_ID} .lcgs-history-row,
#${NAVIGATOR_ID} .lcgs-nav-row,
#${SLASH_PALETTE_ID} .lcgs-slash-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 8px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 46%, transparent);
  border-radius: 9px;
  background: color-mix(in srgb, var(--lcgs-surface) 58%, transparent);
}

#${NAVIGATOR_ID} .lcgs-nav-row,
#${SLASH_PALETTE_ID} .lcgs-slash-row {
  grid-template-columns: auto 1fr;
  text-align: left;
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-main,
#${NAVIGATOR_ID} .lcgs-nav-main,
#${SLASH_PALETTE_ID} .lcgs-slash-main {
  min-width: 0;
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-name,
#${NAVIGATOR_ID} .lcgs-nav-label,
#${SLASH_PALETTE_ID} .lcgs-slash-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 900;
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-text,
#${NAVIGATOR_ID} .lcgs-nav-text,
#${SLASH_PALETTE_ID} .lcgs-slash-text {
  margin-top: 2px;
  overflow: hidden;
  color: var(--lcgs-muted);
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-actions {
  display: inline-flex;
  gap: 6px;
}

#${PROMPT_TOOLS_ID} .lcgs-snippet-actions button,
#${PROMPT_TOOLS_ID} .lcgs-history-row button {
  min-height: 30px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 850;
}

#${PROMPT_TOOLS_ID} .lcgs-prompt-history-tools {
  grid-template-columns: 1fr auto;
  align-items: center;
}

#${PROMPT_TOOLS_ID} .lcgs-history-search {
  grid-column: 1 / -1;
}

#${PROMPT_TOOLS_ID} .lcgs-muted-line,
#${NAVIGATOR_ID} .lcgs-muted-line {
  color: var(--lcgs-muted);
  font-size: 11px;
  font-weight: 700;
}

#${NAVIGATOR_ID} .lcgs-nav-tools {
  grid-template-columns: 1fr;
}

#${NAVIGATOR_ID} .lcgs-nav-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--lcgs-muted);
  font-size: 11px;
}

#${NAVIGATOR_ID} .lcgs-nav-scopes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

#${NAVIGATOR_ID} .lcgs-nav-actions {
  display: flex;
  justify-content: flex-end;
}

#${NAVIGATOR_ID} .lcgs-nav-tag {
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 50%, transparent);
  border-radius: 999px;
  padding: 2px 6px;
  background: color-mix(in srgb, var(--lcgs-accent) 12%, transparent);
}

#${NAVIGATOR_ID} .lcgs-nav-scope {
  min-height: 28px;
  padding: 0 8px;
  border-radius: 999px !important;
  font-size: 11px;
  font-weight: 850;
}

#${NAVIGATOR_ID} .lcgs-nav-copy {
  min-height: 30px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 850;
}

#${NAVIGATOR_ID} .lcgs-nav-scope[aria-pressed="true"] {
  border-color: color-mix(in srgb, var(--lcgs-accent) 64%, var(--lcgs-border) 36%) !important;
  background: color-mix(in srgb, var(--lcgs-accent) 24%, var(--lcgs-surface) 76%) !important;
}

#${NAVIGATOR_ID} .lcgs-nav-index,
#${SLASH_PALETTE_ID} .lcgs-slash-command {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  min-height: 24px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--lcgs-accent) 20%, transparent);
  color: var(--lcgs-text);
  font: 900 11px/1 ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace;
}

#${SLASH_PALETTE_ID} {
  position: fixed;
  left: 50%;
  bottom: 96px;
  z-index: 2147483647;
  width: min(460px, calc(100vw - 32px));
  max-height: min(340px, calc(100vh - 160px));
  transform: translateX(-50%);
  padding: 8px;
  overflow: auto;
  font: 700 13px/1.35 var(--lcgs-font-family);
}

#${SLASH_PALETTE_ID} .lcgs-slash-row {
  width: 100%;
  margin-bottom: 6px;
  padding: 9px;
}

#${NOTES_ID}[hidden] {
  display: none !important;
}

#${NOTES_ID} {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2147483645;
  width: min(340px, calc(100vw - 32px));
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 72%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 92%, #000 8%);
  color: var(--lcgs-text);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.36);
  overflow: hidden;
  pointer-events: auto;
}

#${NOTES_ID}[data-collapsed="true"] {
  width: auto;
}

#${NOTES_ID} header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent);
  background: color-mix(in srgb, var(--lcgs-surface) 68%, transparent);
  font: 800 12px/1 var(--lcgs-font-family);
}

#${NOTES_ID} .lcgs-notes-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#${NOTES_ID} .lcgs-notes-actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
}

#${NOTES_ID} button {
  min-height: 28px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 58%, transparent);
  border-radius: 8px !important;
  background: color-mix(in srgb, var(--lcgs-accent) 18%, transparent) !important;
  color: var(--lcgs-text) !important;
  padding: 0 8px;
  cursor: pointer;
}

#${NOTES_ID}[data-collapsed="true"] .lcgs-notes-body {
  display: none !important;
}

#${NOTES_ID} textarea {
  display: block;
  width: 100%;
  min-height: 180px;
  max-height: 45vh;
  resize: vertical;
  border: 0 !important;
  border-radius: 0 !important;
  background: color-mix(in srgb, var(--lcgs-surface) 72%, transparent) !important;
  color: var(--lcgs-text) !important;
  padding: 12px !important;
  font: 500 13px/1.45 var(--lcgs-font-family) !important;
  outline: none !important;
}

html.lcgs-local-notes-active main section[data-turn],
html.lcgs-local-notes-active main [data-message-author-role] {
  position: relative;
}

html.lcgs-local-notes-active .${MESSAGE_NOTE_BUTTON_CLASS} {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  min-height: 28px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 56%, transparent);
  border-radius: 8px !important;
  background: color-mix(in srgb, var(--lcgs-surface) 76%, transparent) !important;
  color: var(--lcgs-text) !important;
  font: 800 11px/1 var(--lcgs-font-family);
  opacity: 0;
  cursor: pointer;
  transition: opacity .15s ease, background-color .15s ease;
}

html.lcgs-local-notes-active main section[data-turn]:hover > .${MESSAGE_NOTE_BUTTON_CLASS},
html.lcgs-local-notes-active main [data-message-author-role]:hover > .${MESSAGE_NOTE_BUTTON_CLASS},
html.lcgs-local-notes-active .${MESSAGE_NOTE_BUTTON_CLASS}:focus-visible {
  opacity: 1;
}

html.lcgs-local-notes-active .${MESSAGE_NOTE_BUTTON_CLASS}[data-has-note="true"] {
  opacity: .92;
  border-color: color-mix(in srgb, var(--lcgs-accent) 64%, var(--lcgs-border) 36%);
}

html.lcgs-local-notes-active .${MESSAGE_NOTE_BUTTON_CLASS}[data-has-note="true"]::after {
  content: "";
  width: 6px;
  height: 6px;
  margin-left: 2px;
  border-radius: 50%;
  background: var(--lcgs-accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--lcgs-accent) 70%, transparent);
}

html.lcgs-local-notes-active .${MESSAGE_NOTE_BUTTON_CLASS}:hover,
html.lcgs-local-notes-active .${MESSAGE_NOTE_BUTTON_CLASS}:focus-visible {
  background: color-mix(in srgb, var(--lcgs-accent) 20%, var(--lcgs-surface) 80%) !important;
  outline: none;
}

#${EXPORT_MODAL_ID}[hidden] {
  display: none !important;
}

#${EXPORT_MODAL_ID} {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(8, 4, 10, 0.58);
}

#${EXPORT_MODAL_ID} .lcgs-modal {
  width: min(720px, calc(100vw - 32px));
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 74%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 92%, #111318 8%);
  color: var(--lcgs-text);
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.52);
  overflow: hidden;
}

#${EXPORT_MODAL_ID} .lcgs-modal,
#${EXPORT_MODAL_ID} .lcgs-modal * {
  box-sizing: border-box;
}

#${EXPORT_MODAL_ID} header,
#${EXPORT_MODAL_ID} footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
}

#${EXPORT_MODAL_ID} header {
  background: color-mix(in srgb, var(--lcgs-surface) 86%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--lcgs-border) 68%, transparent);
}

#${EXPORT_MODAL_ID} h2 {
  margin: 0;
  font-size: 18px;
}

#${EXPORT_MODAL_ID} .lcgs-modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 20px;
}

#${EXPORT_MODAL_ID} .lcgs-panel {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 4px 16px;
  border: 0;
  border-radius: 0;
  background: transparent;
}

#${EXPORT_MODAL_ID} .lcgs-panel + .lcgs-panel {
  border-left: 1px solid color-mix(in srgb, var(--lcgs-border) 54%, transparent);
}

#${EXPORT_MODAL_ID} h3 {
  margin: 0 0 6px;
  font-size: 13px;
  letter-spacing: .04em;
  text-transform: uppercase;
}

#${EXPORT_MODAL_ID} label {
  display: grid;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--lcgs-muted);
}

#${EXPORT_MODAL_ID} input,
#${EXPORT_MODAL_ID} select {
  min-height: 40px;
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 65%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--lcgs-surface) 78%, #0b0d10 22%);
  color: var(--lcgs-text);
  padding: 0 12px;
  font: inherit;
}

#${EXPORT_MODAL_ID} .lcgs-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 55%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--lcgs-surface) 72%, transparent);
  color: var(--lcgs-text);
  font-weight: 700;
}

#${EXPORT_MODAL_ID} .lcgs-toggle-row input {
  appearance: none;
  position: relative;
  width: 42px;
  min-height: 22px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 70%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--lcgs-sidebar-bg) 80%, #0b0d10 20%);
  padding: 0;
  cursor: pointer;
  transition: background-color .15s ease, border-color .15s ease;
}

#${EXPORT_MODAL_ID} .lcgs-toggle-row input::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d7c4dc;
  transition: transform .15s ease, background-color .15s ease;
}

#${EXPORT_MODAL_ID} .lcgs-toggle-row input:checked {
  background: var(--lcgs-accent);
  border-color: color-mix(in srgb, var(--lcgs-accent) 76%, white 24%);
}

#${EXPORT_MODAL_ID} .lcgs-toggle-row input:checked::after {
  transform: translateX(19px);
  background: #fff;
}

#${EXPORT_MODAL_ID} .lcgs-disabled {
  opacity: .45;
}

#${EXPORT_MODAL_ID} .lcgs-disabled input,
#${EXPORT_MODAL_ID} .lcgs-disabled select {
  cursor: not-allowed;
}

#${EXPORT_MODAL_ID} .lcgs-turn-picker[hidden] {
  display: none !important;
}

#${EXPORT_MODAL_ID} .lcgs-turn-picker {
  display: grid;
  gap: 6px;
  max-height: 190px;
  overflow: auto;
  padding: 8px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 55%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--lcgs-surface) 64%, transparent);
}

#${EXPORT_MODAL_ID} .lcgs-turn-option {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 4px 2px;
  color: var(--lcgs-text);
  font-weight: 650;
}

#${EXPORT_MODAL_ID} .lcgs-turn-option input {
  width: 16px;
  min-height: 16px;
  accent-color: var(--lcgs-accent);
}

#${EXPORT_MODAL_ID} .lcgs-turn-option span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#${EXPORT_MODAL_ID} button {
  min-height: 40px;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 70%, transparent);
  border-radius: 10px !important;
  background: color-mix(in srgb, var(--lcgs-surface) 78%, transparent) !important;
  color: var(--lcgs-text) !important;
  padding: 0 14px;
  font-weight: 800;
  cursor: pointer;
}

#${EXPORT_MODAL_ID} .lcgs-primary {
  background: color-mix(in srgb, var(--lcgs-accent) 72%, var(--lcgs-surface) 28%) !important;
  border-color: var(--lcgs-accent) !important;
}

html:not(.lcgs-image-viewer-active) [data-testid="webpage-citation-pill"] {
  top: 0 !important;
  transform: none !important;
  vertical-align: baseline !important;
}

html:not(.lcgs-image-viewer-active) [data-testid="webpage-citation-pill"] a {
  color: var(--lcgs-text) !important;
  background: color-mix(in srgb, var(--lcgs-accent) 12%, transparent) !important;
  background-color: color-mix(in srgb, var(--lcgs-accent) 12%, transparent) !important;
  background-image: none !important;
  border: 1px solid color-mix(in srgb, var(--lcgs-border) 54%, transparent) !important;
  box-shadow: none !important;
}

html:not(.lcgs-image-viewer-active) [data-testid="webpage-citation-pill"] a :is(span, div) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}

html:not(.lcgs-image-viewer-active) [data-testid="webpage-citation-pill"] a:hover {
  background: color-mix(in srgb, var(--lcgs-accent) 20%, transparent) !important;
  background-color: color-mix(in srgb, var(--lcgs-accent) 20%, transparent) !important;
  border-color: color-mix(in srgb, var(--lcgs-accent) 58%, var(--lcgs-border) 42%) !important;
}

@media (max-width: 760px) {
  #${EXPORT_MODAL_ID} .lcgs-modal-body {
    grid-template-columns: 1fr;
  }

  #${EXPORT_MODAL_ID} .lcgs-modal {
    max-height: calc(100vh - 20px);
    overflow: auto;
  }

  #${EXPORT_MODAL_ID} .lcgs-panel + .lcgs-panel {
    padding-top: 16px;
    border-top: 1px solid color-mix(in srgb, var(--lcgs-border) 54%, transparent);
    border-left: 0;
  }
}
`;
  }

  function upsertStyle(css) {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.documentElement.appendChild(style);
    }
    style.textContent = css;
  }

  function applyBrandMask(settings) {
    const existing = document.getElementById(BRAND_ID);
    existing?.remove();

    const root = document.documentElement;
    const enabled = Boolean(settings.enabled);
    const hasBrandName = enabled && Boolean(settings.brandMask);
    const brandImage = settings.brandImage || safeRuntimeUrl(DEFAULT_BRAND_IMAGE_PATH);
    const hasLogo = enabled && Boolean(brandImage);

    root.classList.toggle("lcgs-custom-logo-active", hasLogo);
    root.classList.toggle("lcgs-custom-brand-active", hasBrandName);

    if (hasLogo) {
      root.style.setProperty("--lcgs-brand-logo-url", `url("${String(brandImage).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`);
    } else {
      root.style.removeProperty("--lcgs-brand-logo-url");
    }

    if (hasBrandName) {
      root.style.setProperty("--lcgs-brand-name", JSON.stringify(settings.brandMask));
    } else {
      root.style.removeProperty("--lcgs-brand-name");
    }
  }

  function updateCustomFavicon(settings) {
    const enabled = Boolean(settings.enabled && settings.brandImage);
    let favicon = document.getElementById(FAVICON_ID);

    if (!enabled) {
      favicon?.remove();
      return;
    }

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.id = FAVICON_ID;
      favicon.rel = "icon";
    }

    favicon.href = settings.brandImage;
    favicon.type = settings.brandImage.startsWith("data:image/svg") ? "image/svg+xml" : "image/png";
    document.head.appendChild(favicon);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeXmlText(value) {
    return Array.from(String(value))
      .filter((character) => {
        const codePoint = character.codePointAt(0);
        return codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d
          || (codePoint >= 0x20 && codePoint <= 0xd7ff)
          || (codePoint >= 0xe000 && codePoint <= 0xfffd)
          || (codePoint >= 0x10000 && codePoint <= 0x10ffff);
      })
      .join("")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function sanitizeFilename(value) {
    const fallback = "chatgpt-export";
    const cleaned = (value || fallback)
      .replace(/^ChatGPT\s*[-\u2013]\s*/i, "")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[. ]+$/g, "");
    const shortened = Array.from(cleaned).slice(0, 80).join("") || fallback;
    return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(shortened) ? `_${shortened}` : shortened;
  }

  function getConversationTitle() {
    const heading = document.querySelector("main h1, #conversation-top-title, header h1");
    const title = heading?.textContent?.trim() || document.title || "ChatGPT conversation";
    return title.replace(/\s+-\s+ChatGPT$/i, "").trim();
  }

  function stripRenderedSpeakerPrefix(value) {
    return String(value)
      .replace(/^\s*(?:You|ChatGPT|Assistant|System)\s+said:\s*/i, "")
      .trim();
  }

  function cleanMessageParts(parts) {
    const cleaned = [...parts];
    const firstText = cleaned.find((part) => part.type === "text");
    if (firstText) {
      firstText.text = stripRenderedSpeakerPrefix(firstText.text);
    }
    return cleaned.filter((part) => part.type !== "text" || part.text);
  }

  function getMessageText(node) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll(`button, svg, style, script, .stylergpt-message-timestamp, .${MESSAGE_NOTE_BUTTON_CLASS}, [aria-hidden='true'], [data-testid='copy-turn-button']`).forEach((item) => item.remove());
    return stripRenderedSpeakerPrefix(clone.innerText.replace(/\n{3,}/g, "\n\n"));
  }

  function getMessageParts(node, options = {}) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll("button:has(.truncate):not([aria-label='Sources'])").forEach((button) => {
      const name = button.querySelector(".truncate")?.textContent?.trim();
      if (name) button.replaceWith(document.createTextNode(`\n[Attachment: ${name}]\n`));
    });
    clone.querySelectorAll("table").forEach((table) => {
      const rows = Array.from(table.rows).map((row) => Array.from(row.cells).map((cell) => cell.textContent.replace(/\s+/g, " ").trim().replace(/\|/g, "\\|")));
      if (!rows.length) return;
      const width = Math.max(...rows.map((row) => row.length));
      const normalized = rows.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")]);
      const markdown = [
        `| ${normalized[0].join(" | ")} |`,
        `| ${Array(width).fill("---").join(" | ")} |`,
        ...normalized.slice(1).map((row) => `| ${row.join(" | ")} |`)
      ].join("\n");
      table.replaceWith(document.createTextNode(`\n${markdown}\n`));
    });
    clone.querySelectorAll("li").forEach((item) => {
      const list = item.parentElement;
      const siblings = list ? Array.from(list.children).filter((child) => child.tagName === "LI") : [];
      const prefix = list?.tagName === "OL" ? `${siblings.indexOf(item) + 1}. ` : "- ";
      item.prepend(document.createTextNode(prefix));
      item.append(document.createTextNode("\n"));
    });
    clone.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
      const level = Number(heading.tagName.slice(1));
      heading.prepend(document.createTextNode(`${"#".repeat(level)} `));
      heading.append(document.createTextNode("\n"));
    });
    clone.querySelectorAll("blockquote").forEach((quote) => {
      quote.textContent = quote.textContent.split("\n").map((line) => `> ${line}`).join("\n");
    });
    clone.querySelectorAll("img[alt]").forEach((image) => {
      const alt = image.getAttribute("alt")?.trim();
      if (alt) image.replaceWith(document.createTextNode(`[Image: ${alt}]`));
    });
    if (options.includeSources) {
      clone.querySelectorAll("a[href^='http']").forEach((link) => {
        const href = link.getAttribute("href");
        const label = link.textContent?.trim();
        if (href && label && label !== href) link.append(document.createTextNode(` (${href})`));
      });
    }
    clone.querySelectorAll(`[data-lcgs-memory-label], button, svg, style, script, .stylergpt-message-timestamp, .${MESSAGE_NOTE_BUTTON_CLASS}, [aria-hidden='true'], [data-testid='copy-turn-button']`).forEach((item) => item.remove());
    if (!options.includeSources) {
      clone.querySelectorAll("[data-testid*='citation' i], [data-testid*='source' i], [class*='citation' i]").forEach((item) => item.remove());
    }
    if (!options.includeThinking) {
      clone.querySelectorAll("[data-testid*='reasoning' i], [data-testid*='thinking' i], [class*='reasoning' i]").forEach((item) => item.remove());
    }

    const codeBlocks = [];
    const markerToken = `LCGS_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    clone.querySelectorAll("pre").forEach((pre) => {
      const marker = `\n\n[[${markerToken}_${codeBlocks.length}]]\n\n`;
      const code = pre.querySelector("code")?.textContent || pre.textContent || "";
      const language = Array.from(pre.querySelector("code")?.classList || [])
        .find((name) => name.startsWith("language-"))
        ?.replace("language-", "") || "";
      codeBlocks.push({ type: "code", language, text: code.trimEnd() });
      pre.replaceWith(document.createTextNode(marker));
    });

    const text = clone.innerText.replace(/\n{3,}/g, "\n\n").trim();
    const parts = [];
    text.split(new RegExp(`\\[\\[${markerToken}_(\\d+)\\]\\]`)).forEach((chunk, index) => {
      if (index % 2 === 1) {
        const block = codeBlocks[Number(chunk)];
        if (block) parts.push(block);
        return;
      }
      const value = chunk.replace(/\n{3,}/g, "\n\n").trim();
      if (value) parts.push({ type: "text", text: value });
    });

    return cleanMessageParts(parts.length ? parts : [{ type: "text", text }]);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function readRenderedMessages(target, seen, options = {}) {
    const roots = [];
    const rootSet = new Set();
    document.querySelectorAll("main#main #thread section[data-turn], main#main #thread [data-message-author-role]").forEach((candidate) => {
      const node = candidate.closest("section[data-turn]") || candidate.closest("[data-message-id]") || candidate;
      if (!rootSet.has(node)) {
        rootSet.add(node);
        roots.push(node);
      }
    });

    roots.forEach((node, index) => {
      const roleNode = node.matches("[data-message-author-role]") ? node : node.querySelector("[data-message-author-role]");
      const role = node.getAttribute("data-turn") || roleNode?.getAttribute("data-message-author-role") || "message";
      if (role !== "user" && role !== "assistant" && role !== "system") return;

      const parts = getMessageParts(node, options);
      const text = parts.map((part) => part.text).join("\n\n").trim();
      if (!text) return;

      const messageId = node.closest("[data-message-id]")?.getAttribute("data-message-id") || roleNode?.closest("[data-message-id]")?.getAttribute("data-message-id") || "";
      const key = messageId || `${role}:${index}`;
      if (seen.has(key)) return;
      seen.add(key);

      target.push({
        index: target.length + 1,
        role,
        text,
        parts,
        messageId: messageId || null,
        exportKey: key,
        noteKey: getMessageNoteKeyFromParts(role, messageId, text),
        sourceIndex: index
      });
    });
  }

  function getStorageValues(keys) {
    return safeStorageGet(keys);
  }

  async function attachExportNotes(conversation) {
    if (!conversation.options.includeNotes) {
      return conversation;
    }

    const keys = [
      notesStorageKey(),
      ...conversation.messages.map((message) => message.noteKey).filter(Boolean)
    ];
    const values = await getStorageValues([...new Set(keys)]);
    const conversationNote = String(values[notesStorageKey()] || "").trim();
    if (conversationNote) {
      conversation.note = conversationNote;
    }
    conversation.messages.forEach((message) => {
      const note = String(values[message.noteKey] || "").trim();
      if (note) message.note = note;
    });
    return conversation;
  }

  async function getCurrentConversation(options = defaultExportOptions("txt")) {
    if (options.scope === "selection") {
      const selectedText = String(window.getSelection()?.toString() || "").trim();
      return {
        title: `${getConversationTitle()} selection`,
        url: location.href,
        exportedAt: new Date().toISOString(),
        options,
        messages: selectedText ? [{
          index: 1,
          role: "message",
          text: selectedText,
          parts: [{ type: "text", text: selectedText }],
          messageId: null,
          noteKey: null,
          sourceIndex: 0
        }] : []
      };
    }

    const seen = new Set();
    const messages = [];

    readRenderedMessages(messages, seen, options);
    if (options.scope === "selected" && Array.isArray(options.selectedMessageKeys)) {
      const selected = new Set(options.selectedMessageKeys);
      messages.splice(0, messages.length, ...messages.filter((message) => selected.has(message.exportKey)));
    }
    messages.forEach((message, index) => {
      message.index = index + 1;
    });

    return {
      title: getConversationTitle(),
      url: location.href,
      exportedAt: new Date().toISOString(),
      options,
      messages
    };
  }

  function conversationToMarkdown(conversation) {
    const lines = [
      ...(conversation.options.includeTitle ? [`# ${conversation.title}`, ""] : []),
      ...(conversation.options.includeLink ? [`[Source](${conversation.url})`, ""] : [])
    ];

    if (conversation.note) {
      lines.push("## Conversation Notes", "", conversation.note, "");
    }

    conversation.messages.forEach((message) => {
      lines.push(`## ${speakerLabel(message.role)}`);
      lines.push("");
      lines.push(messagePartsToMarkdown(message));
      if (message.note) {
        lines.push("", `> Note: ${message.note.replace(/\n/g, "\n> ")}`);
      }
      lines.push("");
    });

    return lines.join("\n");
  }

  function conversationToText(conversation) {
    const lines = [];
    if (conversation.options.includeTitle) {
      lines.push(conversation.title, "");
    }
    if (conversation.options.includeLink) {
      lines.push(conversation.url, "");
    }
    if (conversation.note) {
      lines.push("Conversation Notes:", "", conversation.note, "");
    }
    conversation.messages.forEach((message) => {
      lines.push(`${speakerLabel(message.role)}:`, "", messagePartsToText(message), "");
      if (message.note) {
        lines.push("Note:", message.note, "");
      }
    });
    return lines.join("\n").trimEnd();
  }

  function messagePartsToMarkdown(message) {
    return (message.parts || [{ type: "text", text: message.text }]).map((part) => {
      if (part.type === "code") {
        return `\`\`\`${part.language || ""}\n${part.text}\n\`\`\``;
      }
      return part.text;
    }).join("\n\n");
  }

  function messagePartsToText(message) {
    return (message.parts || [{ type: "text", text: message.text }]).map((part) => {
      if (part.type === "code") {
        return part.text;
      }
      return part.text;
    }).join("\n\n");
  }

  function speakerLabel(role) {
    if (role === "user") return "You";
    if (role === "assistant") return "ChatGPT";
    if (role === "message") return "Selection";
    return "System";
  }

  function conversationToHtml(conversation) {
    const pageMargin = conversation.options.margin === "narrow" ? "12mm" : conversation.options.margin === "wide" ? "25mm" : "18mm";
    const dark = Boolean(conversation.options.darkTheme);
    const body = conversation.messages.map((message) => `
      <section class="message ${message.role}">
        <h2>${escapeHtml(speakerLabel(message.role))}</h2>
        ${messagePartsToHtml(message)}
        ${message.note ? `<pre class="note">Note: ${escapeHtml(message.note)}</pre>` : ""}
      </section>
    `).join("");

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(conversation.printFilename || conversation.title)}</title>
<style>
@page{margin:${pageMargin}}
body{font-family:Arial,sans-serif;font-size:${Number(conversation.options.fontSize) || 14}px;line-height:1.55;color:${dark ? "#f4edf6" : "#1f2933"};background:${dark ? "#17131f" : "#fff"};margin:0}
h1{font-size:24px;margin:0 0 8px}
.meta{color:${dark ? "#c9b2d4" : "#667085"};font-size:12px;margin-bottom:28px}
.message{border-top:1px solid ${dark ? "#57385f" : "#ddd"};padding:18px 0;break-inside:avoid-page}
${conversation.options.addChatBubbles ? `.message{margin:10px 0;padding:16px;border:0;border-radius:8px}.message.user{background:${dark ? "#302038" : "#f1e7f3"}}.message.assistant{background:${dark ? "#23252b" : "#f3f4f6"}}` : ""}
h2{text-transform:capitalize;font-size:14px;margin:0 0 10px;color:#4d1f52}
pre{white-space:pre-wrap;font:13px/1.55 Consolas,monospace;margin:0}
.note{margin-top:12px;border-left:3px solid #8b3a92;padding-left:10px;color:#5c4661}
.code{margin-top:8px;padding:12px;background:${dark ? "#0f0d14" : "#f2f3f5"};border-radius:6px}
</style>
</head>
<body>
${conversation.options.includeTitle ? `<h1>${escapeHtml(conversation.title)}</h1>` : ""}
${conversation.options.includeLink ? `<div class="meta">Exported ${escapeHtml(conversation.exportedAt)} from ${escapeHtml(conversation.url)}</div>` : ""}
${conversation.note ? `<section class="message"><h2>Conversation Notes</h2><pre class="note">${escapeHtml(conversation.note)}</pre></section>` : ""}
${body}
</body>
</html>`;
  }

  function printConversation(conversation, printWindow = null) {
    const html = conversationToHtml(conversation);
    if (printWindow && !printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true });
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 0);
      return;
    }
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none";
    frame.srcdoc = html;
    frame.addEventListener("load", () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => frame.remove(), 60000);
    }, { once: true });
    document.body.appendChild(frame);
  }

  function messagePartsToHtml(message) {
    return (message.parts || [{ type: "text", text: message.text }]).map((part) => {
      if (part.type === "code") {
        return `<pre class="code">${escapeHtml(part.text)}</pre>`;
      }
      return `<pre>${escapeHtml(part.text)}</pre>`;
    }).join("");
  }

  function downloadBlob(filename, mimeType, content) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function crc32(bytes) {
    let crc = -1;
    for (let i = 0; i < bytes.length; i += 1) {
      crc ^= bytes[i];
      for (let j = 0; j < 8; j += 1) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function pushU16(parts, value) {
    parts.push(value & 255, (value >>> 8) & 255);
  }

  function pushU32(parts, value) {
    parts.push(value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255);
  }

  function createZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach((file) => {
      const nameBytes = encoder.encode(file.name);
      const data = encoder.encode(file.content);
      const crc = crc32(data);
      const localHeader = [];

      pushU32(localHeader, 0x04034b50);
      pushU16(localHeader, 20);
      pushU16(localHeader, 0);
      pushU16(localHeader, 0);
      pushU16(localHeader, 0);
      pushU16(localHeader, 0);
      pushU32(localHeader, crc);
      pushU32(localHeader, data.length);
      pushU32(localHeader, data.length);
      pushU16(localHeader, nameBytes.length);
      pushU16(localHeader, 0);

      localParts.push(new Uint8Array(localHeader), nameBytes, data);

      const centralHeader = [];
      pushU32(centralHeader, 0x02014b50);
      pushU16(centralHeader, 20);
      pushU16(centralHeader, 20);
      pushU16(centralHeader, 0);
      pushU16(centralHeader, 0);
      pushU16(centralHeader, 0);
      pushU16(centralHeader, 0);
      pushU32(centralHeader, crc);
      pushU32(centralHeader, data.length);
      pushU32(centralHeader, data.length);
      pushU16(centralHeader, nameBytes.length);
      pushU16(centralHeader, 0);
      pushU16(centralHeader, 0);
      pushU16(centralHeader, 0);
      pushU16(centralHeader, 0);
      pushU32(centralHeader, 0);
      pushU32(centralHeader, offset);
      centralParts.push(new Uint8Array(centralHeader), nameBytes);

      offset += localHeader.length + nameBytes.length + data.length;
    });

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = [];
    pushU32(end, 0x06054b50);
    pushU16(end, 0);
    pushU16(end, 0);
    pushU16(end, files.length);
    pushU16(end, files.length);
    pushU32(end, centralSize);
    pushU32(end, offset);
    pushU16(end, 0);

    return new Blob([...localParts, ...centralParts, new Uint8Array(end)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
  }

  function createDocx(conversation) {
    const paragraphs = [];
    if (conversation.options.includeTitle) paragraphs.push({ text: conversation.title, kind: "title" });
    if (conversation.options.includeLink) {
      paragraphs.push({ text: `Exported ${conversation.exportedAt}`, kind: "meta" });
      paragraphs.push({ text: conversation.url, kind: "meta" });
    }
    if (conversation.note) {
      paragraphs.push({ text: "Conversation Notes:", kind: "speaker" });
      paragraphs.push({ text: conversation.note, kind: "note" });
    }
    if (conversation.options.includeTitle || conversation.options.includeLink) paragraphs.push({ text: "", kind: "text" });
    conversation.messages.forEach((message) => {
      paragraphs.push({ text: `${speakerLabel(message.role)}:`, kind: "speaker", role: message.role });
      (message.parts || [{ type: "text", text: message.text }]).forEach((part) => {
        paragraphs.push({ text: part.text, kind: part.type, role: message.role });
      });
      if (message.note) {
        paragraphs.push({ text: `Note: ${message.note}`, kind: "note", role: message.role });
      }
      paragraphs.push({ text: "", kind: "text" });
    });

    const fontHalfPoints = Math.max(18, Math.min(40, (Number(conversation.options.fontSize) || 14) * 2));
    const pageMargin = conversation.options.margin === "narrow" ? 720 : conversation.options.margin === "wide" ? 1800 : 1080;
    const body = paragraphs.map((paragraph) => {
      const runStyle = [
        `<w:sz w:val="${paragraph.kind === "title" ? fontHalfPoints + 10 : fontHalfPoints}"/>`,
        paragraph.kind === "code" ? "<w:rFonts w:ascii=\"Consolas\" w:hAnsi=\"Consolas\"/><w:color w:val=\"F8F8F2\"/>" : "",
        ["title", "speaker"].includes(paragraph.kind) ? "<w:b/>" : ""
      ].join("");
      const runProps = `<w:rPr>${runStyle}</w:rPr>`;
      const bubbleFill = paragraph.role === "user" ? "E9D7ED" : "F1EDF4";
      const bubbleProps = conversation.options.addChatBubbles && paragraph.role && paragraph.kind !== "code"
        ? `<w:shd w:fill="${bubbleFill}"/><w:spacing w:before="80" w:after="80"/>`
        : "";
      const pProps = paragraph.kind === "code"
        ? "<w:pPr><w:shd w:fill=\"282A36\"/><w:spacing w:before=\"160\" w:after=\"160\"/></w:pPr>"
        : paragraph.kind === "note"
          ? "<w:pPr><w:shd w:fill=\"EFE7F2\"/><w:spacing w:before=\"120\" w:after=\"120\"/></w:pPr>"
          : bubbleProps ? `<w:pPr>${bubbleProps}</w:pPr>` : "";
      const runs = escapeXmlText(paragraph.text).split("\n").map((line) => `<w:r>${runProps}<w:t xml:space="preserve">${line}</w:t></w:r>`).join("<w:r><w:br/></w:r>");
      return `<w:p>${pProps}${runs}</w:p>`;
    }).join("");

    return createZip([
      {
        name: "[Content_Types].xml",
        content: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`
      },
      {
        name: "_rels/.rels",
        content: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
      },
      {
        name: "word/document.xml",
        content: `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="${pageMargin}" w:right="${pageMargin}" w:bottom="${pageMargin}" w:left="${pageMargin}"/></w:sectPr></w:body></w:document>`
      }
    ]);
  }

  function defaultExportOptions(format) {
    return {
      format,
      filename: `${sanitizeFilename(getConversationTitle())}.${format}`,
      scope: "conversation",
      margin: "normal",
      fontSize: 14,
      includeTitle: true,
      includeLink: true,
      includeNotes: false,
      includeSources: true,
      includeThinking: false,
      addChatBubbles: true,
      darkTheme: true
    };
  }

  async function exportConversation(options) {
    const format = options.format;
    const conversation = await getCurrentConversation(options);
    await attachExportNotes(conversation);
    conversation.messages.forEach((message) => {
      delete message.noteKey;
    });
    const filename = sanitizeFilename(options.filename.replace(/\.[^.]+$/, ""));
    if (!conversation.messages.length) {
      alert(options.scope === "selection" ? "No selected text found to export." : "No chat messages found to export.");
      return;
    }

    const artifacts = {
      json: ["application/json;charset=utf-8", JSON.stringify(conversation, null, 2)],
      md: ["text/markdown;charset=utf-8", conversationToMarkdown(conversation)],
      txt: ["text/plain;charset=utf-8", conversationToText(conversation)]
    };
    if (options.copyOnly && artifacts[format]) {
      await copyTextToClipboard(artifacts[format][1]);
    } else if (artifacts[format]) {
      downloadBlob(`${filename}.${format}`, artifacts[format][0], artifacts[format][1]);
    } else if (format === "docx") {
      downloadBlob(`${filename}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", createDocx(conversation));
    } else if (format === "pdf") {
      conversation.printFilename = filename;
      printConversation(conversation, options.printWindow);
    }
  }

  function renderExportTurnPicker(modal) {
    const picker = modal.querySelector("#lcgs-export-turns");
    if (!picker) return;
    const messages = [];
    readRenderedMessages(messages, new Set(), { includeSources: true, includeThinking: true });
    modal.lcgsExportMessages = messages;
    picker.innerHTML = messages.map((message, index) => {
      const preview = message.text.replace(/\s+/g, " ").trim().slice(0, 90) || speakerLabel(message.role);
      return `<label class="lcgs-turn-option"><input type="checkbox" data-turn-index="${index}" checked><span>${escapeHtml(`${index + 1}. ${speakerLabel(message.role)} - ${preview}`)}</span></label>`;
    }).join("") || `<span class="lcgs-muted-line">No rendered turns found.</span>`;
  }

  function updateExportScope(modal) {
    const picker = modal.querySelector("#lcgs-export-turns");
    if (picker) picker.hidden = modal.querySelector("#lcgs-export-scope").value !== "selected";
  }

  function ensureExportModal() {
    if (document.getElementById(EXPORT_MODAL_ID)) return;

    const modal = document.createElement("div");
    modal.id = EXPORT_MODAL_ID;
    modal.hidden = true;
    modal.innerHTML = `
      <div class="lcgs-modal" role="dialog" aria-modal="true" aria-labelledby="lcgs-export-title">
        <header>
          <h2 id="lcgs-export-title">Export options</h2>
          <button type="button" data-modal-close aria-label="Close">x</button>
        </header>
        <div class="lcgs-modal-body">
          <section class="lcgs-panel">
            <h3>Document</h3>
            <label>File name <input id="lcgs-export-filename" type="text"></label>
            <label>Scope <select id="lcgs-export-scope"><option value="conversation">All rendered turns</option><option value="selected">Selected turns</option><option value="selection">Selected text</option></select></label>
            <div id="lcgs-export-turns" class="lcgs-turn-picker" aria-label="Select turns" hidden></div>
            <label data-option="layout">Margins <select id="lcgs-export-margin"><option value="normal">Normal</option><option value="narrow">Narrow</option><option value="wide">Wide</option></select></label>
            <label data-option="layout">Font size <select id="lcgs-export-font-size"><option>12</option><option selected>14</option><option>16</option><option>18</option></select></label>
          </section>
          <section class="lcgs-panel">
            <h3>Content</h3>
            <label class="lcgs-toggle-row">Include title <input id="lcgs-export-include-title" type="checkbox" checked></label>
            <label class="lcgs-toggle-row">Include link <input id="lcgs-export-include-link" type="checkbox" checked></label>
            <label class="lcgs-toggle-row">Include notes <input id="lcgs-export-include-notes" type="checkbox"></label>
            <label class="lcgs-toggle-row">Include visible sources <input id="lcgs-export-include-sources" type="checkbox" checked></label>
            <label class="lcgs-toggle-row">Include visible thinking <input id="lcgs-export-include-thinking" type="checkbox"></label>
            <label class="lcgs-toggle-row" data-option="visual">Add chat bubbles <input id="lcgs-export-chat-bubbles" type="checkbox" checked></label>
            <label class="lcgs-toggle-row" data-option="visual">Enable dark theme <input id="lcgs-export-dark-theme" type="checkbox" checked></label>
          </section>
        </div>
        <footer>
          <span></span>
          <span>
            <button type="button" data-modal-close>Cancel</button>
            <button type="button" id="lcgs-export-copy">Copy</button>
            <button type="button" class="lcgs-primary" id="lcgs-export-confirm">Download</button>
          </span>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll("[data-modal-close]").forEach((button) => {
      button.addEventListener("click", () => {
        modal.hidden = true;
      });
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.hidden = true;
    });

    modal.querySelector("#lcgs-export-scope").addEventListener("change", () => updateExportScope(modal));

    modal.querySelector("#lcgs-export-confirm").addEventListener("click", async () => {
      const options = readExportOptions();
      const printWindow = options.format === "pdf" ? window.open("", "_blank") : null;
      const confirm = modal.querySelector("#lcgs-export-confirm");
      let failed = false;
      confirm.textContent = "Exporting...";
      confirm.disabled = true;
      try {
        await exportConversation({ ...options, printWindow });
        modal.hidden = true;
      } catch (error) {
        failed = true;
        printWindow?.close();
      } finally {
        confirm.textContent = failed ? "Try again" : options.format === "pdf" ? "Print PDF" : `Download ${options.format.toUpperCase()}`;
        confirm.disabled = false;
      }
    });

    modal.querySelector("#lcgs-export-copy").addEventListener("click", async () => {
      const options = { ...readExportOptions(), copyOnly: true };
      const copy = modal.querySelector("#lcgs-export-copy");
      copy.textContent = "Copying...";
      copy.disabled = true;
      try {
        await exportConversation(options);
        copy.textContent = "Copied";
      } catch (error) {
        copy.textContent = "Copy failed";
      } finally {
        copy.disabled = false;
        setTimeout(() => { copy.textContent = "Copy"; }, 1200);
      }
    });
  }

  function openExportModal(format) {
    ensureExportModal();
    const modal = document.getElementById(EXPORT_MODAL_ID);
    const options = defaultExportOptions(format);
    modal.dataset.format = format;
    modal.querySelector("#lcgs-export-title").textContent = `Export options: ${format === "md" ? "Markdown" : format.toUpperCase()}`;
    modal.querySelector("#lcgs-export-filename").value = options.filename;
    modal.querySelector("#lcgs-export-scope").value = options.scope;
    modal.querySelector("#lcgs-export-margin").value = options.margin;
    modal.querySelector("#lcgs-export-font-size").value = String(options.fontSize);
    modal.querySelector("#lcgs-export-include-title").checked = options.includeTitle;
    modal.querySelector("#lcgs-export-include-link").checked = options.includeLink;
    modal.querySelector("#lcgs-export-include-notes").checked = options.includeNotes;
    modal.querySelector("#lcgs-export-include-sources").checked = options.includeSources;
    modal.querySelector("#lcgs-export-include-thinking").checked = options.includeThinking;
    modal.querySelector("#lcgs-export-chat-bubbles").checked = options.addChatBubbles;
    modal.querySelector("#lcgs-export-dark-theme").checked = options.darkTheme;
    modal.querySelector("#lcgs-export-confirm").textContent = format === "pdf" ? "Print PDF" : `Download ${format === "md" ? "Markdown" : format.toUpperCase()}`;
    modal.querySelector("#lcgs-export-copy").hidden = !["md", "txt", "json"].includes(format);
    updateExportOptionAvailability(modal, format);
    renderExportTurnPicker(modal);
    updateExportScope(modal);
    modal.hidden = false;
    modal.querySelector("#lcgs-export-filename").focus();
  }

  function updateExportOptionAvailability(modal, format) {
    const supportsLayout = format === "pdf" || format === "docx";
    const supportsVisual = format === "pdf" || format === "docx";
    const rules = {
      layout: supportsLayout,
      visual: supportsVisual
    };

    modal.querySelectorAll("[data-option]").forEach((row) => {
      const enabled = rules[row.dataset.option] ?? true;
      row.classList.toggle("lcgs-disabled", !enabled);
      row.querySelectorAll("input, select").forEach((field) => {
        field.disabled = !enabled;
      });
    });
  }

  function readExportOptions() {
    const modal = document.getElementById(EXPORT_MODAL_ID);
    return {
      format: modal.dataset.format || "txt",
      filename: modal.querySelector("#lcgs-export-filename").value,
      scope: modal.querySelector("#lcgs-export-scope").value,
      margin: modal.querySelector("#lcgs-export-margin").value,
      fontSize: Number(modal.querySelector("#lcgs-export-font-size").value),
      includeTitle: modal.querySelector("#lcgs-export-include-title").checked,
      includeLink: modal.querySelector("#lcgs-export-include-link").checked,
      includeNotes: modal.querySelector("#lcgs-export-include-notes").checked,
      includeSources: modal.querySelector("#lcgs-export-include-sources").checked,
      includeThinking: modal.querySelector("#lcgs-export-include-thinking").checked,
      addChatBubbles: modal.querySelector("#lcgs-export-chat-bubbles").checked,
      darkTheme: modal.querySelector("#lcgs-export-dark-theme").checked,
      selectedMessageKeys: Array.from(modal.querySelectorAll("#lcgs-export-turns input:checked"))
        .map((input) => modal.lcgsExportMessages?.[Number(input.dataset.turnIndex)])
        .filter(Boolean)
        .map((message) => message.exportKey)
    };
  }

  function ensureExporter() {
    if (document.getElementById(EXPORT_ID)) return;

    const root = document.createElement("div");
    root.id = EXPORT_ID;
    root.innerHTML = `
      <button type="button" class="lcgs-export-trigger" aria-haspopup="true" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
        <span>Download</span>
      </button>
      <div class="lcgs-export-menu" role="menu">
        <button type="button" data-format="pdf"><span class="lcgs-export-ext">PDF</span><span>PDF</span></button>
        <button type="button" data-format="docx"><span class="lcgs-export-ext">DOC</span><span>DOCX</span></button>
        <button type="button" data-format="md"><span class="lcgs-export-ext">MD</span><span>Markdown</span></button>
        <button type="button" data-format="txt"><span class="lcgs-export-ext">TXT</span><span>TXT</span></button>
        <button type="button" data-format="json"><span class="lcgs-export-ext">JSON</span><span>JSON</span></button>
      </div>
    `;
    document.body.appendChild(root);

    const trigger = root.querySelector(".lcgs-export-trigger");
    trigger.addEventListener("click", () => {
      const open = root.dataset.open !== "true";
      root.dataset.open = String(open);
      trigger.setAttribute("aria-expanded", String(open));
    });

    root.querySelectorAll("[data-format]").forEach((button) => {
      button.addEventListener("click", () => {
        root.dataset.open = "false";
        trigger.setAttribute("aria-expanded", "false");
        openExportModal(button.dataset.format);
      });
    });

    document.addEventListener("click", (event) => {
      if (!root.contains(event.target)) {
        root.dataset.open = "false";
        trigger.setAttribute("aria-expanded", "false");
      }
    });

    updateExporterVisibility();
  }

  function getHeaderActionAnchor() {
    const regions = Array.from(document.querySelectorAll("#page-header, #calpico-page-header"));
    for (const region of regions) {
      const buttons = Array.from(region.querySelectorAll("button, a[role='button'], [role='button']"));
      const anchor = buttons.find((button) => {
        if (button.closest(`#${EXPORT_ID}, [role='dialog']`)) return false;
        const ariaLabel = button.getAttribute("aria-label")?.trim() || "";
        const testId = button.getAttribute("data-testid")?.trim() || "";
        const text = button.textContent?.replace(/\s+/g, " ").trim() || "";
        return /^share$/i.test(ariaLabel) || /^share$/i.test(text) || testId === "share-chat-button";
      });
      if (anchor?.parentElement) return anchor;
    }
    return null;
  }

  function mountExporterInHeader(root) {
    const anchor = getHeaderActionAnchor();
    if (!anchor?.parentElement) return false;
    if (root.parentElement !== anchor.parentElement || root.nextElementSibling !== anchor) {
      anchor.parentElement.insertBefore(root, anchor);
    }
    return true;
  }

  function hasExportableConversation() {
    return Boolean(document.querySelector("main#main #thread section[data-turn], main#main #thread [data-message-author-role]"));
  }

  function updateExporterVisibility() {
    const root = document.getElementById(EXPORT_ID);
    if (!root) return;
    const enabled = document.documentElement.dataset.localChatgptStyler === "on";
    const zenMode = document.documentElement.classList.contains("lcgs-zen-mode-active");
    const hasConversation = hasExportableConversation();
    const mounted = hasConversation && mountExporterInHeader(root);
    root.hidden = !enabled || zenMode || !hasConversation || !mounted;
    if (!enabled || zenMode || !hasConversation || !mounted) {
      root.dataset.open = "false";
      root.querySelector(".lcgs-export-trigger")?.setAttribute("aria-expanded", "false");
      const navigatorRoot = document.getElementById(NAVIGATOR_ID);
      if (navigatorRoot) {
        navigatorRoot.hidden = true;
        navigatorRoot.dataset.open = "false";
        navigatorRoot.querySelector(".lcgs-tool-trigger")?.setAttribute("aria-expanded", "false");
      }
      const promptRoot = document.getElementById(PROMPT_TOOLS_ID);
      if (promptRoot) {
        promptRoot.hidden = true;
        promptRoot.dataset.open = "false";
        promptRoot.querySelector(".lcgs-tool-trigger")?.setAttribute("aria-expanded", "false");
      }
    }
    if (!enabled || zenMode) {
      const modal = document.getElementById(EXPORT_MODAL_ID);
      if (modal) modal.hidden = true;
    }
  }

  let promptToolkitInstalled = false;
  let promptHistoryCache = null;
  let promptHistoryIndex = -1;
  let promptHistoryDraft = "";
  let promptHistoryApplying = false;
  let navigatorItems = [];
  let dynamicPageModesScheduled = false;

  function getComposer() {
    return document.querySelector("main form #prompt-textarea")
      || document.querySelector("main form textarea[name='prompt-textarea']")
      || document.querySelector("main [data-testid='composer-root'] [contenteditable='true']")
      || document.querySelector("main form [contenteditable='true'][role='textbox']")
      || document.querySelector("main form .ProseMirror");
  }

  function isComposerTarget(target) {
    const composer = getComposer();
    return Boolean(composer && target && (target === composer || composer.contains(target)));
  }

  function getComposerText(composer = getComposer()) {
    if (!composer) return "";
    if ("value" in composer) return composer.value || "";
    return (composer.innerText || composer.textContent || "").replace(/\n{3,}/g, "\n\n");
  }

  function dispatchComposerInput(composer) {
    composer.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: null
    }));
  }

  function replaceComposerText(text, composer = getComposer()) {
    if (!composer) return;
    composer.focus();
    if ("value" in composer) {
      composer.value = text;
      composer.selectionStart = text.length;
      composer.selectionEnd = text.length;
      dispatchComposerInput(composer);
      return;
    }

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(composer);
    selection.removeAllRanges();
    selection.addRange(range);
    if (!document.execCommand("insertText", false, text)) {
      composer.textContent = text;
    }
    dispatchComposerInput(composer);
  }

  function insertComposerText(text, composer = getComposer()) {
    if (!composer) return;
    composer.focus();
    if ("value" in composer) {
      const start = composer.selectionStart ?? composer.value.length;
      const end = composer.selectionEnd ?? composer.value.length;
      composer.setRangeText(text, start, end, "end");
      dispatchComposerInput(composer);
      return;
    }

    if (!document.execCommand("insertText", false, text)) {
      replaceComposerText(`${getComposerText(composer)}${text}`, composer);
    } else {
      dispatchComposerInput(composer);
    }
  }

  function normalizePromptSnippets(value) {
    const list = Array.isArray(value) ? value : defaultPromptSnippets;
    return list
      .map((snippet) => ({
        id: String(snippet.id || hashString(`${snippet.command || ""}:${snippet.text || ""}`)),
        name: String(snippet.name || snippet.command || "Snippet").slice(0, 48),
        command: String(snippet.command || snippet.name || "snippet").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32) || "snippet",
        text: String(snippet.text || "").trim()
      }))
      .filter((snippet) => snippet.text)
      .slice(0, 80);
  }

  async function loadPromptSnippets() {
    const result = await getStorageValues([PROMPT_SNIPPETS_STORAGE_KEY]);
    return normalizePromptSnippets(result[PROMPT_SNIPPETS_STORAGE_KEY]);
  }

  function savePromptSnippets(snippets) {
    safeStorageSet({ [PROMPT_SNIPPETS_STORAGE_KEY]: normalizePromptSnippets(snippets) }, () => {
      renderSnippetList();
      renderSlashPalette();
    });
  }

  function normalizePromptHistory(value) {
    return (Array.isArray(value) ? value : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 50);
  }

  async function loadPromptHistory() {
    const result = await getStorageValues([PROMPT_HISTORY_STORAGE_KEY]);
    promptHistoryCache = normalizePromptHistory(result[PROMPT_HISTORY_STORAGE_KEY]);
    return promptHistoryCache;
  }

  function savePromptHistoryList(history) {
    const next = normalizePromptHistory(history).slice(0, activeSettings.promptHistoryMax);
    promptHistoryCache = next;
    safeStorageSet({ [PROMPT_HISTORY_STORAGE_KEY]: next }, () => {
      updatePromptHistoryCount();
      renderPromptHistoryList();
    });
  }

  function savePromptHistory(text) {
    if (!activeSettings.enabled || activeSettings.advancedSafeMode || !activeSettings.promptHistory) return;
    const clean = String(text || "").trim();
    if (clean.length < 2 || /^\/[a-z0-9-]{1,32}$/i.test(clean)) return;
    getStorageValues([PROMPT_HISTORY_STORAGE_KEY]).then((result) => {
      const current = normalizePromptHistory(result[PROMPT_HISTORY_STORAGE_KEY]);
      const next = [clean, ...current.filter((item) => item !== clean)].slice(0, activeSettings.promptHistoryMax);
      savePromptHistoryList(next);
    });
  }

  function saveCurrentPrompt() {
    savePromptHistory(getComposerText());
  }

  async function cyclePromptHistory(direction, composer) {
    if (!activeSettings.enabled || activeSettings.advancedSafeMode || !activeSettings.promptHistory) return;
    const history = promptHistoryCache || await loadPromptHistory();
    if (!history.length) return;
    if (promptHistoryIndex === -1) promptHistoryDraft = getComposerText(composer);
    promptHistoryIndex = direction < 0
      ? Math.min(promptHistoryIndex + 1, history.length - 1)
      : Math.max(promptHistoryIndex - 1, -1);
    promptHistoryApplying = true;
    replaceComposerText(promptHistoryIndex === -1 ? promptHistoryDraft : history[promptHistoryIndex], composer);
    promptHistoryApplying = false;
  }

  function ensureSlashPalette() {
    let palette = document.getElementById(SLASH_PALETTE_ID);
    if (palette) return palette;
    palette = document.createElement("section");
    palette.id = SLASH_PALETTE_ID;
    palette.hidden = true;
    document.body.appendChild(palette);
    return palette;
  }

  async function renderSlashPalette(filter = null) {
    const palette = ensureSlashPalette();
    if (filter === null && palette.hidden) return;
    const query = String(filter ?? palette.dataset.filter ?? "").toLowerCase();
    palette.dataset.filter = query;
    const snippets = (await loadPromptSnippets())
      .filter((snippet) => !query || snippet.command.includes(query) || snippet.name.toLowerCase().includes(query))
      .slice(0, 8);
    palette.innerHTML = snippets.length
      ? snippets.map((snippet) => `
          <button type="button" class="lcgs-slash-row" data-snippet-id="${escapeHtml(snippet.id)}">
            <span class="lcgs-slash-command">/${escapeHtml(snippet.command)}</span>
            <span class="lcgs-slash-main">
              <span class="lcgs-slash-name">${escapeHtml(snippet.name)}</span>
              <span class="lcgs-slash-text">${escapeHtml(snippet.text)}</span>
            </span>
          </button>
        `).join("")
      : `<div class="lcgs-muted-line">No snippets match /${escapeHtml(query)}</div>`;
    palette.querySelectorAll("[data-snippet-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const list = await loadPromptSnippets();
        const snippet = list.find((item) => item.id === button.dataset.snippetId);
        if (snippet) {
          replaceComposerText(snippet.text);
          hideSlashPalette();
        }
      });
    });
    palette.hidden = false;
    palette.dataset.open = "true";
  }

  function hideSlashPalette() {
    const palette = document.getElementById(SLASH_PALETTE_ID);
    if (!palette) return;
    palette.hidden = true;
    palette.dataset.open = "false";
  }

  async function renderSnippetList() {
    const root = document.getElementById(PROMPT_TOOLS_ID);
    const list = root?.querySelector(".lcgs-snippet-list");
    if (!list) return;
    const snippets = await loadPromptSnippets();
    list.innerHTML = snippets.length
      ? snippets.map((snippet) => `
          <div class="lcgs-snippet-row" data-snippet-id="${escapeHtml(snippet.id)}">
            <span class="lcgs-snippet-main">
              <span class="lcgs-snippet-name">${escapeHtml(snippet.name)} <span class="lcgs-muted-line">/${escapeHtml(snippet.command)}</span></span>
              <span class="lcgs-snippet-text">${escapeHtml(snippet.text)}</span>
            </span>
            <span class="lcgs-snippet-actions">
              <button type="button" data-snippet-insert>Insert</button>
              <button type="button" data-snippet-delete>Delete</button>
            </span>
          </div>
        `).join("")
      : `<div class="lcgs-muted-line">No snippets saved.</div>`;
    list.querySelectorAll("[data-snippet-id]").forEach((row) => {
      row.querySelector("[data-snippet-insert]")?.addEventListener("click", () => {
        const snippet = snippets.find((item) => item.id === row.dataset.snippetId);
        if (snippet) insertComposerText(snippet.text);
      });
      row.querySelector("[data-snippet-delete]")?.addEventListener("click", () => {
        savePromptSnippets(snippets.filter((snippet) => snippet.id !== row.dataset.snippetId));
      });
    });
  }

  async function updatePromptHistoryCount() {
    const root = document.getElementById(PROMPT_TOOLS_ID);
    const count = root?.querySelector("[data-history-count]");
    if (!count) return;
    if (activeSettings.advancedSafeMode || !activeSettings.promptHistory) {
      if (count.textContent !== "off") count.textContent = "off";
      return;
    }
    const history = promptHistoryCache || await loadPromptHistory();
    const label = `${history.length} saved`;
    if (count.textContent !== label) count.textContent = label;
  }

  async function renderPromptHistoryList() {
    const root = document.getElementById(PROMPT_TOOLS_ID);
    const list = root?.querySelector(".lcgs-history-list");
    if (!list) return;
    if (activeSettings.advancedSafeMode || !activeSettings.promptHistory) {
      list.innerHTML = `<div class="lcgs-muted-line">Prompt history is off.</div>`;
      return;
    }
    const query = String(root.querySelector("[data-history-search]")?.value || "").toLowerCase().trim();
    const history = await loadPromptHistory();
    const filtered = history.filter((item) => !query || item.toLowerCase().includes(query)).slice(0, 12);
    list.innerHTML = filtered.length
      ? filtered.map((item, index) => `
          <div class="lcgs-history-row" data-history-index="${index}">
            <span class="lcgs-snippet-main">
              <span class="lcgs-snippet-name">History ${index + 1}</span>
              <span class="lcgs-snippet-text">${escapeHtml(item)}</span>
            </span>
            <button type="button" data-history-insert>Insert</button>
          </div>
        `).join("")
      : `<div class="lcgs-muted-line">No matching prompt history.</div>`;
    list.querySelectorAll("[data-history-index]").forEach((row) => {
      const item = filtered[Number(row.dataset.historyIndex)];
      row.querySelector("[data-history-insert]")?.addEventListener("click", () => {
        if (item) replaceComposerText(item);
      });
    });
  }

  function ensurePromptToolkit() {
    let root = document.getElementById(PROMPT_TOOLS_ID);
    if (root) return root;

    root = document.createElement("section");
    root.id = PROMPT_TOOLS_ID;
    root.hidden = true;
    root.dataset.open = "false";
    root.innerHTML = `
      <button type="button" class="lcgs-tool-trigger" aria-haspopup="true" aria-expanded="false">Prompt</button>
      <div class="lcgs-tool-panel" role="dialog" aria-label="Prompt tools">
        <header>
          <span class="lcgs-tool-title">Prompt snippets</span>
          <button type="button" class="lcgs-panel-close" aria-label="Close prompt tools">Close</button>
        </header>
        <div class="lcgs-snippet-form">
          <div class="lcgs-snippet-grid">
            <input data-snippet-name placeholder="Name">
            <input data-snippet-command placeholder="Slash command">
          </div>
          <textarea data-snippet-text placeholder="Snippet text"></textarea>
          <button type="button" class="lcgs-primary-action" data-snippet-save>Save snippet</button>
        </div>
        <div class="lcgs-prompt-history-tools">
          <span class="lcgs-muted-line">Prompt history: Ctrl/Cmd + Up/Down in the composer</span>
          <span class="lcgs-muted-line" data-history-count>0 saved</span>
          <input class="lcgs-history-search" data-history-search placeholder="Search prompt history">
        </div>
        <div class="lcgs-history-list"></div>
        <div class="lcgs-snippet-list"></div>
      </div>
    `;
    const exportRoot = document.getElementById(EXPORT_ID);
    if (exportRoot) {
      exportRoot.insertBefore(root, exportRoot.firstElementChild);
    } else {
      document.body.appendChild(root);
    }

    const trigger = root.querySelector(".lcgs-tool-trigger");
    const setOpen = (open) => {
      root.dataset.open = String(open);
      trigger.setAttribute("aria-expanded", String(open));
      if (open) {
        renderSnippetList();
        renderPromptHistoryList();
        updatePromptHistoryCount();
      }
    };
    trigger.addEventListener("click", () => setOpen(root.dataset.open !== "true"));
    root.querySelector(".lcgs-panel-close").addEventListener("click", () => setOpen(false));
    root.querySelector("[data-history-search]").addEventListener("input", renderPromptHistoryList);
    root.querySelector("[data-snippet-save]").addEventListener("click", async () => {
      const name = root.querySelector("[data-snippet-name]");
      const command = root.querySelector("[data-snippet-command]");
      const text = root.querySelector("[data-snippet-text]");
      const body = text.value.trim();
      if (!body) return;
      const snippets = await loadPromptSnippets();
      const item = {
        id: hashString(`${Date.now()}:${body}`),
        name: name.value.trim() || command.value.trim() || "Snippet",
        command: command.value.trim() || name.value.trim() || "snippet",
        text: body
      };
      savePromptSnippets([item, ...snippets]);
      name.value = "";
      command.value = "";
      text.value = "";
    });

    document.addEventListener("click", (event) => {
      if (!root.contains(event.target) && root.dataset.open === "true") setOpen(false);
    });
    renderSnippetList();
    updatePromptHistoryCount();
    return root;
  }

  function updatePromptToolkitVisibility() {
    const enabled = document.documentElement.dataset.localChatgptStyler === "on";
    const zenMode = document.documentElement.classList.contains("lcgs-zen-mode-active");
    if (!enabled || zenMode || activeSettings.advancedSafeMode || !activeSettings.promptTools) {
      const root = document.getElementById(PROMPT_TOOLS_ID);
      if (root) {
        root.hidden = true;
        root.dataset.open = "false";
        root.querySelector(".lcgs-tool-trigger")?.setAttribute("aria-expanded", "false");
      }
      hideSlashPalette();
      return;
    }

    const root = ensurePromptToolkit();
    const exportRoot = document.getElementById(EXPORT_ID);
    if (exportRoot && root.parentElement !== exportRoot) {
      exportRoot.insertBefore(root, exportRoot.firstElementChild);
    }
    ensureSlashPalette();
    root.hidden = !enabled || zenMode || !activeSettings.promptTools || !getComposer();
    if (root.hidden) {
      root.dataset.open = "false";
      root.querySelector(".lcgs-tool-trigger")?.setAttribute("aria-expanded", "false");
      hideSlashPalette();
    }
    if (!activeSettings.promptSlashPalette) hideSlashPalette();
    updatePromptHistoryCount();
  }

  function installPromptToolkit() {
    if (promptToolkitInstalled) return;
    promptToolkitInstalled = true;
    document.addEventListener("submit", (event) => {
      if (event.target?.contains?.(getComposer())) saveCurrentPrompt();
    }, true);
    document.addEventListener("click", (event) => {
      if (event.target?.closest?.("button[data-testid='send-button'], button[aria-label*='Send' i]")) {
        saveCurrentPrompt();
      }
    }, true);
    document.addEventListener("keydown", (event) => {
      if (!isComposerTarget(event.target)) return;
      const composer = getComposer();
      if ((event.ctrlKey || event.metaKey) && !event.altKey && ["ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        cyclePromptHistory(event.key === "ArrowUp" ? -1 : 1, composer);
        return;
      }
      if (event.key === "Enter" && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey && !event.isComposing) {
        savePromptHistory(getComposerText(composer));
      }
      if (event.key === "Escape") hideSlashPalette();
    }, true);
    document.addEventListener("input", (event) => {
      if (!isComposerTarget(event.target)) return;
      if (!promptHistoryApplying) {
        promptHistoryIndex = -1;
        promptHistoryDraft = "";
      }
      const text = getComposerText().trim();
      const match = text.match(/^\/([a-z0-9-]{0,32})$/i);
      if (match && activeSettings.enabled && !activeSettings.advancedSafeMode && activeSettings.promptTools && activeSettings.promptSlashPalette) {
        renderSlashPalette(match[1]);
      } else {
        hideSlashPalette();
      }
    }, true);
  }

  function getNavigatorTargets() {
    return Array.from(document.querySelectorAll("main#main #thread section[data-turn], main#main #thread [data-message-author-role]"))
      .filter((node) => {
        if (node.closest(`#${NOTES_ID}, #${PROMPT_TOOLS_ID}, #${NAVIGATOR_ID}`)) return false;
        if (node.matches("[data-message-author-role]") && node.closest("section[data-turn]")) return false;
        const roleNode = node.matches("[data-message-author-role]") ? node : node.querySelector("[data-message-author-role]");
        const role = node.getAttribute("data-turn") || roleNode?.getAttribute("data-message-author-role") || "";
        return role === "user" || role === "assistant" || role === "system";
      })
      .slice(0, activeSettings.navigatorLimit);
  }

  function getNavigatorPreview(node) {
    const markdown = node.querySelector(".markdown, [class*='markdown'], [class*='prose']");
    return String((markdown || node).textContent || "")
      .replace(/\s+/g, " ")
      .replace(/\b(?:Copy|Edit|Note|More actions|Sources)\b/g, "")
      .trim()
      .slice(0, 220);
  }

  function uniqueNavigatorMatches(node, selectors, closestSelector) {
    const matches = new Set();
    selectors.forEach((selector) => {
      let elements = [];
      try {
        elements = Array.from(node.querySelectorAll(selector));
      } catch (error) {
        return;
      }
      elements.forEach((element) => {
        let match = element;
        if (closestSelector) {
          try {
            match = element.closest(closestSelector) || element;
          } catch (error) {
            match = element;
          }
        }
        if (match && node.contains(match)) matches.add(match);
      });
    });
    return Array.from(matches);
  }

  function navigatorPlural(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function addNavigatorScope(labels, scopes, counts, scope, count, singular, plural) {
    counts[scope] = count;
    if (!count) return;
    scopes.push(scope);
    labels.push(navigatorPlural(count, singular, plural));
  }

  function getNavigatorItems() {
    return getNavigatorTargets().map((node, index) => {
      const roleNode = node.matches("[data-message-author-role]") ? node : node.querySelector("[data-message-author-role]");
      const role = node.getAttribute("data-turn") || roleNode?.getAttribute("data-message-author-role") || "message";
      const text = getNavigatorPreview(node);
      const labels = [];
      const scopes = [];
      const counts = { note: 0, code: 0, sources: 0, files: 0 };
      const codeCount = uniqueNavigatorMatches(node, [
        "pre",
        "pre code",
        "code[class*='language-']",
        "[id='code-block-viewer']",
        ".cm-content",
        "[class*='code-block' i]",
        "[data-testid*='code' i]"
      ], "pre, [id='code-block-viewer'], [class*='code-block' i], [data-testid*='code' i]").length;
      const sourceCount = uniqueNavigatorMatches(node, [
        "[data-testid='webpage-citation-pill']",
        "[data-testid*='citation' i]",
        "[data-testid*='source' i]",
        "button[aria-label='Sources']",
        "button[aria-label*='source' i]",
        "a[href^='http']:not([href*='/files/']):not([href*='file-'])"
      ], "[data-testid='webpage-citation-pill'], [data-testid*='citation' i], [data-testid*='source' i], button[aria-label], a[href]").length;
      const fileCount = uniqueNavigatorMatches(node, [
        "[data-testid*='attachment' i]",
        "[data-testid*='file' i]",
        "[aria-label*='attachment' i]",
        "[aria-label*='file' i]",
        "[aria-label*='upload' i]",
        "a[href*='/files/']",
        "a[href*='file-']",
        "button:has(.truncate):has(svg):not([aria-label='Sources'])",
        "button:has(p.truncate):has(svg):not([aria-label='Sources'])",
        "button:has(.not-prose.truncate):not([aria-label='Sources'])",
        "a:has(.truncate)",
        "img[src*='/files/'], img[src*='file-']",
        "video[src], audio[src]"
      ], "button, a, [data-testid*='attachment' i], [data-testid*='file' i], [aria-label*='attachment' i], [aria-label*='file' i], img, video, audio").length;
      const hasNote = Boolean(node.querySelector(`.${MESSAGE_NOTE_BUTTON_CLASS}[data-has-note="true"]`));
      if (hasNote) {
        counts.note = 1;
        scopes.push("note");
        labels.push("note");
      }
      addNavigatorScope(labels, scopes, counts, "code", codeCount, "code block", "code blocks");
      addNavigatorScope(labels, scopes, counts, "sources", sourceCount, "source");
      addNavigatorScope(labels, scopes, counts, "files", fileCount, "file");
      return {
        id: `${role}-${index}`,
        node,
        role,
        index: index + 1,
        text: text || role,
        labels,
        scopes,
        counts
      };
    });
  }

  function scrollNavigatorNodeIntoView(node) {
    node.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
    const rect = node.getBoundingClientRect();
    return rect.bottom > 64 && rect.top < window.innerHeight - 64;
  }

  function focusNavigatorItem(item) {
    if (!item?.node?.isConnected) return false;
    const visible = scrollNavigatorNodeIntoView(item.node);
    item.node.style.setProperty("outline", `2px solid ${activeSettings.accentColor || "#8fb3c7"}`, "important");
    item.node.style.setProperty("outline-offset", "6px", "important");
    item.node.dataset.lcgsNavigatorFocused = String(Date.now());
    item.node.dataset.lcgsNavigatorVisible = String(visible);
    setTimeout(() => {
      item.node.style.removeProperty("outline");
      item.node.style.removeProperty("outline-offset");
    }, 1400);
    return true;
  }

  function navigatorOutlineText(items) {
    const title = getConversationTitle();
    const lines = [`${title} outline`, location.href, ""];
    items.forEach((item) => {
      const label = `${item.role} ${item.index}${item.labels.length ? ` [${item.labels.join(", ")}]` : ""}`;
      lines.push(`- ${label}: ${item.text}`);
    });
    return lines.join("\n").trim();
  }

  async function copyTextToClipboard(text) {
    let clipboardError = null;
    if (navigator.clipboard?.writeText) {
      try {
        await Promise.race([
          navigator.clipboard.writeText(text),
          sleep(400).then(() => {
            throw new Error("Clipboard write timed out.");
          })
        ]);
        return;
      } catch (error) {
        clipboardError = error;
      }
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw clipboardError || new Error("Clipboard copy failed.");
  }

  function renderNavigatorPanel() {
    const root = document.getElementById(NAVIGATOR_ID);
    const list = root?.querySelector(".lcgs-nav-list");
    if (!list) return;
    navigatorItems = getNavigatorItems();
    const query = String(root.querySelector("[data-nav-filter]")?.value || "").toLowerCase().trim();
    const scope = root.dataset.scope || "all";
    const filtered = navigatorItems.filter((item) => {
      const haystack = `${item.role} ${item.text} ${item.labels.join(" ")} ${item.scopes.join(" ")}`.toLowerCase();
      const scopeMatch = scope === "all" || item.scopes.includes(scope);
      return scopeMatch && (!query || haystack.includes(query));
    });
    root.lcgsNavigatorFiltered = filtered;
    root.querySelectorAll("[data-nav-scope]").forEach((button) => {
      button.setAttribute("aria-pressed", String((button.dataset.navScope || "all") === scope));
    });
    const stats = root.querySelector(".lcgs-nav-stats");
    if (stats) {
      const totals = navigatorItems.reduce((sum, item) => {
        sum.note += item.counts.note || 0;
        sum.code += item.counts.code || 0;
        sum.sources += item.counts.sources || 0;
        sum.files += item.counts.files || 0;
        return sum;
      }, { note: 0, code: 0, sources: 0, files: 0 });
      stats.innerHTML = `
        <span class="lcgs-nav-tag">${navigatorItems.length} turns</span>
        <span class="lcgs-nav-tag">${navigatorPlural(totals.note, "note")}</span>
        <span class="lcgs-nav-tag">${navigatorPlural(totals.code, "code block", "code blocks")}</span>
        <span class="lcgs-nav-tag">${navigatorPlural(totals.sources, "source")}</span>
        <span class="lcgs-nav-tag">${navigatorPlural(totals.files, "file")}</span>
      `;
    }
    list.innerHTML = filtered.length
      ? filtered.map((item, index) => `
          <button type="button" class="lcgs-nav-row" data-nav-index="${index}">
            <span class="lcgs-nav-index">${escapeHtml(item.role.slice(0, 1).toUpperCase())}${item.index}</span>
            <span class="lcgs-nav-main">
              <span class="lcgs-nav-label">${escapeHtml(item.role)}${item.labels.length ? ` - ${escapeHtml(item.labels.join(" - "))}` : ""}</span>
              <span class="lcgs-nav-text">${escapeHtml(item.text)}</span>
            </span>
          </button>
        `).join("")
      : `<div class="lcgs-muted-line">No matching turns.</div>`;
    list.querySelectorAll("[data-nav-index]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const items = root.lcgsNavigatorFiltered || [];
        const item = items[Number(button.dataset.navIndex)];
        if (focusNavigatorItem(item)) {
          root.dataset.lastFocusedIndex = String(item.index);
          root.dataset.open = "false";
          root.querySelector(".lcgs-tool-trigger")?.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  function ensureNavigator() {
    let root = document.getElementById(NAVIGATOR_ID);
    if (root) return root;
    root = document.createElement("section");
    root.id = NAVIGATOR_ID;
    root.hidden = true;
    root.dataset.open = "false";
    root.dataset.scope = "all";
    root.innerHTML = `
      <button type="button" class="lcgs-tool-trigger" aria-haspopup="true" aria-expanded="false">Nav</button>
      <div class="lcgs-tool-panel" role="dialog" aria-label="Conversation navigator">
        <header>
          <span class="lcgs-tool-title">Message navigator</span>
          <button type="button" class="lcgs-panel-close" aria-label="Close navigator">Close</button>
        </header>
        <div class="lcgs-nav-tools">
          <input data-nav-filter placeholder="Filter turns, notes, code, sources, files">
          <div class="lcgs-nav-scopes" aria-label="Navigator scope">
            <button type="button" class="lcgs-nav-scope" data-nav-scope="all" aria-pressed="true">All</button>
            <button type="button" class="lcgs-nav-scope" data-nav-scope="note" aria-pressed="false">Notes</button>
            <button type="button" class="lcgs-nav-scope" data-nav-scope="code" aria-pressed="false">Code</button>
            <button type="button" class="lcgs-nav-scope" data-nav-scope="sources" aria-pressed="false">Sources</button>
            <button type="button" class="lcgs-nav-scope" data-nav-scope="files" aria-pressed="false">Files</button>
          </div>
          <div class="lcgs-nav-actions">
            <button type="button" class="lcgs-nav-copy" data-nav-copy>Copy outline</button>
          </div>
          <div class="lcgs-nav-stats"></div>
        </div>
        <div class="lcgs-nav-list"></div>
      </div>
    `;
    (document.getElementById(EXPORT_ID) || document.body).appendChild(root);
    const trigger = root.querySelector(".lcgs-tool-trigger");
    const setOpen = (open) => {
      root.dataset.open = String(open);
      trigger.setAttribute("aria-expanded", String(open));
      if (open) renderNavigatorPanel();
    };
    trigger.addEventListener("click", () => setOpen(root.dataset.open !== "true"));
    root.querySelector(".lcgs-panel-close").addEventListener("click", () => setOpen(false));
    root.querySelector("[data-nav-filter]").addEventListener("input", renderNavigatorPanel);
    root.querySelectorAll("[data-nav-scope]").forEach((button) => {
      button.addEventListener("click", () => {
        root.dataset.scope = button.dataset.navScope || "all";
        renderNavigatorPanel();
      });
    });
    root.querySelector("[data-nav-copy]").addEventListener("click", async () => {
      const button = root.querySelector("[data-nav-copy]");
      const items = root.lcgsNavigatorFiltered || navigatorItems;
      const outline = navigatorOutlineText(items);
      root.lcgsLastOutlineText = outline;
      root.dataset.lastOutlineLength = String(outline.length);
      root.dataset.lastOutlinePreview = outline.slice(0, 240);
      try {
        await copyTextToClipboard(outline);
        button.textContent = "Copied";
      } catch (error) {
        button.textContent = "Copy failed";
      }
      setTimeout(() => {
        button.textContent = "Copy outline";
      }, 1200);
    });
    document.addEventListener("click", (event) => {
      if (!root.contains(event.target) && root.dataset.open === "true") setOpen(false);
    });
    return root;
  }

  function updateNavigatorVisibility() {
    const enabled = document.documentElement.dataset.localChatgptStyler === "on";
    const zenMode = document.documentElement.classList.contains("lcgs-zen-mode-active");
    const exporterRoot = document.getElementById(EXPORT_ID);
    const exporterVisible = Boolean(exporterRoot && !exporterRoot.hidden && hasExportableConversation());
    if (!enabled || zenMode || !exporterVisible || activeSettings.advancedSafeMode || !activeSettings.messageNavigator) {
      const root = document.getElementById(NAVIGATOR_ID);
      if (root) {
        root.hidden = true;
        root.dataset.open = "false";
        root.querySelector(".lcgs-tool-trigger")?.setAttribute("aria-expanded", "false");
      }
      return;
    }

    const root = ensureNavigator();
    if (root.parentElement !== exporterRoot && exporterRoot) {
      exporterRoot.appendChild(root);
    }
    root.hidden = !enabled || zenMode || !activeSettings.messageNavigator || !exporterVisible;
    if (root.hidden) {
      root.dataset.open = "false";
      root.querySelector(".lcgs-tool-trigger")?.setAttribute("aria-expanded", "false");
      return;
    }
  }

  function notesStorageKey() {
    return `${NOTES_STORAGE_PREFIX}${location.origin}${location.pathname}`;
  }

  function hashString(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
    }
    return Math.abs(hash).toString(36);
  }

  function getMessageNoteKey(node) {
    const roleNode = node.matches("[data-message-author-role]") ? node : node.querySelector("[data-message-author-role]");
    const role = node.getAttribute("data-turn") || roleNode?.getAttribute("data-message-author-role") || "message";
    const messageId = node.closest("[data-message-id]")?.getAttribute("data-message-id")
      || roleNode?.closest("[data-message-id]")?.getAttribute("data-message-id")
      || "";
    return getMessageNoteKeyFromParts(role, messageId, getMessageText(node));
  }

  function getMessageNoteKeyFromParts(role, messageId, text) {
    const source = messageId || String(text || "").slice(0, 700);
    return `${notesStorageKey()}:message:${role || "message"}:${hashString(source)}`;
  }

  function loadNote(panel, key, title, placeholder, mode) {
    panel.lcgsSaveNote?.();
    panel.dataset.notesKey = key;
    panel.dataset.notesMode = mode;
    panel.querySelector(".lcgs-notes-title").textContent = title;
    const textarea = panel.querySelector("textarea");
    textarea.placeholder = placeholder;
    safeStorageGet(key).then((result) => {
      if (panel.dataset.notesKey !== key) return;
      textarea.value = result[key] || "";
    });
  }

  function ensureNotesPanel() {
    let panel = document.getElementById(NOTES_ID);
    if (panel) return panel;

    panel = document.createElement("section");
    panel.id = NOTES_ID;
    panel.hidden = true;
    panel.dataset.collapsed = "true";
    panel.innerHTML = `
      <header>
        <span class="lcgs-notes-title">Conversation notes</span>
        <span class="lcgs-notes-actions">
          <button type="button" data-notes-conversation>Chat</button>
          <button type="button" data-notes-clear>Clear</button>
          <button type="button" data-notes-toggle aria-label="Expand notes">Show</button>
        </span>
      </header>
      <div class="lcgs-notes-body">
        <textarea spellcheck="true" placeholder="Notes for this conversation"></textarea>
      </div>
    `;
    document.body.appendChild(panel);

    const toggleButton = panel.querySelector("[data-notes-toggle]");
    const setCollapsed = (collapsed) => {
      panel.dataset.collapsed = String(collapsed);
      toggleButton.textContent = collapsed ? "Show" : "Hide";
      toggleButton.setAttribute("aria-label", collapsed ? "Expand notes" : "Collapse notes");
    };
    panel.lcgsSetCollapsed = setCollapsed;
    toggleButton.addEventListener("click", () => {
      setCollapsed(panel.dataset.collapsed !== "true");
    });

    const textarea = panel.querySelector("textarea");
    let saveTimer = 0;
    panel.lcgsSaveNote = () => {
      const key = panel.dataset.notesKey || notesStorageKey();
      clearTimeout(saveTimer);
      safeStorageSet({ [key]: textarea.value }, updateMessageNoteStates);
    };
    textarea.addEventListener("input", () => {
      const key = panel.dataset.notesKey || notesStorageKey();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        safeStorageSet({ [key]: textarea.value }, updateMessageNoteStates);
      }, 250);
    });

    panel.querySelector("[data-notes-conversation]").addEventListener("click", () => {
      loadNote(panel, notesStorageKey(), "Conversation notes", "Notes for this conversation", "conversation");
      panel.lcgsSetCollapsed?.(false);
    });

    panel.querySelector("[data-notes-clear]").addEventListener("click", () => {
      const key = panel.dataset.notesKey || notesStorageKey();
      clearTimeout(saveTimer);
      textarea.value = "";
      safeStorageRemove(key, updateMessageNoteStates);
    });

    return panel;
  }

  function openMessageNote(node) {
    const panel = ensureNotesPanel();
    panel.hidden = false;
    panel.lcgsSetCollapsed?.(false);
    loadNote(panel, getMessageNoteKey(node), "Message note", "Notes for this message", "message");
    panel.querySelector("textarea").focus();
  }

  function getMessageNoteTargets() {
    return Array.from(document.querySelectorAll("main#main #thread section[data-turn], main#main #thread [data-message-author-role]"))
      .filter((node) => {
        if (node.closest(`#${NOTES_ID}`)) return false;
        if (node.matches("[data-message-author-role]") && node.closest("section[data-turn]")) return false;
        const roleNode = node.matches("[data-message-author-role]") ? node : node.querySelector("[data-message-author-role]");
        const role = node.getAttribute("data-turn") || roleNode?.getAttribute("data-message-author-role") || "";
        return role === "user" || role === "assistant" || role === "system";
      });
  }

  function updateMessageNoteButtons(enabled) {
    if (!enabled) {
      document.querySelectorAll(`.${MESSAGE_NOTE_BUTTON_CLASS}`).forEach((button) => button.remove());
      return;
    }

    let added = false;
    getMessageNoteTargets().forEach((node) => {
      if (node.querySelector(`:scope > .${MESSAGE_NOTE_BUTTON_CLASS}`)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = MESSAGE_NOTE_BUTTON_CLASS;
      button.dataset.noteKey = getMessageNoteKey(node);
      button.textContent = "Note";
      button.setAttribute("aria-label", "Open message note");
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openMessageNote(node);
      });
      node.appendChild(button);
      added = true;
    });
    if (added) updateMessageNoteStates();
  }

  function updateMessageNoteStates() {
    const buttons = Array.from(document.querySelectorAll(`.${MESSAGE_NOTE_BUTTON_CLASS}`));
    const keys = [...new Set(buttons.map((button) => button.dataset.noteKey).filter(Boolean))];
    if (!keys.length) return;
    safeStorageGet(keys).then((result) => {
      buttons.forEach((button) => {
        const note = String(result[button.dataset.noteKey] || "").trim();
        button.dataset.hasNote = note ? "true" : "false";
      });
    });
  }

  function updateNotesPanel(settings) {
    const enabled = Boolean(settings.enabled && settings.localNotes && !settings.advancedSafeMode && hasExportableConversation());
    if (!enabled) {
      const panel = document.getElementById(NOTES_ID);
      if (panel) panel.hidden = true;
      updateMessageNoteButtons(false);
      return;
    }

    const panel = ensureNotesPanel();
    panel.hidden = false;
    updateMessageNoteButtons(enabled);

    const key = notesStorageKey();
    if (panel.dataset.conversationKey !== key) {
      panel.dataset.conversationKey = key;
      loadNote(panel, key, "Conversation notes", "Notes for this conversation", "conversation");
      panel.lcgsSetCollapsed?.(true);
      return;
    }
    if (!panel.dataset.notesKey) {
      loadNote(panel, key, "Conversation notes", "Notes for this conversation", "conversation");
    }
  }

  function updatePageModeClasses(settings) {
    const root = document.documentElement;
    const enabled = Boolean(settings.enabled);
    root.classList.toggle("lcgs-zen-mode-active", enabled && Boolean(settings.zenMode));
    root.classList.remove("lcgs-reading-mode-active", "lcgs-print-mode-active");
    root.classList.toggle("lcgs-compact-sidebar-active", enabled && Boolean(settings.compactSidebar));
    root.classList.toggle("lcgs-local-notes-active", enabled && Boolean(settings.localNotes) && !settings.advancedSafeMode);
    updateRouteClasses();
  }

  function updateRouteClasses() {
    const root = document.documentElement;
    root.classList.toggle("lcgs-view-library", location.pathname.startsWith("/library"));
    root.classList.toggle("lcgs-view-scheduled", location.pathname.startsWith("/scheduled"));
    root.classList.toggle("lcgs-view-plugins", location.pathname.startsWith("/plugins"));
    root.classList.toggle("lcgs-view-project", /^\/g\/g-p-[^/]+\/project\/?$/.test(location.pathname));
    const workRadio = Array.from(document.querySelectorAll('[role="radio"], input[type="radio"]'))
      .find((radio) => /\bwork\b/i.test(`${radio.getAttribute("aria-label") || ""} ${radio.textContent || ""}`));
    const workSelected = Boolean(workRadio && (workRadio.getAttribute("aria-checked") === "true" || workRadio.checked));
    root.classList.toggle("lcgs-view-work", workSelected);
  }

  function updateImageViewerMode() {
    document.querySelectorAll("[data-lcgs-image-viewer]").forEach((node) => node.removeAttribute("data-lcgs-image-viewer"));
    const zoomButton = Array.from(document.querySelectorAll("button[aria-label]"))
      .find((button) => /^Zoom level\b/i.test(button.getAttribute("aria-label") || ""));
    const viewer = zoomButton?.closest('[role="dialog"]');
    const hasImage = Boolean(viewer?.querySelector("img, canvas"));
    const hasTools = Boolean(viewer && Array.from(viewer.querySelectorAll("button"))
      .some((button) => /^(Comment|Remove BG|Erase|Resize)$/i.test(button.textContent?.trim() || button.getAttribute("aria-label") || "")));
    const active = Boolean(viewer && hasImage && hasTools);
    if (active) viewer.setAttribute("data-lcgs-image-viewer", "true");
    document.documentElement.classList.toggle("lcgs-image-viewer-active", active);
  }

  function updateTableWrappers() {
    if (document.documentElement.dataset.localChatgptStyler !== "on") {
      document.querySelectorAll(".lcgs-table-scroll").forEach((wrapper) => {
        const table = wrapper.querySelector(":scope > table");
        if (table) wrapper.replaceWith(table);
      });
      return;
    }

    document.querySelectorAll(".markdown table, [class*='markdown'] table").forEach((table) => {
      let wrapper = table.closest(".lcgs-table-scroll");
      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "lcgs-table-scroll";
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }

      const firstRow = table.querySelector("tr");
      const columnCount = firstRow ? firstRow.querySelectorAll(":scope > th, :scope > td").length : 0;
      const cells = Array.from(table.querySelectorAll("th, td"));
      const averageCellLength = cells.length
        ? cells.reduce((sum, cell) => sum + (cell.textContent || "").trim().length, 0) / cells.length
        : 0;
      wrapper.dataset.tableDensity = columnCount >= 8 || (columnCount >= 6 && averageCellLength > 36) ? "dense" : "fit";
    });
  }

  function setImportantStyle(element, property, value) {
    element?.style?.setProperty(property, value, "important");
  }

  function clearMemoryUpdateMarkers() {
    document.querySelectorAll("[data-lcgs-memory-update], [data-lcgs-memory-label], [data-lcgs-memory-body]").forEach((node) => {
      delete node.dataset.lcgsMemoryUpdate;
      delete node.dataset.lcgsMemoryLabel;
      delete node.dataset.lcgsMemoryBody;
    });
  }

  function getMemoryUpdateLabelWrap(label) {
    let wrap = label;
    let node = label.parentElement;
    for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement) {
      const text = node.textContent?.replace(/\s+/g, " ").trim();
      const rect = node.getBoundingClientRect?.();
      if (text !== "Memory updated" || (rect && rect.width > 180)) {
        break;
      }
      wrap = node;
    }
    return wrap;
  }

  function updateMemoryUpdateBlocks() {
    if (document.documentElement.dataset.localChatgptStyler !== "on") {
      clearMemoryUpdateMarkers();
      return;
    }

    clearMemoryUpdateMarkers();

    const labels = Array.from(document.querySelectorAll("main#main :is(div, span)"))
      .filter((node) => node.childElementCount <= 4 && node.textContent?.replace(/\s+/g, " ").trim() === "Memory updated");

    labels.forEach((label) => {
      const labelWrap = getMemoryUpdateLabelWrap(label.closest("div, span") || label);

      labelWrap.dataset.lcgsMemoryLabel = "true";
    });
  }

  const reasoningDisclosureLabels = /^(Analyzed|Analysis|Reasoned|Reasoning|Thought|Thinking|Searched|Searching|Browsed|Browsing)\b/i;
  const trustedReasoningActivation = new WeakMap();
  const userOpenedReasoningDisclosures = new WeakSet();
  const queuedReasoningDisclosureButtons = new Set();
  let reasoningDisclosureQueueScheduled = false;
  let reasoningDisclosureScrollScanTimer = null;

  function isReasoningDisclosureGuardEnabled() {
    return document.documentElement.dataset.localChatgptStyler === "on"
      && Boolean(activeSettings.reasoningGuard)
      && !activeSettings.advancedSafeMode;
  }

  function getReasoningDisclosureButton(target) {
    const button = target?.closest?.("button");
    const assistantTurn = button?.closest?.("section[data-turn='assistant'], [data-message-author-role='assistant']");
    if (!button || !assistantTurn || !document.querySelector("main#main")?.contains(button)) {
      return null;
    }

    const label = (button.querySelector("span.text-start")?.textContent || button.textContent || "").trim();
    const hasDisclosureState = button.hasAttribute("aria-expanded") || button.hasAttribute("data-state") || button.hasAttribute("aria-controls");
    if (!reasoningDisclosureLabels.test(label) || !button.querySelector("svg") || !hasDisclosureState) {
      return null;
    }

    return button;
  }

  function getReasoningDisclosureRoot(button) {
    return button.closest("span.block.relative")
      || button.closest("span.block");
  }

  function isExpandedReasoningPanel(panel, button) {
    if (!panel || panel.contains(button)) {
      return false;
    }

    if (panel.dataset?.lcgsReasoningAutoHidden === "true") {
      return true;
    }

    const style = window.getComputedStyle(panel);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }

    const text = (panel.textContent || "").trim();
    return text.length > 24 || Boolean(panel.querySelector("p, pre, code, ol, ul, table"));
  }

  function isAssistantAnswerBoundary(element) {
    if (!element) {
      return false;
    }

    const className = String(element.className || "");
    if (element.matches?.("[data-message-author-role='assistant'], [data-message-id], section[data-turn]")) {
      return true;
    }

    if (element.matches?.(".markdown, [class*='markdown'], [class*='prose']")) {
      return !className.includes("text-token-text-secondary") && !className.includes("text-token-text-tertiary");
    }

    const markdown = element.querySelector?.(".markdown, [class*='markdown'], [class*='prose']");
    if (markdown) {
      const markdownClass = String(markdown.className || "");
      return !markdownClass.includes("text-token-text-secondary") && !markdownClass.includes("text-token-text-tertiary");
    }

    return false;
  }

  function addReasoningDisclosureSiblings(start, panelCandidates, seenPanels) {
    let sibling = start?.nextElementSibling;
    while (sibling) {
      if (isAssistantAnswerBoundary(sibling)) {
        break;
      }

      if (!seenPanels.has(sibling)) {
        panelCandidates.push(sibling);
        seenPanels.add(sibling);
      }
      sibling = sibling.nextElementSibling;
    }
  }

  function getReasoningDisclosurePanels(button) {
    const root = getReasoningDisclosureRoot(button);
    if (!root) {
      return [];
    }

    const shell = button.closest(".group") || button.parentElement;
    const panelCandidates = [];
    const seenPanels = new Set();

    Array.from(root.children).forEach((child) => {
      if (child !== shell && !child.contains(button)) {
        panelCandidates.push(child);
        seenPanels.add(child);
      }
    });

    let scanRoot = root;
    while (scanRoot && !scanRoot.matches?.("[data-message-id], section[data-turn], [data-message-author-role='assistant']")) {
      addReasoningDisclosureSiblings(scanRoot, panelCandidates, seenPanels);
      scanRoot = scanRoot.parentElement;
    }

    return panelCandidates.filter((panel) => isExpandedReasoningPanel(panel, button));
  }

  function isReasoningDisclosureOpen(button) {
    if (getReasoningDisclosurePanels(button).length > 0) return true;
    const ariaExpanded = button.getAttribute("aria-expanded");
    if (ariaExpanded === "true") return true;
    if (button.dataset.state === "open" || button.getAttribute("data-state") === "open") return true;
    if (ariaExpanded === "false" || button.dataset.state === "closed" || button.getAttribute("data-state") === "closed") return false;
    return false;
  }

  function setReasoningDisclosurePanelsHidden(button, hidden) {
    getReasoningDisclosurePanels(button).forEach((panel) => {
      if (hidden) {
        if (!Object.prototype.hasOwnProperty.call(panel.dataset, "lcgsReasoningOriginalDisplay")) {
          panel.dataset.lcgsReasoningOriginalDisplay = panel.style.display || "";
        }
        panel.dataset.lcgsReasoningAutoHidden = "true";
        panel.setAttribute("aria-hidden", "true");
        setImportantStyle(panel, "display", "none");
        button.dataset.lcgsReasoningAutoCollapsed = "true";
      } else if (panel.dataset.lcgsReasoningAutoHidden === "true") {
        delete panel.dataset.lcgsReasoningAutoHidden;
        panel.removeAttribute("aria-hidden");
        const originalDisplay = panel.dataset.lcgsReasoningOriginalDisplay || "";
        if (originalDisplay) panel.style.display = originalDisplay;
        else panel.style.removeProperty("display");
        delete panel.dataset.lcgsReasoningOriginalDisplay;
      }
    });
    if (hidden) {
      button.setAttribute("aria-expanded", "false");
    } else if (button.dataset.lcgsReasoningAutoCollapsed === "true") {
      delete button.dataset.lcgsReasoningAutoCollapsed;
      button.removeAttribute("aria-expanded");
    }
  }

  function restoreReasoningDisclosurePanels() {
    queuedReasoningDisclosureButtons.clear();
    if (reasoningDisclosureScrollScanTimer) {
      clearTimeout(reasoningDisclosureScrollScanTimer);
      reasoningDisclosureScrollScanTimer = null;
    }
    document.querySelectorAll("[data-lcgs-reasoning-auto-hidden]").forEach((panel) => {
      delete panel.dataset.lcgsReasoningAutoHidden;
      panel.removeAttribute("aria-hidden");
      const originalDisplay = panel.dataset.lcgsReasoningOriginalDisplay || "";
      if (originalDisplay) panel.style.display = originalDisplay;
      else panel.style.removeProperty("display");
      delete panel.dataset.lcgsReasoningOriginalDisplay;
    });
    document.querySelectorAll("[data-lcgs-reasoning-auto-collapsed]").forEach((button) => {
      delete button.dataset.lcgsReasoningAutoCollapsed;
      button.removeAttribute("aria-expanded");
    });
  }

  function markTrustedReasoningActivation(event) {
    if (!isReasoningDisclosureGuardEnabled()) {
      return;
    }

    const button = getReasoningDisclosureButton(event.target);
    if (!button || event.isTrusted === false) {
      return;
    }

    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) {
      return;
    }

    delete button.dataset.lcgsReasoningAutoCollapsed;
    userOpenedReasoningDisclosures.add(button);
    setReasoningDisclosurePanelsHidden(button, false);
    trustedReasoningActivation.set(button, Date.now() + 1500);
  }

  function collapseUntrustedReasoningDisclosure(button) {
    if (!isReasoningDisclosureGuardEnabled()) {
      restoreReasoningDisclosurePanels();
      return;
    }

    if (!button?.isConnected || !getReasoningDisclosureButton(button)) {
      return;
    }

    if (!isReasoningDisclosureOpen(button)) {
      userOpenedReasoningDisclosures.delete(button);
      return;
    }

    const trustedUntil = trustedReasoningActivation.get(button) || 0;
    if (Date.now() <= trustedUntil || userOpenedReasoningDisclosures.has(button)) {
      userOpenedReasoningDisclosures.add(button);
      return;
    }

    setReasoningDisclosurePanelsHidden(button, true);
  }

  function processQueuedReasoningDisclosures() {
    reasoningDisclosureQueueScheduled = false;
    if (!isReasoningDisclosureGuardEnabled()) {
      restoreReasoningDisclosurePanels();
      return;
    }

    let processed = 0;
    queuedReasoningDisclosureButtons.forEach((button) => {
      if (processed >= 24) {
        return;
      }

      queuedReasoningDisclosureButtons.delete(button);
      collapseUntrustedReasoningDisclosure(button);
      processed += 1;
    });

    if (queuedReasoningDisclosureButtons.size) {
      scheduleReasoningDisclosureCollapse();
    }
  }

  function scheduleReasoningDisclosureCollapse(button) {
    if (!isReasoningDisclosureGuardEnabled()) {
      restoreReasoningDisclosurePanels();
      return;
    }

    if (button) {
      queuedReasoningDisclosureButtons.add(button);
    }

    if (reasoningDisclosureQueueScheduled) {
      return;
    }

    reasoningDisclosureQueueScheduled = true;
    requestAnimationFrame(processQueuedReasoningDisclosures);
  }

  function queueReasoningDisclosureScan(root) {
    if (!isReasoningDisclosureGuardEnabled()) {
      return;
    }

    if (!root?.querySelectorAll && root?.nodeType !== Node.ELEMENT_NODE && root !== document) {
      return;
    }

    const scope = root === document ? document : root;
    const directButton = getReasoningDisclosureButton(scope);
    if (directButton) {
      scheduleReasoningDisclosureCollapse(directButton);
    }

    scope.querySelectorAll?.("button span.text-start").forEach((label) => {
      const button = getReasoningDisclosureButton(label);
      if (button) {
        scheduleReasoningDisclosureCollapse(button);
      }
    });

    const message = scope.closest?.("[data-message-id], section[data-turn]");
    message?.querySelectorAll?.("button span.text-start").forEach((label) => {
      const button = getReasoningDisclosureButton(label);
      if (button) {
        scheduleReasoningDisclosureCollapse(button);
      }
    });
  }

  function scheduleReasoningDisclosureScrollScan() {
    if (!isReasoningDisclosureGuardEnabled() || reasoningDisclosureScrollScanTimer) {
      return;
    }

    reasoningDisclosureScrollScanTimer = setTimeout(() => {
      reasoningDisclosureScrollScanTimer = null;
      queueReasoningDisclosureScan(document.querySelector("main#main") || document);
    }, 250);
  }

  function installReasoningDisclosureGuard() {
    document.addEventListener("pointerdown", markTrustedReasoningActivation, true);
    document.addEventListener("keydown", markTrustedReasoningActivation, true);
    document.addEventListener("click", (event) => {
      if (!isReasoningDisclosureGuardEnabled()) {
        return;
      }

      const button = getReasoningDisclosureButton(event.target);
      if (!button) {
        return;
      }

      if (event.isTrusted === false) {
        event.preventDefault();
        event.stopImmediatePropagation();
        scheduleReasoningDisclosureCollapse(button);
      }
    }, true);

    queueReasoningDisclosureScan(document);
    document.addEventListener("scroll", scheduleReasoningDisclosureScrollScan, { passive: true, capture: true });
  }

  function clearInlineCitationStyles(element) {
    [
      "top",
      "transform",
      "vertical-align",
      "color",
      "background",
      "background-color",
      "background-image",
      "border",
      "border-color",
      "box-shadow"
    ].forEach((property) => element?.style?.removeProperty(property));
  }

  function updateInlineCitationPills() {
    document.querySelectorAll('[data-testid="webpage-citation-pill"]').forEach((pill) => {
      const anchors = pill.querySelectorAll("a");
      const innerSurfaces = pill.querySelectorAll("a :is(span, div)");

      if (document.documentElement.dataset.localChatgptStyler !== "on") {
        clearInlineCitationStyles(pill);
        anchors.forEach(clearInlineCitationStyles);
        innerSurfaces.forEach(clearInlineCitationStyles);
        return;
      }

      setImportantStyle(pill, "top", "0");
      setImportantStyle(pill, "transform", "none");
      setImportantStyle(pill, "vertical-align", "baseline");

      anchors.forEach((anchor) => {
        setImportantStyle(anchor, "color", "var(--lcgs-text)");
        setImportantStyle(anchor, "background", "color-mix(in srgb, var(--lcgs-accent) 12%, transparent)");
        setImportantStyle(anchor, "background-color", "color-mix(in srgb, var(--lcgs-accent) 12%, transparent)");
        setImportantStyle(anchor, "background-image", "none");
        setImportantStyle(anchor, "border", "1px solid color-mix(in srgb, var(--lcgs-border) 54%, transparent)");
        setImportantStyle(anchor, "box-shadow", "none");
      });

      innerSurfaces.forEach((surface) => {
        setImportantStyle(surface, "background", "transparent");
        setImportantStyle(surface, "background-color", "transparent");
        setImportantStyle(surface, "background-image", "none");
      });
    });
  }

  function updateUserMessageBubbles() {
    const outlineColor = "color-mix(in srgb, var(--lcgs-border) 62%, var(--lcgs-accent) 38%)";
    const userMediaRadius = "var(--lcgs-radius) var(--lcgs-radius) 0 var(--lcgs-radius)";

    document.querySelectorAll(".user-message-bubble-color").forEach((bubble) => {
      if (document.documentElement.dataset.localChatgptStyler !== "on") {
        [
          "background",
          "color",
          "border",
          "outline",
          "outline-offset",
          "box-shadow",
          "border-radius"
        ].forEach((property) => bubble.style.removeProperty(property));
        return;
      }

      const message = bubble.closest('[data-message-author-role="user"], [data-message-id]');
      const hasMedia = Boolean(message?.querySelector("img, picture, canvas, video, [data-testid*='attachment'], [class*='attachment'], [class*='message-image']"));
      setImportantStyle(bubble, "background", "var(--lcgs-user-bg)");
      setImportantStyle(bubble, "color", "var(--lcgs-user-text)");
      setImportantStyle(bubble, "border", `1px solid ${outlineColor}`);
      setImportantStyle(bubble, "outline", `1px solid ${outlineColor}`);
      setImportantStyle(bubble, "outline-offset", "-1px");
      setImportantStyle(bubble, "box-shadow", `0 0 0 1px ${outlineColor} inset`);
      if (hasMedia) {
        setImportantStyle(bubble, "border-radius", "var(--lcgs-radius) 0 0 var(--lcgs-radius)");
      } else {
        setImportantStyle(bubble, "border-radius", userMediaRadius);
      }
    });

    document.querySelectorAll('[data-message-author-role="user"] [class*="message-image"]').forEach((imageGroup) => {
      const openButton = imageGroup.querySelector('[aria-label^="Open image"]');
      const image = imageGroup.querySelector("img");
      const clipWrapper = imageGroup.closest("div.overflow-hidden");
      const targets = [clipWrapper, imageGroup, openButton, image].filter(Boolean);

      targets.forEach((media) => {
        if (document.documentElement.dataset.localChatgptStyler !== "on") {
          media.style.removeProperty("border-radius");
          media.style.removeProperty("box-shadow");
          return;
        }

        setImportantStyle(media, "border-radius", userMediaRadius);
        if (media === clipWrapper) {
          setImportantStyle(media, "box-shadow", `0 0 0 1px ${outlineColor} inset`);
        } else {
          media.style.removeProperty("box-shadow");
        }
      });
    });
  }

  function updateMessageActionControls() {
    const selector = [
      "button[data-testid='copy-turn-action-button']",
      "button[data-testid='project-save-turn-action-button']",
      "button[data-testid*='thumb' i]",
      "button[data-testid*='regenerate' i]",
      "button[data-testid*='retry' i]",
      "button[aria-label='Copy response']",
      "button[aria-label='Copy message']",
      "button[aria-label='Edit message']",
      "button[aria-label='Add to project sources']",
      "button[aria-label='Switch model']",
      "button[aria-label='More actions']",
      "button[aria-label*='read aloud' i]",
      "button[aria-label*='regenerate' i]",
      "button[aria-label*='retry' i]",
      "button[aria-label*='good response' i]",
      "button[aria-label*='bad response' i]"
    ].join(",");
    const controls = new Set(document.querySelectorAll(`main section[data-turn] :is(${selector}), main [data-message-id] :is(${selector})`));

    document.querySelectorAll(`main [${ACTION_CONTROL_ATTRIBUTE}]`).forEach((control) => {
      if (!controls.has(control)) control.removeAttribute(ACTION_CONTROL_ATTRIBUTE);
    });
    controls.forEach((control) => {
      if (control.getAttribute(ACTION_CONTROL_ATTRIBUTE) !== "icon") {
        control.setAttribute(ACTION_CONTROL_ATTRIBUTE, "icon");
      }
    });
  }

  function updateChatDisclaimer() {
    const expected = "ChatGPT can make mistakes. Check important info.";
    const matches = Array.from(document.querySelectorAll("main#main div"))
      .filter((node) => node.textContent?.trim() === expected)
      .filter((node) => !Array.from(node.children).some((child) => child.textContent?.trim() === expected));
    document.querySelectorAll("[data-lcgs-disclaimer]").forEach((node) => {
      if (!matches.includes(node)) node.removeAttribute("data-lcgs-disclaimer");
    });
    matches.forEach((node) => node.setAttribute("data-lcgs-disclaimer", "true"));
  }

  function updateSplashHeading() {
    const matches = hasExportableConversation()
      ? []
      : Array.from(document.querySelectorAll("main#main h1"))
        .filter((heading) => /^(?:How can I help|Where should we begin)\b/i.test(heading.textContent?.trim() || ""));
    document.querySelectorAll("[data-lcgs-splash-heading]").forEach((heading) => {
      if (!matches.includes(heading)) heading.removeAttribute("data-lcgs-splash-heading");
    });
    matches.forEach((heading) => heading.setAttribute("data-lcgs-splash-heading", "true"));
  }

  function updateDynamicPageModes() {
    dynamicPageModesScheduled = false;
    updateRouteClasses();
    updateSidebarSectionLabels();
    updateSidebarProfileStatus();
    updateMemoryUpdateBlocks();
    updateImageViewerMode();
    updateTableWrappers();
    updateInlineCitationPills();
    updateUserMessageBubbles();
    updateMessageActionControls();
    updateChatDisclaimer();
    updateSplashHeading();
    updateCustomFavicon(activeSettings);
    updateNotesPanel(activeSettings);
    updatePromptToolkitVisibility();
    updateNavigatorVisibility();
  }

  function updateSidebarSectionLabels() {
    const labels = Array.from(document.querySelectorAll("nav[aria-label='Chat history'] .__menu-label[data-no-spacing]"));
    labels.forEach((label, index) => {
      label.dataset.lcgsSidebarLabel = index === 0 ? "folders" : "loose-files";
    });
  }

  function updateSidebarProfileStatus() {
    document.querySelectorAll("[data-lcgs-profile-status]").forEach((node) => {
      delete node.dataset.lcgsProfileStatus;
    });
    const statuses = Array.from(document.querySelectorAll("#stage-slideover-sidebar span, nav span, aside span"))
      .filter((node) => node.textContent?.trim() === "Pro");
    statuses.forEach((node) => {
      const row = node.closest("button, a, [role='button']");
      if (row?.querySelector("img, [alt], [class*='avatar' i]")) {
        node.dataset.lcgsProfileStatus = "true";
      }
    });
  }

  function scheduleDynamicPageModes() {
    if (dynamicPageModesScheduled) return;
    dynamicPageModesScheduled = true;
    setTimeout(updateDynamicPageModes, 120);
  }

  function handlePageMutations(mutations) {
    if (isReasoningDisclosureGuardEnabled()) {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => queueReasoningDisclosureScan(node));
      });
    } else {
      restoreReasoningDisclosurePanels();
    }
    scheduleDynamicPageModes();
  }

  function apply(settings) {
    const merged = mergeSettings(settings);
    activeSettings = merged;
    document.documentElement.dataset.localChatgptStyler = merged.enabled ? "on" : "off";
    if (merged.enabled) {
      document.documentElement.dataset.stylergptColorStyle = "colorful";
      document.documentElement.dataset.stylergptBackgroundType = merged.backgroundMode === "image" ? "image" : merged.backgroundMode;
      queueReasoningDisclosureScan(document);
    } else {
      delete document.documentElement.dataset.stylergptColorStyle;
      delete document.documentElement.dataset.stylergptBackgroundType;
      restoreReasoningDisclosurePanels();
    }
    upsertStyle(buildCss(merged));
    applyBrandMask(merged);
    updateCustomFavicon(merged);
    ensureDefaultBackground(merged);
    updatePageModeClasses(merged);
    updateNotesPanel(merged);
    updateExporterVisibility();
    updateDynamicPageModes();
  }

  safeStorageGet(STORAGE_KEY).then((result) => apply(result[STORAGE_KEY]));
  installReasoningDisclosureGuard();
  installPromptToolkit();
  ensureExporter();
  updateDynamicPageModes();
  new MutationObserver(handlePageMutations).observe(document.body, { childList: true, subtree: true });

  safeAddStorageChangeListener((changes, areaName) => {
    if (areaName === "local" && changes[STORAGE_KEY]) {
      apply(changes[STORAGE_KEY].newValue);
    } else if (areaName === "local" && Object.keys(changes).some((key) => key.startsWith(NOTES_STORAGE_PREFIX))) {
      updateMessageNoteStates();
    }
  });

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.type !== "LCGS_APPLY_SETTINGS") {
      return;
    }
    apply(event.data.settings);
  });
})();
