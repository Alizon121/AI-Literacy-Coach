import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--edd43287.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_reactDom_client from "/vendor/.vite-deps-react-dom_client.js__v--edd43287.js"; const createRoot = __vite__cjsImport1_reactDom_client["createRoot"];
import { CoachingPopup } from "/src/ui/CoachingPopup.tsx.js";
import { injectSuggestedText } from "/src/utils/textInjector.ts.js";
export function mountPopup(shadow, suggestion, inputEl, onDismiss) {
  const container = document.createElement("div");
  container.style.pointerEvents = "all";
  shadow.appendChild(container);
  const root = createRoot(container);
  root.render(
    /* @__PURE__ */ jsxDEV(
      CoachingPopup,
      {
        suggestion,
        onApply: (suggestedText) => {
          injectSuggestedText(inputEl, suggestedText);
          chrome.runtime.sendMessage({ type: "SUGGESTION_ACCEPTED" });
          onDismiss();
        },
        onDismiss: () => {
          chrome.runtime.sendMessage({ type: "SUGGESTION_DISMISSED" });
          onDismiss();
        }
      },
      void 0,
      false,
      {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
        lineNumber: 19,
        columnNumber: 5
      },
      this
    )
  );
  return () => {
    root.unmount();
    container.remove();
  };
}
