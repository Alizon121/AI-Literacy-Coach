import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createToggleButton } from "../content/toggle-button";
import type { ToggleButton, ToggleButtonCallbacks } from "../content/toggle-button";

const mockResizeObserver = {
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", vi.fn(() => mockResizeObserver));
  mockResizeObserver.observe.mockReset();
  mockResizeObserver.disconnect.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function lastShadow(): ShadowRoot {
  return (document.body.lastElementChild as HTMLElement).shadowRoot!;
}

function lastHost(): HTMLElement {
  return document.body.lastElementChild as HTMLElement;
}

function makeCallbacks(overrides: Partial<ToggleButtonCallbacks> = {}): ToggleButtonCallbacks {
  return { onGetFeedback: vi.fn(), onTogglePause: vi.fn(), ...overrides };
}

describe("createToggleButton — DOM structure", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    result = createToggleButton(inputEl, makeCallbacks());
  });

  afterEach(() => {
    result.destroy();
    document.body.removeChild(inputEl);
  });

  it("appends a host element to document.body", () => {
    expect(document.body.contains(lastHost())).toBe(true);
  });

  it("host uses fixed positioning", () => {
    expect(lastHost().style.position).toBe("fixed");
  });

  it("host has pointer-events none so it does not block the input", () => {
    expect(lastHost().style.pointerEvents).toBe("none");
  });

  it("host has a shadow root", () => {
    expect(lastHost().shadowRoot).not.toBeNull();
  });

  it("shadow root contains a <style> element", () => {
    expect(lastShadow().querySelector("style")).not.toBeNull();
  });

  it("shadow root contains the toggle button", () => {
    expect(lastShadow().querySelector("button.coach-toggle")).not.toBeNull();
  });

  it("button has aria-label 'AI Literacy Coach'", () => {
    const btn = lastShadow().querySelector("button.coach-toggle")!;
    expect(btn.getAttribute("aria-label")).toBe("AI Literacy Coach");
  });

  it("button displays the coach label text", () => {
    const btn = lastShadow().querySelector("button.coach-toggle")!;
    expect(btn.textContent).toContain("C");
  });

  it("shadow root contains the mini-menu", () => {
    expect(lastShadow().querySelector(".mini-menu")).not.toBeNull();
  });

  it("mini-menu is hidden by default", () => {
    const menu = lastShadow().querySelector(".mini-menu")!;
    expect(menu.classList.contains("open")).toBe(false);
  });

  it("mini-menu contains a Get prompt feedback item", () => {
    const items = lastShadow().querySelectorAll(".menu-item");
    const labels = Array.from(items).map((el) => el.textContent ?? "");
    expect(labels.some((t) => t.includes("Get prompt feedback"))).toBe(true);
  });

  it("mini-menu contains a Pause on this site item", () => {
    const items = lastShadow().querySelectorAll(".menu-item");
    const labels = Array.from(items).map((el) => el.textContent ?? "");
    expect(labels.some((t) => t.includes("Pause on this site"))).toBe(true);
  });
});

describe("createToggleButton — positioning", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
  });

  afterEach(() => {
    result.destroy();
    document.body.removeChild(inputEl);
  });

  it("positions top-right corner inside the input element on creation", () => {
    vi.spyOn(inputEl, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 300, left: 50, right: 500,
      width: 450, height: 200, x: 50, y: 100,
      toJSON: () => ({}),
    } as DOMRect);

    result = createToggleButton(inputEl, makeCallbacks());
    const host = lastHost();

    // top  = rect.top + 2 = 100 + 2 = 102
    expect(host.style.top).toBe("102px");
    // left = rect.right − SIZE − 30 = 500 − 28 − 30 = 442
    expect(host.style.left).toBe("442px");
  });

  it("updates position when the scroll event fires", () => {
    vi.spyOn(inputEl, "getBoundingClientRect")
      .mockReturnValueOnce({
        top: 100, bottom: 300, left: 50, right: 500,
        width: 450, height: 200, x: 50, y: 100,
        toJSON: () => ({}),
      } as DOMRect)
      .mockReturnValue({
        top: 200, bottom: 400, left: 50, right: 500,
        width: 450, height: 200, x: 50, y: 200,
        toJSON: () => ({}),
      } as DOMRect);

    result = createToggleButton(inputEl, makeCallbacks());
    window.dispatchEvent(new Event("scroll"));

    // top = 200 + 2 = 202
    expect(lastHost().style.top).toBe("202px");
  });

  it("observes the input element with ResizeObserver", () => {
    result = createToggleButton(inputEl, makeCallbacks());
    expect(mockResizeObserver.observe).toHaveBeenCalledWith(inputEl);
  });
});

