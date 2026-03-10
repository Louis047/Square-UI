# Square UI

Square UI is a compact Sine-compatible CSS mod that removes rounded corners from browser chrome and web content for Firefox-based browsers.

Why this mod
- Small, focused tweaks to give a crisp, square UI across browser chrome and page content.
- Zen-aware but safe on other Sine-supported forks.

What’s included
- `userChrome.css` — browser chrome rules
- `userContent.css` — website/internal page rules
- `preferences.json` — Sine toggles
- `theme.json` — mod metadata

Quick start
- Preferred: Install from the Sine Marketplace — Square UI is published and available. Open Sine, search for "Square UI", and enable the mod.
- Alternative: Add this repository as a Sine mod source if you prefer manual installation.
- After install: toggle the features in Sine using the provided preferences.

Key preferences
- `mod.squareui.browser.enabled` — Square Browser UI
- `mod.squareui.content.enabled` — Square Website Content UI
- `mod.squareui.extension-tools.enabled` — show URL-bar extension tools on hover (Zen-specific behavior)

Browser support
- Targeted for Zen with fallbacks for Firefox, Floorp, LibreWolf, Mullvad Browser, and Waterfox.

Notes
- Zen-specific selectors are included to match Zen's UI when available; other browsers ignore those selectors.
- Preference-managed browser settings are synced so they reset when the mod unloads.

Contributing
- Bug reports and small patches welcome. Keep changes focused and minimal.

License
- MIT — see the `LICENSE` file for the full text.