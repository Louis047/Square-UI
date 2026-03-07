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

Cross-browser defaults:
- `mod.squareui.crossbrowser.custom-browser-ui-font.enabled`: Enables the browser chrome font override.
- `mod.squareui.crossbrowser.custom-browser-ui-font.stylesheet-url`: Loads an optional HTTPS font stylesheet for hosted fonts such as Google Fonts or Bunny Fonts.
- `mod.squareui.crossbrowser.custom-browser-ui-font.font-family`: Sets the browser chrome `font-family` stack. Leave the stylesheet URL blank when using locally installed fonts only.
- `mod.squareui.crossbrowser.open-window-outside-current-virtual-desktop`: Applies `widget.prefer_windows_on_current_virtual_desktop` while the mod is active.

These browser-level settings are now managed through a Square UI sync script so they reset when the mod unloads instead of leaving stale Firefox preferences behind.

Custom Browser UI Font examples:
- Local installed fonts only: leave `stylesheet-url` empty and set `font-family` to `"Aptos", "Segoe UI", system-ui, sans-serif`.
- Hosted fonts: set `stylesheet-url` to something like `https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap` and set `font-family` to `"Instrument Sans", system-ui, sans-serif`.

## Browser Support

This mod declares support for Zen, Firefox, Floorp, LibreWolf, Mullvad Browser, and Waterfox.

Zen-specific selectors are included for the best result in Zen Browser. Other Firefox-based browsers will ignore unsupported selectors and still apply the generic square-corner rules where they match.

`Square Website Content UI` covers website documents and Firefox internal content pages. `Square Browser UI` remains responsible for browser chrome only.

## Installation

1. Install Sine in a supported Firefox-based browser.
2. Add this repository as a Sine mod source or publish it through the Sine store workflow.
3. Enable or disable the Square UI preferences in Sine depending on which parts of Square UI you want active.