describe("createToggleButton — menu interaction", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;
  let callbacks: ToggleButtonCallbacks;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    callbacks = makeCallbacks();
    result = createToggleButton(inputEl, callbacks);
  });

  afterEach(() => {
    result.destroy();
    document.body.removeChild(inputEl);
  });

  it("clicking the launcher button opens the mini-menu", () => {
    const btn = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
    const menu = lastShadow().querySelector(".mini-menu")!;
    btn.click();
    expect(menu.classList.contains("open")).toBe(true);
  });

  it("clicking the launcher button twice closes the mini-menu", () => {
    const btn = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
    const menu = lastShadow().querySelector(".mini-menu")!;
    btn.click();
    btn.click();
    expect(menu.classList.contains("open")).toBe(false);
  });

  it("clicking Get prompt feedback calls onGetFeedback and closes the menu", () => {
    const launcher = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
    const menu = lastShadow().querySelector(".mini-menu")!;
    const feedbackItem = Array.from(lastShadow().querySelectorAll(".menu-item")).find(
      (el) => el.textContent?.includes("Get prompt feedback")
    ) as HTMLButtonElement;

    launcher.click();
    feedbackItem.click();

    expect(callbacks.onGetFeedback).toHaveBeenCalledOnce();
    expect(menu.classList.contains("open")).toBe(false);
  });

  it("clicking Pause on this site calls onTogglePause and closes the menu", () => {
    const launcher = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
    const menu = lastShadow().querySelector(".mini-menu")!;
    const disableItem = Array.from(lastShadow().querySelectorAll(".menu-item")).find(
      (el) => el.textContent?.includes("Pause on this site")
    ) as HTMLButtonElement;

    launcher.click();
    disableItem.click();

    expect(callbacks.onTogglePause).toHaveBeenCalledOnce();
    expect(menu.classList.contains("open")).toBe(false);
  });

  it("pressing Escape closes the menu", () => {
    const launcher = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
    const menu = lastShadow().querySelector(".mini-menu")!;
    launcher.click();
    expect(menu.classList.contains("open")).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(menu.classList.contains("open")).toBe(false);
  });

  it("clicking outside closes the menu", () => {
    const launcher = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
    const menu = lastShadow().querySelector(".mini-menu")!;
    launcher.click();
    expect(menu.classList.contains("open")).toBe(true);
    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(menu.classList.contains("open")).toBe(false);
  });
});

describe("createToggleButton — setPaused", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;
  let btn: HTMLButtonElement;
  let pauseItem: HTMLButtonElement;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    result = createToggleButton(inputEl, makeCallbacks());
    btn = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
    pauseItem = Array.from(lastShadow().querySelectorAll(".menu-item")).find(
      (el) => el.textContent?.includes("Pause") || el.textContent?.includes("Resume")
    ) as HTMLButtonElement;
  });

  afterEach(() => {
    result.destroy();
    document.body.removeChild(inputEl);
  });

  it("adds the paused class when setPaused(true) is called", () => {
    result.setPaused(true);
    expect(btn.classList.contains("paused")).toBe(true);
  });

  it("removes the paused class when setPaused(false) is called", () => {
    result.setPaused(true);
    result.setPaused(false);
    expect(btn.classList.contains("paused")).toBe(false);
  });

  it("changes the pause menu item label to Resume coaching when paused", () => {
    result.setPaused(true);
    expect(pauseItem.textContent).toContain("Resume coaching");
  });

  it("restores the pause menu item label to Pause on this site when unpaused", () => {
    result.setPaused(true);
    result.setPaused(false);
    expect(pauseItem.textContent).toContain("Pause on this site");
  });

  it("hides the Get prompt feedback item when paused", () => {
    const feedbackItem = Array.from(lastShadow().querySelectorAll(".menu-item")).find(
      (el) => el.textContent?.includes("Get prompt feedback")
    ) as HTMLButtonElement;
    result.setPaused(true);
    expect(feedbackItem.hidden).toBe(true);
  });

  it("shows the Get prompt feedback item when unpaused", () => {
    const feedbackItem = Array.from(lastShadow().querySelectorAll(".menu-item")).find(
      (el) => el.textContent?.includes("Get prompt feedback")
    ) as HTMLButtonElement;
    result.setPaused(true);
    result.setPaused(false);
    expect(feedbackItem.hidden).toBe(false);
  });

  it("removes danger styling from pause item when paused", () => {
    result.setPaused(true);
    expect(pauseItem.classList.contains("menu-item--danger")).toBe(false);
  });

  it("restores danger styling on pause item when unpaused", () => {
    result.setPaused(true);
    result.setPaused(false);
    expect(pauseItem.classList.contains("menu-item--danger")).toBe(true);
  });
});

