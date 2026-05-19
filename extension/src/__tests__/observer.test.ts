import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../content/popup-manager", () => ({
  showCoachingPopup: vi.fn(),
  dismissPopup: vi.fn(),
  isPopupActive: vi.fn(() => false),
  onPopupStateChange: vi.fn(() => vi.fn()),
}));

vi.mock("../content/toggle-button", () => ({
  createToggleButton: vi.fn(() => ({ setActive: vi.fn(), destroy: vi.fn() })),
}));

describe("observer — suppressNextEvaluation", () => {
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    vi.useFakeTimers();
    textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockResolvedValue({
      payload: null,
    });
  });

  afterEach(async () => {
    // Disconnect this test's MutationObserver before resetting modules.
    // Without this, a stale observer would still watch document.body and
    // attach an extra input listener when the next test appends its textarea,
    // causing two debounce callbacks with two separate suppressNext flags.
    const { teardownObserver } = await import("../content/observer");
    teardownObserver();
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    document.body.removeChild(textarea);
    vi.resetModules();
  });

  it("exports suppressNextEvaluation as a function", async () => {
    const { suppressNextEvaluation } = await import("../content/observer");
    expect(typeof suppressNextEvaluation).toBe("function");
  });

  it("normal input fires sendMessage after the debounce delay", async () => {
    const { watchForInputFields } = await import("../content/observer");
    watchForInputFields(vi.fn());

    textarea.value = "Tell me about the history of artificial intelligence research";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(1600);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledOnce();
  });

  it("suppressed cycle skips sendMessage without consuming subsequent evaluations", async () => {
    const { watchForInputFields, suppressNextEvaluation } = await import(
      "../content/observer"
    );
    watchForInputFields(vi.fn());

    // Step 1 — normal evaluation so lastEvaluatedPrompt is set
    textarea.value = "Tell me about the history of artificial intelligence research";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(1600);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);

    // Step 2 — suppress, then inject different text; debounce must NOT call sendMessage
    suppressNextEvaluation();
    textarea.value = "What are the fundamental differences between supervised and unsupervised ML?";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(1600);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1); // unchanged

    // Step 3 — normal typing resumes; debounce SHOULD call sendMessage
    textarea.value =
      "Explain the bias-variance tradeoff in machine learning with a practical example";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(1600);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(2);
  });
});
