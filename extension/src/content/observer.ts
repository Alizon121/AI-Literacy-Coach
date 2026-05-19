import { findActiveInput } from "../utils/inputDetector";
import { isWorthEvaluating } from "../utils/preFilter";
import { showCoachingPopup, showRateLimitPopup, dismissPopup, isPopupActive, onPopupStateChange } from "./popup-manager";
import { createToggleButton } from "./toggle-button";
import type { EvaluationResult } from "../types";

let debounceTimer: ReturnType<typeof setTimeout>;
let lastEvaluatedPrompt = "";
let triggerDelay = 1500;
let mutationObserver: MutationObserver | null = null;
let suppressNext = false;

const activeButtons: Array<{ destroy: () => void }> = [];

export function suppressNextEvaluation(): void {
  suppressNext = true;
}

const attachedInputs = new WeakSet<HTMLElement>();

export function updateDebounceDelay(delay: number): void {
  triggerDelay = delay;
}

export function watchForInputFields(onInputFound: (input: HTMLElement) => void): void {
  const tryAttach = () => {
    const input = findActiveInput();
    if (input) {
      onInputFound(input);
      attachListener(input);
    }
  };

  tryAttach();

  mutationObserver = new MutationObserver(tryAttach);
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

export function teardownObserver(): void {
  mutationObserver?.disconnect();
  mutationObserver = null;
  clearTimeout(debounceTimer);
  dismissPopup();
  activeButtons.forEach((b) => b.destroy());
  activeButtons.length = 0;
}

function attachListener(input: HTMLElement): void {
  if (attachedInputs.has(input)) return;
  attachedInputs.add(input);

  const button = createToggleButton(input, async () => {
    if (isPopupActive()) {
      dismissPopup();
      return;
    }
    const text = input.innerText || (input as HTMLInputElement).value || "";
    if (text.length < 15) return;
    lastEvaluatedPrompt = text;
    const result: EvaluationResult = await chrome.runtime.sendMessage({
      type: "EVALUATE_PROMPT",
      payload: { prompt: text },
    });
    if (result?.rateLimitExceeded) {
      showRateLimitPopup(result.rateLimitResetInSeconds ?? 0, input);
      return;
    }
    if (result?.payload) showCoachingPopup(result.payload, input);
  });

  const unsubscribe = onPopupStateChange((active) => button.setActive(active));
  activeButtons.push({
    destroy: () => {
      unsubscribe();
      button.destroy();
    },
  });

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      const text = input.innerText || (input as HTMLInputElement).value || "";
      if (suppressNext) {
        suppressNext = false;
        lastEvaluatedPrompt = text;
        return;
      }
      if (!isWorthEvaluating(text, lastEvaluatedPrompt)) return;
      lastEvaluatedPrompt = text;

      const result: EvaluationResult = await chrome.runtime.sendMessage({
        type: "EVALUATE_PROMPT",
        payload: { prompt: text },
      });

      if (result?.serverOffline) {
        console.error(
          "[AI Literacy Coach] Cannot reach the local server. " +
          "Make sure the backend is running: cd backend && fastapi dev main.py"
        );
        return;
      }

      if (result?.rateLimitExceeded) {
        showRateLimitPopup(result.rateLimitResetInSeconds ?? 0, input);
        return;
      }

      if (!result?.payload) return;

      showCoachingPopup(result.payload, input);
    }, triggerDelay);
  });
}
