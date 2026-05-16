import { findActiveInput } from "../utils/inputDetector";
import { isWorthEvaluating } from "../utils/preFilter";
import { showCoachingPopup, dismissPopup } from "./popup-manager";
import type { EvaluationResult } from "../types";

let debounceTimer: ReturnType<typeof setTimeout>;
let lastEvaluatedPrompt = "";
let triggerDelay = 800;
let mutationObserver: MutationObserver | null = null;

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
}

function attachListener(input: HTMLElement): void {
  if (attachedInputs.has(input)) return;
  attachedInputs.add(input);

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      const text = input.innerText || (input as HTMLInputElement).value || "";
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

      if (!result?.payload) return;

      showCoachingPopup(result.payload, input);
    }, triggerDelay);
  });
}
