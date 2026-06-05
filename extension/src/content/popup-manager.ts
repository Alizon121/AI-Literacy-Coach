import { createShadowHost } from "./shadow-host";
import { mountPopup, mountRateLimitMessage, mountNoChangesMessage } from "./popup-renderer";
import type { CoachingResponse } from "../types";

interface PopupInstance {
  host: HTMLElement;
  cleanup: () => void;
}

let activePopup: PopupInstance | null = null;
let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

type StateListener = (active: boolean) => void;
const stateListeners = new Set<StateListener>();

export function isPopupActive(): boolean {
  return activePopup !== null;
}

export function onPopupStateChange(listener: StateListener): () => void {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}

function notifyStateChange(): void {
  const active = activePopup !== null;
  stateListeners.forEach((l) => l(active));
}

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
  notifyStateChange();
}

export function showNoChangesPopup(inputEl: HTMLElement): void {
  dismissPopup();

  const { host, shadow, stopTracking } = createShadowHost(inputEl);
  const unmount = mountNoChangesMessage(shadow, dismissPopup);

  activePopup = {
    host,
    cleanup: () => {
      unmount();
      stopTracking();
    },
  };

  autoDismissTimer = setTimeout(dismissPopup, 4000);

  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
  notifyStateChange();
}

export function showRateLimitPopup(resetInSeconds: number, inputEl: HTMLElement): void {
  dismissPopup();

  const { host, shadow, stopTracking } = createShadowHost(inputEl);
  const unmount = mountRateLimitMessage(shadow, resetInSeconds, dismissPopup);

  activePopup = {
    host,
    cleanup: () => {
      unmount();
      stopTracking();
    },
  };

  autoDismissTimer = setTimeout(dismissPopup, 8000);

  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
  notifyStateChange();
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
  notifyStateChange();
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
