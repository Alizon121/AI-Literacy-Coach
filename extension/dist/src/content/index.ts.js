import { watchForInputFields, teardownObserver, updateDebounceDelay } from "/src/content/observer.ts.js";
import { dismissPopup } from "/src/content/popup-manager.ts.js";
let currentInput = null;
async function init() {
  const response = await chrome.runtime.sendMessage({ type: "INIT_TAB" });
  const settings = response.settings;
  const serverOnline = response.serverOnline;
  if (!serverOnline) {
    console.error(
      "[AI Literacy Coach] Backend server is not reachable at localhost:8000.\nSetup instructions:\n  1. Install the ollama Python package:  pip install ollama\n  2. Pull the model:                     ollama pull llama3\n  3. Start the backend:                  cd backend && fastapi dev main.py"
    );
  }
  if (settings.coachingEnabled && serverOnline) {
    watchForInputFields((input) => {
      currentInput = input;
    });
  }
}
chrome.runtime.onMessage.addListener((message) => {
  const changes = message.payload;
  switch (message.type) {
    case "SETTINGS_CHANGED":
      if ("coachingEnabled" in changes) {
        const enabled = changes.coachingEnabled.newValue;
        if (enabled) {
          watchForInputFields((input) => {
            currentInput = input;
          });
        } else {
          teardownObserver();
          dismissPopup();
        }
      }
      if ("triggerDelay" in changes) {
        updateDebounceDelay(changes.triggerDelay.newValue);
      }
      break;
  }
});
init();
