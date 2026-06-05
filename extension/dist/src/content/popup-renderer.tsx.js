import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/popup-renderer.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--f4442258.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/vendor/react-refresh.js";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
import __vite__cjsImport3_reactDom_client from "/vendor/.vite-deps-react-dom_client.js__v--f4442258.js"; const createRoot = __vite__cjsImport3_reactDom_client["createRoot"];
import { CoachingPopup } from "/src/ui/CoachingPopup.tsx.js";
import { injectSuggestedText } from "/src/utils/textInjector.ts.js";
import { suppressNextEvaluation } from "/src/content/observer.ts.js";
function formatResetTime(seconds) {
  if (seconds <= 0) return "a little while";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil(seconds % 3600 / 60);
  if (hours >= 1) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}
function NoChangesMessage({ onDismiss }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "popup", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "popup-header", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "popup-header-left", children: /* @__PURE__ */ jsxDEV("span", { children: "AI Literacy Coach" }, void 0, false, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
        lineNumber: 39,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
        lineNumber: 38,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "icon-btn", "aria-label": "Close", onClick: onDismiss, children: "✕" }, void 0, false, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
        lineNumber: 41,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "popup-body", children: /* @__PURE__ */ jsxDEV("p", { children: "Prompt isn't long enough to assess. Keep typing to get prompt suggestions." }, void 0, false, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
      lineNumber: 44,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
      lineNumber: 43,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
    lineNumber: 36,
    columnNumber: 5
  }, this);
}
_c = NoChangesMessage;
export function mountNoChangesMessage(shadow, onDismiss) {
  const container = document.createElement("div");
  container.style.pointerEvents = "all";
  shadow.appendChild(container);
  const root = createRoot(container);
  root.render(/* @__PURE__ */ jsxDEV(NoChangesMessage, { onDismiss }, void 0, false, {
    fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
    lineNumber: 59,
    columnNumber: 15
  }, this));
  return () => {
    root.unmount();
    container.remove();
  };
}
function RateLimitMessage({ resetInSeconds, onDismiss }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "popup", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "popup-header", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "popup-header-left", children: [
        /* @__PURE__ */ jsxDEV("span", { children: "AI Literacy Coach" }, void 0, false, {
          fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
          lineNumber: 72,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "badge badge-warn", children: "limit reached" }, void 0, false, {
          fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
          lineNumber: 73,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
        lineNumber: 71,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "icon-btn", "aria-label": "Close", onClick: onDismiss, children: "✕" }, void 0, false, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
        lineNumber: 75,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
      lineNumber: 70,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "popup-body", children: /* @__PURE__ */ jsxDEV("p", { children: [
      "Daily token limit reached. Try again in ",
      formatResetTime(resetInSeconds),
      "."
    ] }, void 0, true, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
      lineNumber: 78,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
      lineNumber: 77,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
    lineNumber: 69,
    columnNumber: 5
  }, this);
}
_c2 = RateLimitMessage;
export function mountRateLimitMessage(shadow, resetInSeconds, onDismiss) {
  const container = document.createElement("div");
  container.style.pointerEvents = "all";
  shadow.appendChild(container);
  const root = createRoot(container);
  root.render(/* @__PURE__ */ jsxDEV(RateLimitMessage, { resetInSeconds, onDismiss }, void 0, false, {
    fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx",
    lineNumber: 94,
    columnNumber: 15
  }, this));
  return () => {
    root.unmount();
    container.remove();
  };
}
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
          suppressNextEvaluation();
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
        lineNumber: 115,
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
var _c, _c2;
$RefreshReg$(_c, "NoChangesMessage");
$RefreshReg$(_c2, "RateLimitMessage");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/content/popup-renderer.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
