// ==UserScript==
// @name           square-ui-pref-sync
// @description    Applies and restores browser preferences owned by Square UI.
// @author         Lone
// @version        1.0.0
// @grant          none
// ==/UserScript==

(function () {
  "use strict";

  const STATE_KEY = "__squareUIPrefSync";
  const FONT_ENABLED_PREF = "mod.squareui.crossbrowser.custom-browser-ui-font.enabled";
  const FONT_STYLESHEET_URL_PREF = "mod.squareui.crossbrowser.custom-browser-ui-font.stylesheet-url";
  const FONT_FAMILY_PREF = "mod.squareui.crossbrowser.custom-browser-ui-font.font-family";
  const FONT_STYLE_ID = "squareui-custom-browser-ui-font-import";
  const FONT_ACTIVE_ATTRIBUTE = "squareui-custom-browser-font-active";
  const FONT_CUSTOM_PROPERTY = "--squareui-custom-browser-font";

  const MANAGED_PREFS = [
    {
      source: "zen.theme.content-element-separation",
      target: "zen.theme.content-element-separation",
      type: "int",
      defaultValue: 0,
    },
    {
      source: "zen.view.experimental-no-window-controls",
      target: "zen.view.experimental-no-window-controls",
      type: "bool",
      defaultValue: true,
    },
    {
      source: "mod.squareui.crossbrowser.open-window-outside-current-virtual-desktop",
      target: "widget.prefer_windows_on_current_virtual_desktop",
      type: "bool",
      defaultValue: false,
    },
  ];

  const FONT_PREFS = new Set([
    FONT_ENABLED_PREF,
    FONT_STYLESHEET_URL_PREF,
    FONT_FAMILY_PREF,
  ]);

  function getRootState() {
    if (!Services[STATE_KEY]) {
      Services[STATE_KEY] = {
        windowCount: 0,
        initialized: false,
        backups: new Map(),
        observer: null,
        windows: new Set(),
      };
    }
    return Services[STATE_KEY];
  }

  const state = getRootState();
  state.windowCount += 1;
  state.windows.add(window);

  function getStringPref(prefName, defaultValue = "") {
    const prefType = Services.prefs.getPrefType(prefName);

    if (prefType === Services.prefs.PREF_STRING) {
      return Services.prefs.getStringPref(prefName, defaultValue).trim();
    }

    if (prefType === Services.prefs.PREF_INT) {
      return String(Services.prefs.getIntPref(prefName, Number.parseInt(defaultValue, 10) || 0));
    }

    if (prefType === Services.prefs.PREF_BOOL) {
      return Services.prefs.getBoolPref(prefName, defaultValue === "true") ? "true" : "false";
    }

    return defaultValue;
  }

  function getPrefValue(pref) {
    if (pref.type === "int") {
      const prefType = Services.prefs.getPrefType(pref.source);

      if (prefType === Services.prefs.PREF_INT) {
        return Services.prefs.getIntPref(pref.source, pref.defaultValue);
      }

      if (prefType === Services.prefs.PREF_STRING) {
        const parsed = Number.parseInt(
          Services.prefs.getStringPref(pref.source, String(pref.defaultValue)),
          10
        );

        return Number.isNaN(parsed) ? pref.defaultValue : parsed;
      }

      return pref.defaultValue;
    }

    const prefType = Services.prefs.getPrefType(pref.source);

    if (prefType === Services.prefs.PREF_BOOL) {
      return Services.prefs.getBoolPref(pref.source, pref.defaultValue);
    }

    if (prefType === Services.prefs.PREF_STRING) {
      const normalized = Services.prefs
        .getStringPref(pref.source, String(pref.defaultValue))
        .trim()
        .toLowerCase();

      if (normalized === "true" || normalized === "1") {
        return true;
      }

      if (normalized === "false" || normalized === "0") {
        return false;
      }
    }

    return pref.defaultValue;
  }

  function captureBackup(pref) {
    if (state.backups.has(pref.target)) {
      return;
    }

    const hadUserValue = Services.prefs.prefHasUserValue(pref.target);
    let value = null;

    if (hadUserValue) {
      value = pref.type === "int"
        ? Services.prefs.getIntPref(pref.target)
        : Services.prefs.getBoolPref(pref.target);
    }

    state.backups.set(pref.target, { hadUserValue, value, type: pref.type });
  }

  function applyManagedPref(pref) {
    captureBackup(pref);
    const value = getPrefValue(pref);

    if (pref.type === "int") {
      Services.prefs.setIntPref(pref.target, value);
      return;
    }

    Services.prefs.setBoolPref(pref.target, value);
  }

  function applyAllManagedPrefs() {
    for (const pref of MANAGED_PREFS) {
      applyManagedPref(pref);
    }
  }

  function getDefaultPrefValue(pref) {
    const defaultBranch = Services.prefs.getDefaultBranch("");
    const prefType = defaultBranch.getPrefType(pref.target);

    if (pref.type === "int" && prefType === Services.prefs.PREF_INT) {
      return {
        hasDefault: true,
        value: defaultBranch.getIntPref(pref.target, pref.defaultValue),
      };
    }

    if (pref.type === "bool" && prefType === Services.prefs.PREF_BOOL) {
      return {
        hasDefault: true,
        value: defaultBranch.getBoolPref(pref.target, pref.defaultValue),
      };
    }

    return {
      hasDefault: false,
      value: pref.defaultValue,
    };
  }

  function getFontFeatureEnabled() {
    const prefType = Services.prefs.getPrefType(FONT_ENABLED_PREF);

    if (prefType === Services.prefs.PREF_BOOL) {
      return Services.prefs.getBoolPref(FONT_ENABLED_PREF, false);
    }

    if (prefType === Services.prefs.PREF_STRING) {
      const value = Services.prefs.getStringPref(FONT_ENABLED_PREF, "false").trim().toLowerCase();
      return value === "true" || value === "1";
    }

    return false;
  }

  function getFontConfig() {
    const enabled = getFontFeatureEnabled();
    const fontFamily = getStringPref(FONT_FAMILY_PREF);
    const stylesheetUrl = getStringPref(FONT_STYLESHEET_URL_PREF);

    return {
      enabled,
      fontFamily,
      stylesheetUrl,
    };
  }

  function normalizeHttpsUrl(value) {
    if (!value) {
      return "";
    }

    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" ? parsed.toString() : "";
    } catch {
      return "";
    }
  }

  function escapeCssString(value) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function getFontStyleNode(doc) {
    return doc.getElementById(FONT_STYLE_ID);
  }

  function removeFontStylesFromWindow(win) {
    const doc = win.document;
    const styleNode = getFontStyleNode(doc);

    if (styleNode) {
      styleNode.remove();
    }

    doc.documentElement.style.removeProperty(FONT_CUSTOM_PROPERTY);
    doc.documentElement.removeAttribute(FONT_ACTIVE_ATTRIBUTE);
  }

  function ensureFontStyleNode(win) {
    const doc = win.document;
    let styleNode = getFontStyleNode(doc);

    if (!styleNode) {
      styleNode = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
      styleNode.id = FONT_STYLE_ID;
      doc.documentElement.appendChild(styleNode);
    }

    return styleNode;
  }

  function applyFontConfigToWindow(win) {
    if (!win || win.closed) {
      return;
    }

    const { enabled, fontFamily, stylesheetUrl } = getFontConfig();
    const doc = win.document;
    const root = doc.documentElement;

    if (!enabled || !fontFamily) {
      removeFontStylesFromWindow(win);
      return;
    }

    root.style.setProperty(FONT_CUSTOM_PROPERTY, fontFamily);
    root.setAttribute(FONT_ACTIVE_ATTRIBUTE, "true");

    const normalizedUrl = normalizeHttpsUrl(stylesheetUrl);
    if (!normalizedUrl) {
      const styleNode = getFontStyleNode(doc);
      if (styleNode) {
        styleNode.remove();
      }
      return;
    }

    const styleNode = ensureFontStyleNode(win);
    styleNode.textContent = `@import url("${escapeCssString(normalizedUrl)}");`;
  }

  function applyFontConfigToAllWindows() {
    for (const win of state.windows) {
      applyFontConfigToWindow(win);
    }
  }

  function restoreManagedPrefs() {
    for (const pref of MANAGED_PREFS) {
      const backup = state.backups.get(pref.target);
      if (!backup) {
        continue;
      }

      if (!backup.hadUserValue) {
        Services.prefs.clearUserPref(pref.target);

        const defaultPref = getDefaultPrefValue(pref);
        if (!defaultPref.hasDefault) {
          continue;
        }

        if (pref.type === "int") {
          const restoredValue = Services.prefs.getIntPref(pref.target, defaultPref.value);
          if (restoredValue !== defaultPref.value) {
            Services.prefs.setIntPref(pref.target, defaultPref.value);
          }
          continue;
        }

        const restoredValue = Services.prefs.getBoolPref(pref.target, defaultPref.value);
        if (restoredValue !== defaultPref.value) {
          Services.prefs.setBoolPref(pref.target, defaultPref.value);
        }
        continue;
      }

      if (backup.type === "int") {
        Services.prefs.setIntPref(pref.target, backup.value);
        continue;
      }

      Services.prefs.setBoolPref(pref.target, backup.value);
    }

    state.backups.clear();
  }

  if (!state.initialized) {
    state.observer = {
      observe(_subject, topic, data) {
        if (topic !== "nsPref:changed") {
          return;
        }

        if (FONT_PREFS.has(data)) {
          applyFontConfigToAllWindows();
          return;
        }

        const pref = MANAGED_PREFS.find((entry) => entry.source === data);
        if (!pref) {
          return;
        }

        applyManagedPref(pref);
      },
    };

    for (const pref of MANAGED_PREFS) {
      Services.prefs.addObserver(pref.source, state.observer);
    }

    for (const prefName of FONT_PREFS) {
      Services.prefs.addObserver(prefName, state.observer);
    }

    applyAllManagedPrefs();
    state.initialized = true;
  }

  applyFontConfigToWindow(window);

  window.addEventListener(
    "unload",
    () => {
      removeFontStylesFromWindow(window);
      state.windows.delete(window);
      state.windowCount -= 1;

      if (state.windowCount > 0) {
        return;
      }

      for (const pref of MANAGED_PREFS) {
        Services.prefs.removeObserver(pref.source, state.observer);
      }

      for (const prefName of FONT_PREFS) {
        Services.prefs.removeObserver(prefName, state.observer);
      }

      restoreManagedPrefs();
      delete Services[STATE_KEY];
    },
    { once: true }
  );
})();