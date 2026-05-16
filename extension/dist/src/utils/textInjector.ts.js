export function injectSuggestedText(inputEl, suggestedText) {
  if (inputEl.tagName === "TEXTAREA" || inputEl.tagName === "INPUT") {
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
    inputEl.focus();
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, suggestedText);
  }
}
