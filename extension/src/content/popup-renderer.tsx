import { createRoot } from "react-dom/client";
import { CoachingPopup } from "../ui/CoachingPopup";
import { injectSuggestedText } from "../utils/textInjector";
import { suppressNextEvaluation } from "./observer";
import type { CoachingResponse } from "../types";

function formatResetTime(seconds: number): string {
  if (seconds <= 0) return "a little while";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);
  if (hours >= 1) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

function RateLimitMessage({ resetInSeconds, onDismiss }: { resetInSeconds: number; onDismiss: () => void }) {
  return (
    <div className="popup">
      <div className="popup-header">
        <div className="popup-header-left">
          <span>AI Literacy Coach</span>
          <span className="badge badge-warn">limit reached</span>
        </div>
        <button className="icon-btn" aria-label="Close" onClick={onDismiss}>✕</button>
      </div>
      <div className="popup-body">
        <p>Daily token limit reached. Try again in {formatResetTime(resetInSeconds)}.</p>
      </div>
    </div>
  );
}

export function mountRateLimitMessage(
  shadow: ShadowRoot,
  resetInSeconds: number,
  onDismiss: () => void
): () => void {
  const container = document.createElement("div");
  container.style.pointerEvents = "all";
  shadow.appendChild(container);

  const root = createRoot(container);
  root.render(<RateLimitMessage resetInSeconds={resetInSeconds} onDismiss={onDismiss} />);

  return () => {
    root.unmount();
    container.remove();
  };
}

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
        suppressNextEvaluation();
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
