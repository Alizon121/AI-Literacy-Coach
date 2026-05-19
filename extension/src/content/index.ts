import { watchForInputFields, teardownObserver, updateDebounceDelay } from "./observer";
import { dismissPopup } from "./popup-manager";
import type { Settings } from "../types";

async function init(): Promise<void> {
  const response = await chrome.runtime.sendMessage({ type: "INIT_TAB" });
  const settings: Settings = response.settings;
  const serverOnline: boolean = response.serverOnline;

  if (!serverOnline) {
    console.error(
      "[AI Literacy Coach] Backend server is not reachable at localhost:8000.\n" +
      "Setup instructions:\n" +
      "  1. Install the ollama Python package:  pip install ollama\n" +
      "  2. Pull the model:                     ollama pull llama3\n" +
      "  3. Start the backend:                  cd backend && fastapi dev main.py"
    );
  }

  if (settings.coachingEnabled && serverOnline) {
    watchForInputFields(() => {});
  }
}

chrome.runtime.onMessage.addListener((message) => {
  const changes = message.payload as Record<string, { newValue: unknown }>;

  switch (message.type) {
    case "SETTINGS_CHANGED":
      if ("coachingEnabled" in changes) {
        const enabled = changes.coachingEnabled.newValue as boolean;
        if (enabled) {
          watchForInputFields(() => {});
        } else {
          teardownObserver();
          dismissPopup();
        }
      }
      if ("triggerDelay" in changes) {
        updateDebounceDelay(changes.triggerDelay.newValue as number);
      }
      break;
  }
});

init();
