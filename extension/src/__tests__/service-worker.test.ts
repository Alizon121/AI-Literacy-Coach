import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// Stub fetch before the service worker module loads
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

type MessageHandler = (
  msg: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (r: any) => void
) => boolean | void;

let handler: MessageHandler;

beforeAll(async () => {
  vi.resetModules();
  await import("../background/service-worker");
  const calls = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls;
  handler = calls[calls.length - 1][0] as MessageHandler;
});

// Invoke the message handler and collect the async sendResponse value
function call(msg: any): Promise<any> {
  return new Promise((resolve) => {
    handler(msg, {} as chrome.runtime.MessageSender, resolve);
  });
}

function mockStorage(settings: Record<string, unknown> = {}) {
  vi.mocked(chrome.storage.sync.get).mockResolvedValue({ settings });
}

beforeEach(() => {
  // Default: empty storage → all DEFAULTS (apiKey = "", coachingEnabled = true)
  vi.mocked(chrome.storage.sync.get).mockResolvedValue({});
  vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({});
  fetchMock.mockReset();
});

// ─── INIT_TAB / checkBackendReady ────────────────────────────────────────────

describe("INIT_TAB — checkBackendReady", () => {
  it("reports serverOnline=true without calling fetch when apiKey is set", async () => {
    mockStorage({ apiKey: "gsk_test_key" });
    const res = await call({ type: "INIT_TAB" });
    expect(res.serverOnline).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports serverOnline=true when the local health endpoint responds ok", async () => {
    mockStorage({ apiKey: "" });
    fetchMock.mockResolvedValue({ ok: true });
    const res = await call({ type: "INIT_TAB" });
    expect(res.serverOnline).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.anything()
    );
  });

  it("reports serverOnline=false when the local health endpoint is unreachable", async () => {
    mockStorage({ apiKey: "" });
    fetchMock.mockRejectedValue(new Error("Connection refused"));
    const res = await call({ type: "INIT_TAB" });
    expect(res.serverOnline).toBe(false);
  });

  it("reports serverOnline=false when the local health endpoint returns non-ok", async () => {
    mockStorage({ apiKey: "" });
    fetchMock.mockResolvedValue({ ok: false });
    const res = await call({ type: "INIT_TAB" });
    expect(res.serverOnline).toBe(false);
  });

  it("includes the settings object in the response", async () => {
    mockStorage({ apiKey: "gsk_test_key", sensitivity: 3 });
    const res = await call({ type: "INIT_TAB" });
    expect(res.settings).toBeDefined();
    expect(res.settings.apiKey).toBe("gsk_test_key");
    expect(res.settings.sensitivity).toBe(3);
  });
});

// ─── EVALUATE_PROMPT backend routing ─────────────────────────────────────────

describe("EVALUATE_PROMPT — backend routing", () => {
  const PROMPT = "Tell me about the history of machine learning in detail";

  it("calls the Groq endpoint when an apiKey is stored", async () => {
    mockStorage({ apiKey: "gsk_test", groqModel: "llama-3.3-70b-versatile" });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              needs_improvement: false,
              observation: null,
              why_it_matters: null,
              suggested_prompt: null,
            }),
          },
        }],
      }),
    });
    await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.anything()
    );
  });

  it("calls the local endpoint when no apiKey is stored", async () => {
    mockStorage({ apiKey: "", serverPort: 8000 });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        needs_improvement: false,
        observation: null,
        why_it_matters: null,
        suggested_prompt: null,
      }),
    });
    await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/evaluate",
      expect.anything()
    );
  });

  it("returns payload:null without hitting any backend when coaching is disabled", async () => {
    mockStorage({ coachingEnabled: false });
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res).toEqual({ payload: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the correct model in the Groq request body", async () => {
    mockStorage({ apiKey: "gsk_test", groqModel: "llama3-8b-8192" });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({ needs_improvement: false, observation: null, why_it_matters: null, suggested_prompt: null }),
          },
        }],
      }),
    });
    await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("llama3-8b-8192");
  });
});

// ─── Groq path — response parsing & error handling ───────────────────────────

describe("evaluateWithGroq — response handling", () => {
  const PROMPT = "Tell me about the history of machine learning in detail";

  beforeEach(() => {
    mockStorage({ apiKey: "gsk_test", groqModel: "llama-3.3-70b-versatile" });
  });

  it("returns the parsed coaching payload on a successful response", async () => {
    const coaching = {
      needs_improvement: true,
      observation: "Too vague to produce a focused answer.",
      why_it_matters: "The AI may return a generic overview.",
      suggested_prompt: "Explain the three eras of machine learning research with key milestones.",
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ choices: [{ message: { content: JSON.stringify(coaching) } }] }),
    });
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.payload).toEqual(coaching);
  });

  it("parses a response wrapped in markdown code fences", async () => {
    const coaching = { needs_improvement: false, observation: null, why_it_matters: null, suggested_prompt: null };
    const fenced = "```json\n" + JSON.stringify(coaching) + "\n```";
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ choices: [{ message: { content: fenced } }] }),
    });
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.payload).toEqual(coaching);
  });

  it("returns serverOffline:true on a 401 invalid-key response", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, headers: { get: () => null } });
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.serverOffline).toBe(true);
    expect(res.payload).toBeNull();
  });

  it("returns rateLimitExceeded:true on a 429 response", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, headers: { get: () => "60" } });
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.rateLimitExceeded).toBe(true);
    expect(res.rateLimitResetInSeconds).toBe(60);
    expect(res.payload).toBeNull();
  });

  it("returns serverOffline:true on a network error", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.serverOffline).toBe(true);
  });

  it("returns payload:null when the Groq response is malformed JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ choices: [{ message: { content: "not json at all" } }] }),
    });
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.payload).toBeNull();
  });
});

// ─── Local path — response parsing & error handling ──────────────────────────

describe("evaluateWithLocal — response handling", () => {
  const PROMPT = "Tell me about the history of machine learning in detail";

  beforeEach(() => {
    mockStorage({ apiKey: "", serverPort: 8000 });
  });

  it("returns the parsed coaching payload on a successful response", async () => {
    const coaching = {
      needs_improvement: false,
      observation: null,
      why_it_matters: null,
      suggested_prompt: null,
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => coaching,
    });
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.payload).toEqual(coaching);
  });

  it("returns rateLimitExceeded:true on a 429 response", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, headers: { get: () => "120" } });
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.rateLimitExceeded).toBe(true);
    expect(res.rateLimitResetInSeconds).toBe(120);
  });

  it("returns serverOffline:true on a network error", async () => {
    fetchMock.mockRejectedValue(new Error("Connection refused"));
    const res = await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(res.serverOffline).toBe(true);
  });

  it("uses the configured serverPort in the request URL", async () => {
    mockStorage({ apiKey: "", serverPort: 9000 });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ needs_improvement: false, observation: null, why_it_matters: null, suggested_prompt: null }),
    });
    await call({ type: "EVALUATE_PROMPT", payload: { prompt: PROMPT } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:9000/evaluate",
      expect.anything()
    );
  });
});
