import { describe, it, expect, vi, beforeEach } from "vitest";
import { injectSuggestedText } from "../utils/textInjector";

describe("injectSuggestedText", () => {
  describe("textarea", () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
      textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
    });

    afterEach(() => {
      document.body.removeChild(textarea);
    });

    it("sets the textarea value to the suggested text", () => {
      injectSuggestedText(textarea, "What are the key properties of quantum entanglement?");
      expect(textarea.value).toBe("What are the key properties of quantum entanglement?");
    });

    it("dispatches an input event after injection", () => {
      const inputHandler = vi.fn();
      textarea.addEventListener("input", inputHandler);
      injectSuggestedText(textarea, "Describe neural networks in simple terms");
      expect(inputHandler).toHaveBeenCalledOnce();
    });

    it("dispatches a change event after injection", () => {
      const changeHandler = vi.fn();
      textarea.addEventListener("change", changeHandler);
      injectSuggestedText(textarea, "Describe neural networks in simple terms");
      expect(changeHandler).toHaveBeenCalledOnce();
    });

    it("replaces existing content with new text", () => {
      textarea.value = "original user prompt here";
      injectSuggestedText(textarea, "How do convolutional neural networks process image data?");
      expect(textarea.value).toBe("How do convolutional neural networks process image data?");
    });
  });

  describe("contenteditable", () => {
    let div: HTMLDivElement;

    beforeEach(() => {
      div = document.createElement("div");
      div.setAttribute("contenteditable", "true");
      document.body.appendChild(div);
      document.execCommand = vi.fn(() => true);
    });

    afterEach(() => {
      document.body.removeChild(div);
    });

    it("calls execCommand selectAll to clear existing content", () => {
      injectSuggestedText(div, "Summarize the key findings in transformer architecture research");
      expect(document.execCommand).toHaveBeenCalledWith("selectAll", false);
    });

    it("calls execCommand insertText with the suggested text", () => {
      const text = "Summarize the key findings in transformer architecture research";
      injectSuggestedText(div, text);
      expect(document.execCommand).toHaveBeenCalledWith("insertText", false, text);
    });

    it("focuses the element before inserting", () => {
      const focusSpy = vi.spyOn(div, "focus");
      injectSuggestedText(div, "Some suggested text for the contenteditable element");
      expect(focusSpy).toHaveBeenCalled();
    });
  });

});
