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

  const MANAGED_PREFS = [
    {
      source: "mod.squareui.zen.content-element-separation",
      target: "zen.theme.content-element-separation",
      type: "int",
      defaultValue: 0,
    },
    {
      source: "mod.squareui.zen.no-window-controls",
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

  function getRootState() {
    if (!Services[STATE_KEY]) {
      Services[STATE_KEY] = {
        windowCount: 0,
        initialized: false,
        backups: new Map(),
        observer: null,
      };
    }
    return Services[STATE_KEY];
  }

  const state = getRootState();
  state.windowCount += 1;

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

  function restoreManagedPrefs() {
    for (const pref of MANAGED_PREFS) {
      const backup = state.backups.get(pref.target);
      if (!backup) {
        continue;
      }

      if (!backup.hadUserValue) {
        Services.prefs.clearUserPref(pref.target);
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

    applyAllManagedPrefs();
    state.initialized = true;
  }

  window.addEventListener(
    "unload",
    () => {
      state.windowCount -= 1;

      if (state.windowCount > 0) {
        return;
      }

      for (const pref of MANAGED_PREFS) {
        Services.prefs.removeObserver(pref.source, state.observer);
      }

      restoreManagedPrefs();
      delete Services[STATE_KEY];
    },
    { once: true }
  );
})();