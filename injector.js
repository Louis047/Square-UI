// ==UserScript==
// @name           SquareUI Injector
// @namespace      SquareUI
// @description    Forcefully strips border-radius from hardcoded Zen tooltips and checkboxes via Shadow DOM interception.
// @include        main
// @startup        SquareUIInjector.init();
// ==/UserScript==

const SquareUIInjector = {
  styleContent: `
    * {
      border-radius: 0px !important;
    }
  `,

  applyStyles(shadowRoot) {
    if (!shadowRoot) return;
    if (shadowRoot.querySelector("#squareui-injected-style")) return;

    const style = shadowRoot.ownerDocument.createElementNS("http://www.w3.org/1999/xhtml", "style");
    style.id = "squareui-injected-style";
    style.textContent = SquareUIInjector.styleContent;
    shadowRoot.appendChild(style);
  },

  isTargetElement(element) {
    if (!element || !element.tagName) return false;
    const tag = element.tagName.toLowerCase();
    return tag === "tooltip" || tag === "menuitem" || tag === "panel" || tag === "menupopup";
  },

  scanNodes(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (SquareUIInjector.isTargetElement(node)) {
        const shadow = node.openOrClosedShadowRoot || node.shadowRoot;
        if (shadow) SquareUIInjector.applyStyles(shadow);
      }
      if (node.querySelectorAll) {
        node.querySelectorAll("tooltip, menuitem, panel, menupopup").forEach((el) => {
          const shadow = el.openOrClosedShadowRoot || el.shadowRoot;
          if (shadow) SquareUIInjector.applyStyles(shadow);
        });
      }
    }
  },

  init() {
    // 1. Hook attachShadow to intercept dynamic Shadow DOM attachment immediately
    const originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(init) {
      const shadowRoot = originalAttachShadow.call(this, init);
      try {
        if (SquareUIInjector.isTargetElement(this)) {
          SquareUIInjector.applyStyles(shadowRoot);
        }
      } catch (e) {
        console.error("SquareUI Injector error in attachShadow interceptor:", e);
      }
      return shadowRoot;
    };

    // 2. Perform initial pass for already loaded elements
    SquareUIInjector.scanNodes(document.documentElement);

    // 3. Observe future elements
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

// Start the injector when the document is ready
if (document.readyState === "complete") {
  SquareUIInjector.init();
} else {
  window.addEventListener("DOMContentLoaded", () => SquareUIInjector.init(), { once: true });
}
