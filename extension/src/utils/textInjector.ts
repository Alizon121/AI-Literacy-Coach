export function injectSuggestedText(inputEl: HTMLElement, suggestedText: string): void {
  if (inputEl.tagName === "TEXTAREA" || inputEl.tagName === "INPUT") {
    // Use native property descriptor to bypass React's synthetic event system
    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    if (nativeInputSetter) {
      nativeInputSetter.call(inputEl, suggestedText);
    }

    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (inputEl.getAttribute("contenteditable") === "true") {
    // ContentEditable (ChatGPT, Claude.ai, Gemini) — use execCommand for undo-stack compatibility
    inputEl.focus();
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, suggestedText);
  }
}
