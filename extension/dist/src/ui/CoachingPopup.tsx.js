import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/ui/CoachingPopup.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--f4442258.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/vendor/.vite-deps-react.js__v--f4442258.js"; const useState = __vite__cjsImport3_react["useState"];
export function CoachingPopup({ suggestion, onApply, onDismiss }) {
  _s();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("observation");
  if (!suggestion.needs_improvement) {
    return /* @__PURE__ */ jsxDEV("div", { className: "popup", children: /* @__PURE__ */ jsxDEV("div", { className: "popup-header", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "popup-header-left", children: [
        /* @__PURE__ */ jsxDEV("span", { children: "AI Literacy Coach" }, void 0, false, {
          fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
          lineNumber: 40,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "badge badge-success", children: "looks good" }, void 0, false, {
          fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
          lineNumber: 41,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
        lineNumber: 39,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "icon-btn", onClick: onDismiss, "aria-label": "Close", children: "✕" }, void 0, false, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
        lineNumber: 43,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
      lineNumber: 38,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this);
  }
  const tabContent = {
    observation: suggestion.observation,
    why_it_matters: suggestion.why_it_matters,
    suggestion: suggestion.suggested_prompt
  };
  const tabLabels = {
    observation: "observation",
    why_it_matters: "why it matters",
    suggestion: "suggestion"
  };
  return /* @__PURE__ */ jsxDEV("div", { className: `popup${collapsed ? " collapsed" : ""}`, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "popup-header", onClick: () => setCollapsed((c) => !c), children: [
      /* @__PURE__ */ jsxDEV("div", { className: "popup-header-left", children: [
        /* @__PURE__ */ jsxDEV("span", { children: "AI Literacy Coach" }, void 0, false, {
          fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
          lineNumber: 65,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "badge badge-warn", children: "suggestion" }, void 0, false, {
          fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
          lineNumber: 66,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
        lineNumber: 64,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "header-actions", children: [
        /* @__PURE__ */ jsxDEV("button", { className: "icon-btn", "aria-label": collapsed ? "Expand" : "Collapse", children: collapsed ? "▼" : "▲" }, void 0, false, {
          fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
          lineNumber: 69,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            className: "icon-btn",
            "aria-label": "Close",
            onClick: (e) => {
              e.stopPropagation();
              onDismiss();
            },
            children: "✕"
          },
          void 0,
          false,
          {
            fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
            lineNumber: 72,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
        lineNumber: 68,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
      lineNumber: 63,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "tab-row", children: ["observation", "why_it_matters", "suggestion"].map(
      (tab) => /* @__PURE__ */ jsxDEV(
        "button",
        {
          className: `tab${activeTab === tab ? " active" : ""}`,
          onClick: (e) => {
            e.stopPropagation();
            setActiveTab(tab);
          },
          children: tabLabels[tab]
        },
        tab,
        false,
        {
          fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
          lineNumber: 84,
          columnNumber: 9
        },
        this
      )
    ) }, void 0, false, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
      lineNumber: 82,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "popup-body", children: activeTab === "suggestion" ? /* @__PURE__ */ jsxDEV("div", { className: "suggested-prompt", children: tabContent.suggestion }, void 0, false, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
      lineNumber: 96,
      columnNumber: 9
    }, this) : /* @__PURE__ */ jsxDEV("p", { children: tabContent[activeTab] }, void 0, false, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
      lineNumber: 98,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
      lineNumber: 94,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "popup-footer", children: [
      /* @__PURE__ */ jsxDEV("button", { className: "btn-dismiss", onClick: onDismiss, children: "Dismiss" }, void 0, false, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
        lineNumber: 103,
        columnNumber: 9
      }, this),
      suggestion.suggested_prompt && /* @__PURE__ */ jsxDEV("button", { className: "btn-apply", onClick: () => onApply(suggestion.suggested_prompt), children: "Apply suggestion" }, void 0, false, {
        fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
        lineNumber: 105,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
      lineNumber: 102,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx",
    lineNumber: 62,
    columnNumber: 5
  }, this);
}
_s(CoachingPopup, "pGicsyQSZKXnFzGJ70YJ25F/Rz8=");
_c = CoachingPopup;
var _c;
$RefreshReg$(_c, "CoachingPopup");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/andrewlizon/Desktop/Projects/AI-literacy-coach/extension/src/ui/CoachingPopup.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
