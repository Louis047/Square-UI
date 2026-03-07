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
- `zen.theme.content-element-separation`: Recommended default of `0` to remove spacing padding from Zen content surfaces.
- `zen.view.experimental-no-window-controls`: Recommended default of `true` for the intended Zen window treatment.
- `mod.squareui.floating-statusbar.enabled`: Enables the floating statusbar styling.
- `mod.squareui.floating-findbar.enabled`: Enables the floating findbar styling.
- `mod.squareui.dialog-fixes.enabled`: Enables the custom dialog styling fixes.

Cross-browser defaults:
- `widget.prefer_windows_on_current_virtual_desktop`: Recommended default of `false` to open windows outside the current virtual desktop and avoid new-window link behavior issues on some tiling window manager setups.

## Browser Support

This mod declares support for Zen, Firefox, Floorp, LibreWolf, Mullvad Browser, and Waterfox.

Zen-specific selectors are included for the best result in Zen Browser. Other Firefox-based browsers will ignore unsupported selectors and still apply the generic square-corner rules where they match.

`Square Website Content UI` covers website documents and Firefox internal content pages. `Square Browser UI` remains responsible for browser chrome only.

## Installation

1. Install Sine in a supported Firefox-based browser.
2. Add this repository as a Sine mod source or publish it through the Sine store workflow.
3. Enable or disable the two preferences in Sine depending on which parts of Square UI you want active.