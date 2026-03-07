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

- `mod.squareui.browser.enabled`: Enables square browser chrome.
- `mod.squareui.content.enabled`: Enables square website content.

Zen-specific defaults:
- `zen.theme.content-element-separation`: Recommended default of `0` to remove spacing padding from Zen content surfaces.
- `zen.view.experimental-no-window-controls`: Recommended default of `true` for the intended Zen window treatment.
- `zen.theme.essentials-favicon-bg`: Recommended default of `false` for cleaner essentials tab animations.

Cross-browser defaults:
- `extensions.webextensions.restrictedDomains`: Recommended Mozilla domain override to help Stylus reach Mozilla-owned sites.
- `widget.prefer_windows_on_current_virtual_desktop`: Recommended default of `false` to avoid new-window link behavior issues on some tiling window manager setups.

## Browser Support

This mod declares support for Zen, Firefox, Floorp, LibreWolf, Mullvad Browser, and Waterfox.

Zen-specific selectors are included for the best result in Zen Browser. Other Firefox-based browsers will ignore unsupported selectors and still apply the generic square-corner rules where they match.

The Zen-specific preferences listed above are included in Sine so the original Zen tuning can be applied from the same mod UI. On non-Zen browsers, only the cross-browser defaults are generally relevant, and unsupported Zen preferences will have no effect.

## Installation

1. Install Sine in a supported Firefox-based browser.
2. Add this repository as a Sine mod source or publish it through the Sine store workflow.
3. Enable or disable the two preferences in Sine depending on which parts of Square UI you want active.