describe("createToggleButton — setActive", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;
  let btn: HTMLButtonElement;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    result = createToggleButton(inputEl, makeCallbacks());
    btn = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
  });

  afterEach(() => {
    result.destroy();
    document.body.removeChild(inputEl);
  });

  it("adds the active class when setActive(true) is called", () => {
    result.setActive(true);
    expect(btn.classList.contains("active")).toBe(true);
  });

  it("removes the active class when setActive(false) is called", () => {
    result.setActive(true);
    result.setActive(false);
    expect(btn.classList.contains("active")).toBe(false);
  });

  it("sets aria-pressed to 'true' when setActive(true)", () => {
    result.setActive(true);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("sets aria-pressed to 'false' when setActive(false)", () => {
    result.setActive(true);
    result.setActive(false);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("is idempotent — calling setActive(true) twice stays active", () => {
    result.setActive(true);
    result.setActive(true);
    expect(btn.classList.contains("active")).toBe(true);
  });
});

describe("createToggleButton — destroy", () => {
  let inputEl: HTMLTextAreaElement;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
  });

  afterEach(() => {
    document.body.removeChild(inputEl);
  });

  it("removes the host from document.body", () => {
    const result = createToggleButton(inputEl, makeCallbacks());
    const host = lastHost();
    expect(document.body.contains(host)).toBe(true);
    result.destroy();
    expect(document.body.contains(host)).toBe(false);
  });

  it("disconnects the ResizeObserver", () => {
    const result = createToggleButton(inputEl, makeCallbacks());
    result.destroy();
    expect(mockResizeObserver.disconnect).toHaveBeenCalledOnce();
  });

  it("stops responding to scroll events after destroy", () => {
    vi.spyOn(inputEl, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 300, left: 50, right: 500,
      width: 450, height: 200, x: 50, y: 100,
      toJSON: () => ({}),
    } as DOMRect);

    const result = createToggleButton(inputEl, makeCallbacks());
    const host = lastHost();
    const topBefore = host.style.top;

    result.destroy();

    vi.spyOn(inputEl, "getBoundingClientRect").mockReturnValue({
      top: 900, bottom: 999, left: 0, right: 999,
      width: 999, height: 99, x: 0, y: 900,
      toJSON: () => ({}),
    } as DOMRect);

    window.dispatchEvent(new Event("scroll"));
    expect(host.style.top).toBe(topBefore);
  });

  it("stops responding to Escape key after destroy", () => {
    const result = createToggleButton(inputEl, makeCallbacks());
    const launcher = lastShadow().querySelector("button.coach-toggle") as HTMLButtonElement;
    const menu = lastShadow().querySelector(".mini-menu")!;
    launcher.click();
    result.destroy();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    // Menu was open before destroy — after destroy the host is gone but the
    // listener must not throw or affect remaining DOM.
    expect(menu.classList.contains("open")).toBe(true);
  });
});

describe("createToggleButton — styles", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;
  let css: string;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    result = createToggleButton(inputEl, makeCallbacks());
    css = lastShadow().querySelector("style")!.textContent ?? "";
  });

  afterEach(() => {
    result.destroy();
    document.body.removeChild(inputEl);
  });

  it("styles include the base .coach-toggle rule", () => {
    expect(css).toContain(".coach-toggle");
  });

  it("styles include the .coach-toggle.active rule", () => {
    expect(css).toContain(".coach-toggle.active");
  });

  it("styles include the .mini-menu rule", () => {
    expect(css).toContain(".mini-menu");
  });

  it("styles include the .menu-item rule", () => {
    expect(css).toContain(".menu-item");
  });

  it("base rule uses pointer-events all so the button is clickable inside the none host", () => {
    expect(css).toContain("pointer-events: all");
  });

  it("active rule uses a blue color to signal popup-open state", () => {
    expect(css).toContain("#3b82f6");
  });
});
