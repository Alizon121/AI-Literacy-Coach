import { getSettings, recordEvaluation, recordSuggestionMade, recordSuggestionAccepted } from "./storage";
import type { CoachingResponse, EvaluationResult } from "../types";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "INIT_TAB":
      Promise.all([getSettings(), checkServerHealth()]).then(([settings, serverOnline]) => {
        sendResponse({ settings, serverOnline });
      });
      return true;

    case "EVALUATE_PROMPT":
      handleEvaluation(message.payload.prompt).then(sendResponse);
      return true;

    case "SUGGESTION_ACCEPTED":
      recordSuggestionAccepted();
      chrome.runtime.sendMessage({ type: "STATS_UPDATED" }).catch(() => {});
      break;

    case "SUGGESTION_DISMISSED":
      break;
  }
});

// Push setting changes to all active AI platform tabs
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "SETTINGS_CHANGED", payload: changes }).catch(() => {});
      }
    });
  });
});

function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

async function checkServerHealth(): Promise<boolean> {
  try {
    const settings = await getSettings();
    const res = await fetch(`http://localhost:${settings.serverPort}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function handleEvaluation(prompt: string): Promise<EvaluationResult> {
  const settings = await getSettings();
  if (!settings.coachingEnabled) return { payload: null };

  try {
    const res = await fetch(`http://localhost:${settings.serverPort}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model: settings.model, sensitivity: settings.sensitivity }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after");
      const resetInSeconds = retryAfter
        ? parseInt(retryAfter, 10)
        : secondsUntilMidnightUTC();
      return { payload: null, rateLimitExceeded: true, rateLimitResetInSeconds: resetInSeconds };
    }

    if (!res.ok) return { payload: null };

    const data: CoachingResponse = await res.json();
    if (typeof data.needs_improvement !== "boolean") return { payload: null };

    await recordEvaluation();
    if (data.needs_improvement) await recordSuggestionMade();

    return { payload: data };
  } catch {
    return { payload: null, serverOffline: true };
  }
}
