import { createShadowHost } from "/src/content/shadow-host.ts.js";
import { mountPopup } from "/src/content/popup-renderer.tsx.js";
let activePopup = null;
let autoDismissTimer = null;
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
