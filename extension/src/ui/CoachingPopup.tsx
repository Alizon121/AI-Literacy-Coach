import { useState } from "react";
import type { CoachingResponse } from "../types";

type Tab = "observation" | "why_it_matters" | "suggestion";

interface Props {
  suggestion: CoachingResponse;
  onApply: (text: string) => void;
  onDismiss: () => void;
}

export function CoachingPopup({ suggestion, onApply, onDismiss }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("observation");

  if (!suggestion.needs_improvement) {
    return (
      <div className="popup">
        <div className="popup-header">
          <div className="popup-header-left">
            <span>AI Literacy Coach</span>
            <span className="badge badge-success">looks good</span>
          </div>
          <button className="icon-btn" onClick={onDismiss} aria-label="Close">✕</button>
        </div>
      </div>
    );
  }

  const tabContent: Record<Tab, string | null> = {
    observation: suggestion.observation,
    why_it_matters: suggestion.why_it_matters,
    suggestion: suggestion.suggested_prompt,
  };

  const tabLabels: Record<Tab, string> = {
    observation: "observation",
    why_it_matters: "why it matters",
    suggestion: "suggestion",
  };

  return (
    <div className={`popup${collapsed ? " collapsed" : ""}`}>
      <div className="popup-header" onClick={() => setCollapsed((c) => !c)}>
        <div className="popup-header-left">
          <span>AI Literacy Coach</span>
          <span className="badge badge-warn">suggestion</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" aria-label={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? "▼" : "▲"}
          </button>
          <button
            className="icon-btn"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="tab-row">
        {(["observation", "why_it_matters", "suggestion"] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`tab${activeTab === tab ? " active" : ""}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="popup-body">
        {activeTab === "suggestion" ? (
          <div className="suggested-prompt">{tabContent.suggestion}</div>
        ) : (
          <p>{tabContent[activeTab]}</p>
        )}
      </div>

      <div className="popup-footer">
        <button className="btn-dismiss" onClick={onDismiss}>Dismiss</button>
        {suggestion.suggested_prompt && (
          <button className="btn-apply" onClick={() => onApply(suggestion.suggested_prompt!)}>
            Apply suggestion
          </button>
        )}
      </div>
    </div>
  );
}
