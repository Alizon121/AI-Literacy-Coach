import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSettings, saveSettings } from "../background/storage";

// chrome.storage.sync.get is typed as returning void in @types/chrome, so we
// cast to vi.fn() to allow mockResolvedValue to accept arbitrary return values.
const storageGet = () => chrome.storage.sync.get as ReturnType<typeof vi.fn>;

describe("getSettings", () => {
  it("returns all defaults when nothing is stored", async () => {
    storageGet().mockResolvedValue({});
    const s = await getSettings();
    expect(s.coachingEnabled).toBe(true);
    expect(s.sensitivity).toBe(2);
    expect(s.triggerDelay).toBe(1500);
    expect(s.model).toBe("phi4-mini");
    expect(s.groqModel).toBe("llama-3.3-70b-versatile");
    expect(s.serverPort).toBe(8000);
    expect(s.apiKey).toBe("");
  });

  it("returns an empty apiKey by default — new users have no Groq key", async () => {
    storageGet().mockResolvedValue({});
    const s = await getSettings();
    expect(s.apiKey).toBe("");
  });

  it("merges stored values over defaults", async () => {
    storageGet().mockResolvedValue({
      settings: { apiKey: "gsk_custom", sensitivity: 3 },
    });
    const s = await getSettings();
    expect(s.apiKey).toBe("gsk_custom");
    expect(s.sensitivity).toBe(3);
    expect(s.model).toBe("phi4-mini");
    expect(s.coachingEnabled).toBe(true);
  });

  it("accepts stored coachingEnabled: false", async () => {
    storageGet().mockResolvedValue({
      settings: { coachingEnabled: false },
    });
    const s = await getSettings();
    expect(s.coachingEnabled).toBe(false);
  });
});

describe("saveSettings", () => {
  beforeEach(() => {
    storageGet().mockResolvedValue({});
  });

  it("writes the merged settings object under the 'settings' key", async () => {
    await saveSettings({ apiKey: "gsk_new_key" });
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      settings: expect.objectContaining({ apiKey: "gsk_new_key" }),
    });
  });

  it("preserves fields not included in the partial update", async () => {
    storageGet().mockResolvedValue({
      settings: { apiKey: "gsk_existing", sensitivity: 3 },
    });
    await saveSettings({ coachingEnabled: false });
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      settings: expect.objectContaining({
        apiKey: "gsk_existing",
        sensitivity: 3,
        coachingEnabled: false,
      }),
    });
  });

  it("clears apiKey when switching back to local backend", async () => {
    storageGet().mockResolvedValue({
      settings: { apiKey: "gsk_existing" },
    });
    await saveSettings({ apiKey: "" });
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      settings: expect.objectContaining({ apiKey: "" }),
    });
  });

  it("saves a custom groqModel value", async () => {
    await saveSettings({ groqModel: "mixtral-8x7b-32768" });
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      settings: expect.objectContaining({ groqModel: "mixtral-8x7b-32768" }),
    });
  });

  it("saves updated triggerDelay", async () => {
    await saveSettings({ triggerDelay: 3000 });
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      settings: expect.objectContaining({ triggerDelay: 3000 }),
    });
  });
});
