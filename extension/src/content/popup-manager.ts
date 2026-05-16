import { createShadowHost } from "./shadow-host";
import { mountPopup } from "./popup-renderer";
import type { CoachingResponse } from "../types";

interface PopupInstance {
  host: HTMLElement;
  cleanup: () => void;
}

let activePopup: PopupInstance | null = null;
let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

export function showCoachingPopup(suggestion: CoachingResponse, inputEl: HTMLElement): void {
  dismissPopup();

  const { host, shadow, stopTracking } = createShadowHost(inputEl);
  const unmount = mountPopup(shadow, suggestion, inputEl, dismissPopup);

  activePopup = {
    host,
    cleanup: () => {
      unmount();
      stopTracking();
    },
  };

  if (!suggestion.needs_improvement) {
    autoDismissTimer = setTimeout(dismissPopup, 4000);
  }

  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
}

export function dismissPopup(): void {
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

function handleOutsideClick(e: MouseEvent): void {
  if (!activePopup) return;
  if (!activePopup.host.contains(e.target as Node)) {
    dismissPopup();
  }
}

function handleEscapeKey(e: KeyboardEvent): void {
  if (e.key === "Escape") dismissPopup();
}
