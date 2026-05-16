import { createRoot } from "react-dom/client";
import { CoachingPopup } from "../ui/CoachingPopup";
import { injectSuggestedText } from "../utils/textInjector";
import type { CoachingResponse } from "../types";

export function mountPopup(
  shadow: ShadowRoot,
  suggestion: CoachingResponse,
  inputEl: HTMLElement,
  onDismiss: () => void
): () => void {
  const container = document.createElement("div");
  container.style.pointerEvents = "all";
  shadow.appendChild(container);

  const root = createRoot(container);

  root.render(
    <CoachingPopup
      suggestion={suggestion}
      onApply={(suggestedText) => {
        injectSuggestedText(inputEl, suggestedText);
        chrome.runtime.sendMessage({ type: "SUGGESTION_ACCEPTED" });
        onDismiss();
      }}
      onDismiss={() => {
        chrome.runtime.sendMessage({ type: "SUGGESTION_DISMISSED" });
        onDismiss();
      }}
    />
  );

  return () => {
    root.unmount();
    container.remove();
  };
}
