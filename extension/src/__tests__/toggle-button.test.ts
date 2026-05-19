import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createToggleButton } from "../content/toggle-button";
import type { ToggleButton } from "../content/toggle-button";

// ResizeObserver is not provided by jsdom — stub it globally.
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

// Helper: returns the shadow root of the last appended host element.
function lastShadow(): ShadowRoot {
  return (document.body.lastElementChild as HTMLElement).shadowRoot!;
}

function lastHost(): HTMLElement {
  return document.body.lastElementChild as HTMLElement;
}

describe("createToggleButton — DOM structure", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    result = createToggleButton(inputEl, vi.fn());
  });

  afterEach(() => {
    result.destroy();
    document.body.removeChild(inputEl);
  });

  it("appends a host element to document.body", () => {
    // inputEl + host = at least 2 children
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
    const btn = lastShadow().querySelector("button")!;
    expect(btn.getAttribute("aria-label")).toBe("AI Literacy Coach");
  });

  it("button displays the coach label text", () => {
    const btn = lastShadow().querySelector("button")!;
    expect(btn.textContent).toBe("C");
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

  it("positions bottom-right corner inside the input element on creation", () => {
    vi.spyOn(inputEl, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 300, left: 50, right: 500,
      width: 450, height: 200, x: 50, y: 100,
      toJSON: () => ({}),
    } as DOMRect);

    result = createToggleButton(inputEl, vi.fn());
    const host = lastHost();

    // top  = rect.bottom − SIZE − 8 = 300 − 28 − 8 = 264
    expect(host.style.top).toBe("264px");
    // left = rect.right  − SIZE − 8 = 500 − 28 − 8 = 464
    expect(host.style.left).toBe("464px");
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

    result = createToggleButton(inputEl, vi.fn());
    window.dispatchEvent(new Event("scroll"));

    // top = 400 − 28 − 8 = 364
    expect(lastHost().style.top).toBe("364px");
  });

  it("observes the input element with ResizeObserver", () => {
    result = createToggleButton(inputEl, vi.fn());
    expect(mockResizeObserver.observe).toHaveBeenCalledWith(inputEl);
  });
});

describe("createToggleButton — click interaction", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;
  let onClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    onClick = vi.fn();
    result = createToggleButton(inputEl, onClick);
  });

  afterEach(() => {
    result.destroy();
    document.body.removeChild(inputEl);
  });

  it("calls onClick when the button is clicked", () => {
    const btn = lastShadow().querySelector("button") as HTMLButtonElement;
    btn.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("calls onClick each time the button is clicked", () => {
    const btn = lastShadow().querySelector("button") as HTMLButtonElement;
    btn.click();
    btn.click();
    btn.click();
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});

describe("createToggleButton — setActive", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;
  let btn: HTMLButtonElement;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    result = createToggleButton(inputEl, vi.fn());
    btn = lastShadow().querySelector("button") as HTMLButtonElement;
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
    const result = createToggleButton(inputEl, vi.fn());
    const host = lastHost();
    expect(document.body.contains(host)).toBe(true);
    result.destroy();
    expect(document.body.contains(host)).toBe(false);
  });

  it("disconnects the ResizeObserver", () => {
    const result = createToggleButton(inputEl, vi.fn());
    result.destroy();
    expect(mockResizeObserver.disconnect).toHaveBeenCalledOnce();
  });

  it("stops responding to scroll events after destroy", () => {
    vi.spyOn(inputEl, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 300, left: 50, right: 500,
      width: 450, height: 200, x: 50, y: 100,
      toJSON: () => ({}),
    } as DOMRect);

    const result = createToggleButton(inputEl, vi.fn());
    const host = lastHost();
    const topBefore = host.style.top;

    result.destroy();

    // Mutate the mock rect so a reposition call would produce different output
    vi.spyOn(inputEl, "getBoundingClientRect").mockReturnValue({
      top: 900, bottom: 999, left: 0, right: 999,
      width: 999, height: 99, x: 0, y: 900,
      toJSON: () => ({}),
    } as DOMRect);

    window.dispatchEvent(new Event("scroll"));
    // Position must not have changed because the listener was removed
    expect(host.style.top).toBe(topBefore);
  });
});

describe("createToggleButton — styles", () => {
  let inputEl: HTMLTextAreaElement;
  let result: ToggleButton;
  let css: string;

  beforeEach(() => {
    inputEl = document.createElement("textarea");
    document.body.appendChild(inputEl);
    result = createToggleButton(inputEl, vi.fn());
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

  it("base rule uses border-radius 50% for circular shape", () => {
    expect(css).toContain("border-radius: 50%");
  });

  it("base rule uses pointer-events all so the button is clickable inside the none host", () => {
    expect(css).toContain("pointer-events: all");
  });

  it("active rule uses a blue background to signal popup-open state", () => {
    expect(css).toContain("#2563eb");
  });
});
