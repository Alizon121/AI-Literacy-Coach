// Site-specific selectors tried first; if none match, falls through to generic detection.
// Only add a site here when the generic fallback picks up the wrong element.
const SITE_SELECTORS: Record<string, string[]> = {
  "chat.openai.com": ["#prompt-textarea"],
  "chatgpt.com":     ["#prompt-textarea"],
};

export function findActiveInput(): HTMLElement | null {
  const hostname = window.location.hostname;
  const selectors = SITE_SELECTORS[hostname];

  if (selectors) {
    for (const sel of selectors) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) return el;
    }
    // Selector registered but element not found — fall through to generic detection
  }

  const candidates: HTMLElement[] = [
    ...Array.from(document.querySelectorAll<HTMLElement>("textarea")),
    ...Array.from(document.querySelectorAll<HTMLElement>('[contenteditable="true"]')),
    ...Array.from(document.querySelectorAll<HTMLElement>('[role="textbox"]')),
  ];

  return (
    candidates.find((el) => el === document.activeElement) ??
    candidates[candidates.length - 1] ??
    null
  );
}
