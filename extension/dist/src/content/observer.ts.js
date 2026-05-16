import { findActiveInput } from "/src/utils/inputDetector.ts.js";
import { isWorthEvaluating } from "/src/utils/preFilter.ts.js";
import { showCoachingPopup, dismissPopup } from "/src/content/popup-manager.ts.js";
let debounceTimer;
let lastEvaluatedPrompt = "";
let triggerDelay = 800;
let mutationObserver = null;
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
}
function attachListener(input) {
  if (attachedInputs.has(input)) return;
  attachedInputs.add(input);
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const text = input.innerText || input.value || "";
      if (!isWorthEvaluating(text, lastEvaluatedPrompt)) return;
      lastEvaluatedPrompt = text;
      const result = await chrome.runtime.sendMessage({
        type: "EVALUATE_PROMPT",
        payload: { prompt: text }
      });
      if (result?.serverOffline) {
        console.error(
          "[AI Literacy Coach] Cannot reach the local server. Make sure the backend is running: cd backend && fastapi dev main.py"
        );
        return;
      }
      if (!result?.payload) return;
      showCoachingPopup(result.payload, input);
    }, triggerDelay);
  });
}
