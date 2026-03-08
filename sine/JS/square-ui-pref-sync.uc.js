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
  const MOD_PREF_PREFIX = "mod.squareui.";
  const BACKUP_STATE_PREF = "mod.squareui.state.managed-pref-backups";
  const SHUTDOWN_TOPICS = ["quit-application-granted", "profile-before-change"];

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

  function getRootState() {
    if (!Services[STATE_KEY]) {
      Services[STATE_KEY] = {
        windowCount: 0,
        initialized: false,
        backups: null,
        observer: null,
        shutdownObserver: null,
        windows: new Set(),
        cleanedUp: false,
      };
    }
    return Services[STATE_KEY];
  }

  function loadStoredBackups() {
    const raw = Services.prefs.getStringPref(BACKUP_STATE_PREF, "").trim();
    if (!raw) {
      return new Map();
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return new Map();
      }

      return new Map(Object.entries(parsed));
    } catch {
      return new Map();
    }
  }

  const state = getRootState();
  if (!(state.backups instanceof Map)) {
    state.backups = loadStoredBackups();
  }
  state.windowCount += 1;
  state.windows.add(window);

  function persistBackups() {
    if (state.backups.size === 0) {
      if (Services.prefs.prefHasUserValue(BACKUP_STATE_PREF)) {
        Services.prefs.clearUserPref(BACKUP_STATE_PREF);
      }
      return;
    }

    const serialized = JSON.stringify(Object.fromEntries(state.backups.entries()));
    Services.prefs.setStringPref(BACKUP_STATE_PREF, serialized);
  }

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
    persistBackups();
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
    persistBackups();
  }

  function clearModPrefs() {
    const modPrefs = Services.prefs.getChildList(MOD_PREF_PREFIX);

    for (const prefName of modPrefs) {
      if (!Services.prefs.prefHasUserValue(prefName)) {
        continue;
      }

      Services.prefs.clearUserPref(prefName);
    }
  }

  function removeAllObservers() {
    if (state.observer) {
      for (const pref of MANAGED_PREFS) {
        Services.prefs.removeObserver(pref.source, state.observer);
      }
    }

    if (state.shutdownObserver) {
      for (const topic of SHUTDOWN_TOPICS) {
        Services.obs.removeObserver(state.shutdownObserver, topic);
      }
    }
  }

  function finalizeCleanup() {
    if (state.cleanedUp) {
      return;
    }

    state.cleanedUp = true;
    removeAllObservers();
    restoreManagedPrefs();
    clearModPrefs();
    delete Services[STATE_KEY];
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

    state.shutdownObserver = {
      observe(_subject, topic) {
        if (!SHUTDOWN_TOPICS.includes(topic)) {
          return;
        }

        finalizeCleanup();
      },
    };

    for (const pref of MANAGED_PREFS) {
      Services.prefs.addObserver(pref.source, state.observer);
    }

    for (const topic of SHUTDOWN_TOPICS) {
      Services.obs.addObserver(state.shutdownObserver, topic);
    }

    applyAllManagedPrefs();
    state.initialized = true;
  }

  window.addEventListener(
    "unload",
    () => {
      state.windows.delete(window);
      state.windowCount -= 1;

      if (state.windowCount > 0) {
        return;
      }

      finalizeCleanup();
    },
    { once: true }
  );
})();