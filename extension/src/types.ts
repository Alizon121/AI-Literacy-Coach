export interface CoachingResponse {
  needs_improvement: boolean;
  observation: string | null;
  why_it_matters: string | null;
  suggested_prompt: string | null;
}

export interface EvaluationResult {
  payload: CoachingResponse | null;
  serverOffline?: boolean;
  rateLimitExceeded?: boolean;
  rateLimitResetInSeconds?: number;
}

export interface Settings {
  coachingEnabled: boolean;
  toolbarVisible: boolean;
  sensitivity: 1 | 2 | 3;
  triggerDelay: number;
  suspendInIncognito: boolean;
  backgroundActivity: boolean;
  model: string;
  serverPort: number;
  enabledSites: Record<string, boolean>;
}

export interface Stats {
  promptsEvaluated: number;
  suggestionsMade: number;
  suggestionsAccepted: number;
}
