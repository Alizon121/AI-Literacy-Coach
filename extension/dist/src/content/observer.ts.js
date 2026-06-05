import { findActiveInput } from "/src/utils/inputDetector.ts.js";
import { isWorthEvaluating } from "/src/utils/preFilter.ts.js";
import { showCoachingPopup, showRateLimitPopup, showNoChangesPopup, dismissPopup, isPopupActive, onPopupStateChange } from "/src/content/popup-manager.ts.js";
import { createToggleButton } from "/src/content/toggle-button.ts.js";
import { maybeStartTutorial } from "/src/content/tutorial-manager.ts.js";
let debounceTimer;
let lastEvaluatedPrompt = "";
let triggerDelay = 1500;
let mutationObserver = null;
let suppressNext = false;
const activeButtons = [];
export function suppressNextEvaluation() {
  suppressNext = true;
}
const attachedInputs = /* @__PURE__ */ new WeakSet();
export function updateDebounceDelay(delay) {
  triggerDelay = delay;
}
export function watchForInputFields(onInputFound) {
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
export function teardownObserver() {
  mutationObserver?.disconnect();
  mutationObserver = null;
  clearTimeout(debounceTimer);
  dismissPopup();
  activeButtons.forEach((b) => b.destroy());
  activeButtons.length = 0;
}
function attachListener(input) {
  if (attachedInputs.has(input)) return;
  attachedInputs.add(input);
  let paused = false;
  async function evaluate(text) {
    lastEvaluatedPrompt = text;
    const result = await chrome.runtime.sendMessage({
      type: "EVALUATE_PROMPT",
      payload: { prompt: text }
    });
    if (paused) return;
    if (result?.serverOffline) {
      console.error(
        "[AI Literacy Coach] Cannot reach the local server. Make sure the backend is running: cd backend && fastapi dev main.py"
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
      const text = input.innerText || input.value || "";
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
        const text = input.innerText || input.value || "";
        if (text.length >= 10 && text !== lastEvaluatedPrompt) evaluate(text);
      }
    }
  });
  maybeStartTutorial(button.anchorEl);
  const unsubscribe = onPopupStateChange((active) => button.setActive(active));
  activeButtons.push({
    destroy: () => {
      unsubscribe();
      button.destroy();
    }
  });
  const scheduleEvaluation = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (paused) return;
      const text = input.innerText || input.value || "";
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
    setTimeout(scheduleEvaluation, 0);
  });
}
