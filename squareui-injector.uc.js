// ==UserScript==
// @name           SquareUI Injector
// @namespace      SquareUI
// @description    Forcefully strips border-radius from hardcoded Zen tooltips and checkboxes via Shadow DOM piercing.
// @include        main
// @startup        SquareUIInjector.init();
// ==/UserScript==

const SquareUIInjector = {
  styleContent: `
    * {
      border-radius: 0px !important;
    }
  `,

  applyStyles(element) {
    if (element.shadowRoot) {
      // Avoid injecting multiple times
      if (element.shadowRoot.querySelector("#squareui-injected-style")) return;

      const style = document.createElement("style");
      style.id = "squareui-injected-style";
      style.textContent = SquareUIInjector.styleContent;
      element.shadowRoot.appendChild(style);
    }
  },

  scanNodes(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === "TOOLTIP" || node.tagName === "MENUITEM" || node.tagName === "MENUBUTTON" || node.tagName === "PANEL") {
        SquareUIInjector.applyStyles(node);
      }
      if (node.querySelectorAll) {
        node.querySelectorAll("tooltip, menuitem, menubutton, panel").forEach(SquareUIInjector.applyStyles);
      }
    }
  },

  init() {
    // Initial pass for already loaded elements
    SquareUIInjector.scanNodes(document.documentElement);

    // Observe future popups and tooltips
    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
          SquareUIInjector.scanNodes(node);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
};

if (window.gBrowserInit && window.gBrowserInit.delayedStartupFinished) {
  SquareUIInjector.init();
} else {
  let delayedListener = (subject, topic) => {
    if (topic == "browser-delayed-startup-finished" && subject == window) {
      Services.obs.removeObserver(delayedListener, topic);
      SquareUIInjector.init();
    }
  };
  Services.obs.addObserver(delayedListener, "browser-delayed-startup-finished");
}
