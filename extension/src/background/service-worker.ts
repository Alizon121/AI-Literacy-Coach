import { getSettings, recordEvaluation, recordSuggestionMade, recordSuggestionAccepted } from "./storage";
import { buildSystemPrompt } from "./systemPrompt";
import type { CoachingResponse, EvaluationResult, Settings } from "../types";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "INIT_TAB":
      Promise.all([getSettings(), checkBackendReady()]).then(([settings, serverOnline]) => {
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

async function checkBackendReady(): Promise<boolean> {
  const settings = await getSettings();
  if (settings.apiKey) return true;
  try {
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
  return settings.apiKey
    ? evaluateWithGroq(prompt, settings)
    : evaluateWithLocal(prompt, settings);
}

async function evaluateWithGroq(prompt: string, settings: Settings): Promise<EvaluationResult> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.groqModel,
        messages: [
          { role: "system", content: buildSystemPrompt(settings.sensitivity) },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.status === 401) {
      console.error("[AI Literacy Coach] Invalid Groq API key — update it in the options page.");
      return { payload: null, serverOffline: true };
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after");
      const resetInSeconds = retryAfter ? parseInt(retryAfter, 10) : secondsUntilMidnightUTC();
      return { payload: null, rateLimitExceeded: true, rateLimitResetInSeconds: resetInSeconds };
    }
    if (!res.ok) return { payload: null };

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const coaching = parseCoachingResponse(content);
    if (!coaching) return { payload: null };

    await recordEvaluation();
    if (coaching.needs_improvement) await recordSuggestionMade();
    return { payload: coaching };
  } catch {
    return { payload: null, serverOffline: true };
  }
}

async function evaluateWithLocal(prompt: string, settings: Settings): Promise<EvaluationResult> {
  try {
    const res = await fetch(`http://localhost:${settings.serverPort}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model: settings.model, sensitivity: settings.sensitivity }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after");
      const resetInSeconds = retryAfter ? parseInt(retryAfter, 10) : secondsUntilMidnightUTC();
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

function parseCoachingResponse(raw: string): CoachingResponse | null {
  const tryParse = (text: string): CoachingResponse | null => {
    try {
      const data = JSON.parse(text);
      if (typeof data.needs_improvement !== "boolean") return null;
      return {
        needs_improvement: data.needs_improvement,
        observation: data.observation ?? null,
        why_it_matters: data.why_it_matters ?? null,
        suggested_prompt: data.suggested_prompt ?? null,
      };
    } catch {
      return null;
    }
  };

  return (
    tryParse(raw.replace(/```(?:json)?|```/g, "").trim()) ??
    tryParse((raw.match(/\{[\s\S]*\}/) ?? [])[0] ?? "") ??
    null
  );
}
