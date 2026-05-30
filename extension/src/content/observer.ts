import { findActiveInput } from "../utils/inputDetector";
import { isWorthEvaluating } from "../utils/preFilter";
import { showCoachingPopup, showRateLimitPopup, showNoChangesPopup, dismissPopup, isPopupActive, onPopupStateChange } from "./popup-manager";
import { createToggleButton } from "./toggle-button";
import { maybeStartTutorial } from "./tutorial-manager";
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

  let paused = false;

  async function evaluate(text: string): Promise<void> {
    lastEvaluatedPrompt = text;
    const result: EvaluationResult = await chrome.runtime.sendMessage({
      type: "EVALUATE_PROMPT",
      payload: { prompt: text },
    });
    if (paused) return;
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
    if (result?.payload) showCoachingPopup(result.payload, input);
  }

  const button = createToggleButton(input, {
    onGetFeedback: async () => {
      if (isPopupActive()) {
        dismissPopup();
        return;
      }
      const text = input.innerText || (input as HTMLInputElement).value || "";
      if (text.length < 10) {
        showNoChangesPopup(input);
        return;
      }
      await evaluate(text);
    },
    onTogglePause: () => {
      paused = !paused;
      button.setPaused(paused);
      if (paused) {
        dismissPopup();
      } else {
        const text = input.innerText || (input as HTMLInputElement).value || "";
        if (text.length >= 10 && text !== lastEvaluatedPrompt) evaluate(text);
      }
    },
  });

  maybeStartTutorial(button.anchorEl);

  const unsubscribe = onPopupStateChange((active) => button.setActive(active));
  activeButtons.push({
    destroy: () => {
      unsubscribe();
      button.destroy();
    },
  });

  const scheduleEvaluation = () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      if (paused) return;
      const text = input.innerText || (input as HTMLInputElement).value || "";
      if (suppressNext) {
        suppressNext = false;
        lastEvaluatedPrompt = text;
        return;
      }
      if (!isWorthEvaluating(text, lastEvaluatedPrompt)) return;
      await evaluate(text);
    }, triggerDelay);
  };

  input.addEventListener("input", scheduleEvaluation);

  input.addEventListener("paste", () => {
    // Let the browser finish inserting pasted content before scheduling,
    // since paste fires before the DOM is updated.
    setTimeout(scheduleEvaluation, 0);
  });
}
