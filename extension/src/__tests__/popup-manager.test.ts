import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { CoachingResponse } from "../types";

vi.mock("../content/shadow-host");
vi.mock("../content/popup-renderer");

import { createShadowHost } from "../content/shadow-host";
import { mountPopup } from "../content/popup-renderer";
import { showCoachingPopup, dismissPopup } from "../content/popup-manager";

const LOOKS_GOOD: CoachingResponse = {
  needs_improvement: false,
  observation: null,
  why_it_matters: null,
  suggested_prompt: null,
};

const WITH_SUGGESTION: CoachingResponse = {
  needs_improvement: true,
  observation: "Vague",
  why_it_matters: "Context helps",
  suggested_prompt: "Describe the transformer architecture used in GPT models step by step.",
};

let mockHost: HTMLDivElement;
let mockStopTracking: ReturnType<typeof vi.fn>;
let mockUnmount: ReturnType<typeof vi.fn>;
let inputEl: HTMLTextAreaElement;

beforeEach(() => {
  mockHost = document.createElement("div");
  document.body.appendChild(mockHost);
  mockStopTracking = vi.fn();
  mockUnmount = vi.fn();

  vi.mocked(createShadowHost).mockReturnValue({
    host: mockHost,
    shadow: mockHost.attachShadow({ mode: "open" }),
    stopTracking: mockStopTracking,
  });
  vi.mocked(mountPopup).mockReturnValue(mockUnmount);

  inputEl = document.createElement("textarea");
  document.body.appendChild(inputEl);
});

afterEach(() => {
  dismissPopup();
  if (inputEl.parentNode) inputEl.parentNode.removeChild(inputEl);
  vi.clearAllMocks();
});

describe("dismissPopup", () => {
  it("is a no-op when no popup is active", () => {
    expect(() => dismissPopup()).not.toThrow();
  });

  it("calls unmount and stopTracking when a popup is active", () => {
    showCoachingPopup(WITH_SUGGESTION, inputEl);
    dismissPopup();
    expect(mockUnmount).toHaveBeenCalledOnce();
    expect(mockStopTracking).toHaveBeenCalledOnce();
  });

  it("removes the host element from the DOM", () => {
    showCoachingPopup(WITH_SUGGESTION, inputEl);
    expect(document.body.contains(mockHost)).toBe(true);
    dismissPopup();
    expect(document.body.contains(mockHost)).toBe(false);
  });

  it("is idempotent — calling twice does not throw", () => {
    showCoachingPopup(WITH_SUGGESTION, inputEl);
    dismissPopup();
    expect(() => dismissPopup()).not.toThrow();
  });
});

describe("showCoachingPopup", () => {
  it("calls createShadowHost with the input element", () => {
    showCoachingPopup(WITH_SUGGESTION, inputEl);
    expect(createShadowHost).toHaveBeenCalledWith(inputEl);
  });

  it("calls mountPopup with the shadow root and suggestion", () => {
    showCoachingPopup(WITH_SUGGESTION, inputEl);
    expect(mountPopup).toHaveBeenCalledWith(
      expect.anything(),
      WITH_SUGGESTION,
      inputEl,
      expect.any(Function)
    );
  });

  it("dismisses any existing popup before showing a new one", () => {
    showCoachingPopup(WITH_SUGGESTION, inputEl);
    const firstUnmount = mockUnmount;

    // Second call must set up fresh mocks
    const secondHost = document.createElement("div");
    document.body.appendChild(secondHost);
    const secondUnmount = vi.fn();
    vi.mocked(createShadowHost).mockReturnValue({
      host: secondHost,
      shadow: secondHost.attachShadow({ mode: "open" }),
      stopTracking: vi.fn(),
    });
    vi.mocked(mountPopup).mockReturnValue(secondUnmount);

    showCoachingPopup(WITH_SUGGESTION, inputEl);

    expect(firstUnmount).toHaveBeenCalledOnce();
    document.body.removeChild(secondHost);
  });
});

describe("auto-dismiss timer", () => {
  it("auto-dismisses after 4000ms for a looks-good response", () => {
    vi.useFakeTimers();
    showCoachingPopup(LOOKS_GOOD, inputEl);
    expect(document.body.contains(mockHost)).toBe(true);

    vi.advanceTimersByTime(4000);
    expect(mockUnmount).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it("does not auto-dismiss for a suggestion response", () => {
    vi.useFakeTimers();
    showCoachingPopup(WITH_SUGGESTION, inputEl);

    vi.advanceTimersByTime(8000);
    expect(mockUnmount).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});

describe("outside-click dismissal", () => {
  it("dismisses the popup when clicking outside the host element", () => {
    showCoachingPopup(WITH_SUGGESTION, inputEl);
    const outsideEl = document.createElement("span");
    document.body.appendChild(outsideEl);

    document.dispatchEvent(new MouseEvent("click", { bubbles: true, target: outsideEl } as MouseEventInit));
    expect(mockUnmount).toHaveBeenCalledOnce();

    document.body.removeChild(outsideEl);
  });
});

describe("Escape key dismissal", () => {
  it("dismisses the popup when Escape is pressed", () => {
    showCoachingPopup(WITH_SUGGESTION, inputEl);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(mockUnmount).toHaveBeenCalledOnce();
  });

  it("does not throw when Escape is pressed with no active popup", () => {
    expect(() =>
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    ).not.toThrow();
  });
});
