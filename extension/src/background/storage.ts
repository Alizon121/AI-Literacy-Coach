import type { Settings, Stats } from "../types";

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

// Groq models that have been shut down; saved settings pointing at these are migrated to the default.
const RETIRED_GROQ_MODELS = new Set([
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-8b-8192",
  "gemma2-9b-it",
]);

const DEFAULTS: Settings = {
  coachingEnabled: true,
  toolbarVisible: true,
  sensitivity: 2,
  triggerDelay: 1500,
  suspendInIncognito: true,
  backgroundActivity: false,
  model: "phi4-mini",
  groqModel: DEFAULT_GROQ_MODEL,
  serverPort: 8000,
  apiKey: "",
  enabledSites: {
    "claude.ai": true,
    "chat.openai.com": true,
    "gemini.google.com": true,
    "perplexity.ai": false,
    "chat.mistral.ai": false,
    "copilot.microsoft.com": false,
  },
};

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get("settings");
  const settings: Settings = { ...DEFAULTS, ...stored.settings };
  if (RETIRED_GROQ_MODELS.has(settings.groqModel)) settings.groqModel = DEFAULT_GROQ_MODEL;
  return settings;
}

export async function saveSettings(partial: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({ settings: { ...current, ...partial } });
}

export async function recordEvaluation(): Promise<void> {
  const stored = await chrome.storage.sync.get("stats");
  const stats: Stats = stored.stats ?? { promptsEvaluated: 0, suggestionsMade: 0, suggestionsAccepted: 0 };
  stats.promptsEvaluated++;
  await chrome.storage.sync.set({ stats });
}

export async function recordSuggestionMade(): Promise<void> {
  const stored = await chrome.storage.sync.get("stats");
  const stats: Stats = stored.stats ?? { promptsEvaluated: 0, suggestionsMade: 0, suggestionsAccepted: 0 };
  stats.suggestionsMade++;
  await chrome.storage.sync.set({ stats });
}

export async function recordSuggestionAccepted(): Promise<void> {
  const stored = await chrome.storage.sync.get("stats");
  const stats: Stats = stored.stats ?? { promptsEvaluated: 0, suggestionsMade: 0, suggestionsAccepted: 0 };
  stats.suggestionsAccepted++;
  await chrome.storage.sync.set({ stats });
}
