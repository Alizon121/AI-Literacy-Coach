export function injectSuggestedText(inputEl: HTMLElement, suggestedText: string): void {
  if (inputEl.tagName === "TEXTAREA" || inputEl.tagName === "INPUT") {
    // Use native property descriptor to bypass React's synthetic event system
    const proto = inputEl.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeInputSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

    if (nativeInputSetter) {
      nativeInputSetter.call(inputEl, suggestedText);
    }

    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (inputEl.isContentEditable) {
    inputEl.focus();
    if (inputEl.hasAttribute("data-lexical-editor")) {
      // Lexical (Perplexity): execCommand does not sync with Lexical's internal selection
      // state. Set the browser selection first, then defer the paste by one tick so
      // Lexical's selectionchange handler can sync the "all selected" range into its
      // EditorState before paste fires — otherwise Lexical inserts at the cursor instead
      // of replacing the full content.
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(inputEl);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      setTimeout(() => {
        const dt = new DataTransfer();
        dt.setData("text/plain", suggestedText);
        inputEl.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dt }));
      }, 0);
    } else {
      // ProseMirror, React contenteditable (ChatGPT, Claude.ai, Gemini, Mistral, Copilot, etc.)
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(inputEl);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      document.execCommand("insertText", false, suggestedText);
    }
  }
}
