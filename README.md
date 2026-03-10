# Square UI

Square UI is a Sine-compatible CSS mod that removes rounded corners from browser chrome and website content across Firefox-based browsers.

## Features

- Independent toggle for browser chrome styling.
- Independent toggle for website content styling.
- Works best in Zen Browser while remaining safe to install on other Sine-supported Firefox forks.

## Included Files

- `userChrome.css` for browser UI styling.
- `userContent.css` for website and internal page styling.
- `preferences.json` for Sine toggles.
- `theme.json` for Sine metadata.

## Preferences

- `mod.squareui.browser.enabled`: Toggles `Square Browser UI`.
- `mod.squareui.content.enabled`: Toggles `Square Website Content UI`.

Zen-specific defaults:
- `zen.theme.content-element-separation`: Applies Zen's native content element separation preference while the mod is active.
- `zen.view.experimental-no-window-controls`: Applies Zen's native no-window-controls preference while the mod is active.
- `mod.squareui.floating-statusbar.enabled`: Enables the floating statusbar styling.
- `mod.squareui.floating-findbar.enabled`: Enables the floating findbar styling.
- `mod.squareui.dialog-fixes.enabled`: Enables the custom dialog styling fixes.
- `mod.squareui.extension-tools.enabled`: Shows URL bar extension tools on URL bar hover/focus instead of hiding them permanently.

Cross-browser defaults:
- `theme.squareui_uifont.default`: Switches the browser UI font mode between `Default` and `Custom`.
- `theme.squareui_uifont.custom`: Sets the local `font-family` stack used when the font mode is `Custom`.
- `mod.squareui.crossbrowser.open-window-outside-current-virtual-desktop`: Applies `widget.prefer_windows_on_current_virtual_desktop` while the mod is active.

These browser-level settings are now managed through a Square UI sync script so they reset when the mod unloads instead of leaving stale Firefox preferences behind.

Custom Browser UI Font example:
- Set `theme.squareui_uifont.default` to `Custom` and set `theme.squareui_uifont.custom` to `"Aptos", "Segoe UI", system-ui, sans-serif`.

## Browser Support

This mod declares support for Zen, Firefox, Floorp, LibreWolf, Mullvad Browser, and Waterfox.

Zen-specific selectors are included for the best result in Zen Browser. Other Firefox-based browsers will ignore unsupported selectors and still apply the generic square-corner rules where they match.

`Square Website Content UI` covers website documents and Firefox internal content pages. `Square Browser UI` remains responsible for browser chrome only.

## Installation

1. Install Sine in a supported Firefox-based browser.
2. Add this repository as a Sine mod source or publish it through the Sine store workflow.
3. Enable or disable the Square UI preferences in Sine depending on which parts of Square UI you want active.