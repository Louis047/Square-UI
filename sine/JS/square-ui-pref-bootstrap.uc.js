// ==UserScript==
// @name           square-ui-pref-bootstrap
// @description    Seeds missing Square UI prefs so bool-pref CSS gates work on first startup.
// @author         Lone
// @version        1.0.0
// @grant          none
// ==/UserScript==

(function () {
  "use strict";

  const DEFAULT_PREFS = [
    ["mod.squareui.browser.enabled", true],
    ["mod.squareui.content.enabled", true],
    ["mod.squareui.extension-tools.enabled", true],
    ["mod.squareui.floating-statusbar.enabled", true],
    ["mod.squareui.floating-findbar.enabled", true],
    ["mod.squareui.floating-sidebar-margin.enabled", true],
    ["mod.squareui.dialog-fixes.enabled", true],
    ["theme.squareui_uifont.default", "Default"],
    ["theme.squareui_uifont.custom", "sans-serif"],
    ["widget.prefer_windows_on_current_virtual_desktop", false],
  ];

  for (const [prefName, defaultValue] of DEFAULT_PREFS) {
    if (Services.prefs.getPrefType(prefName) !== Services.prefs.PREF_INVALID) {
      continue;
    }

    if (typeof defaultValue === "boolean") {
      Services.prefs.setBoolPref(prefName, defaultValue);
      continue;
    }

    if (typeof defaultValue === "number") {
      Services.prefs.setIntPref(prefName, defaultValue);
      continue;
    }

    Services.prefs.setStringPref(prefName, String(defaultValue));
  }
})();