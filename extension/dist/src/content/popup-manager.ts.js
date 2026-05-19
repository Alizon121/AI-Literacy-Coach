import { createShadowHost } from "/src/content/shadow-host.ts.js";
import { mountPopup, mountRateLimitMessage } from "/src/content/popup-renderer.tsx.js";
let activePopup = null;
let autoDismissTimer = null;
const stateListeners = /* @__PURE__ */ new Set();
export function isPopupActive() {
  return activePopup !== null;
}
export function onPopupStateChange(listener) {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}
function notifyStateChange() {
  const active = activePopup !== null;
  stateListeners.forEach((l) => l(active));
}
export function showCoachingPopup(suggestion, inputEl) {
  dismissPopup();
  const { host, shadow, stopTracking } = createShadowHost(inputEl);
  const unmount = mountPopup(shadow, suggestion, inputEl, dismissPopup);
  activePopup = {
    host,
    cleanup: () => {
      unmount();
      stopTracking();
    }
  };
  if (!suggestion.needs_improvement) {
    autoDismissTimer = setTimeout(dismissPopup, 4e3);
  }
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
  notifyStateChange();
}
export function showRateLimitPopup(resetInSeconds, inputEl) {
  dismissPopup();
  const { host, shadow, stopTracking } = createShadowHost(inputEl);
  const unmount = mountRateLimitMessage(shadow, resetInSeconds, dismissPopup);
  activePopup = {
    host,
    cleanup: () => {
      unmount();
      stopTracking();
    }
  };
  autoDismissTimer = setTimeout(dismissPopup, 8e3);
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
  notifyStateChange();
}
export function dismissPopup() {
  if (autoDismissTimer !== null) {
    clearTimeout(autoDismissTimer);
    autoDismissTimer = null;
  }
  if (!activePopup) return;
  activePopup.cleanup();
  activePopup.host.remove();
  activePopup = null;
  document.removeEventListener("click", handleOutsideClick);
  document.removeEventListener("keydown", handleEscapeKey);
  notifyStateChange();
}
function handleOutsideClick(e) {
  if (!activePopup) return;
  if (!activePopup.host.contains(e.target)) {
    dismissPopup();
  }
}
function handleEscapeKey(e) {
  if (e.key === "Escape") dismissPopup();
}
