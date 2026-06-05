import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoachingPopup } from "../ui/CoachingPopup";
import type { CoachingResponse } from "../types";

const LOOKS_GOOD: CoachingResponse = {
  needs_improvement: false,
  observation: null,
  why_it_matters: null,
  suggested_prompt: null,
};

const WITH_SUGGESTION: CoachingResponse = {
  needs_improvement: true,
  observation: "The prompt is too vague to produce a focused answer.",
  why_it_matters: "A specific prompt helps the AI understand the scope of your question.",
  suggested_prompt:
    "Explain the three main types of machine learning — supervised, unsupervised, and reinforcement — with one real-world example each.",
};

describe("CoachingPopup — looks good state", () => {
  it("renders the looks-good badge", () => {
    render(<CoachingPopup suggestion={LOOKS_GOOD} onApply={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText("looks good")).toBeInTheDocument();
  });

  it("does not render the suggestion badge", () => {
    render(<CoachingPopup suggestion={LOOKS_GOOD} onApply={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.queryByText("suggestion")).not.toBeInTheDocument();
  });

  it("calls onDismiss when the close button is clicked", () => {
    const onDismiss = vi.fn();
    render(<CoachingPopup suggestion={LOOKS_GOOD} onApply={vi.fn()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does not render tab navigation", () => {
    render(<CoachingPopup suggestion={LOOKS_GOOD} onApply={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.queryByText("observation")).not.toBeInTheDocument();
    expect(screen.queryByText("why it matters")).not.toBeInTheDocument();
  });
});

describe("CoachingPopup — suggestion state", () => {
  it("renders the suggestion badge", () => {
    render(<CoachingPopup suggestion={WITH_SUGGESTION} onApply={vi.fn()} onDismiss={vi.fn()} />);
    // The word "suggestion" appears in both the badge <span> and the tab <button>;
    // target the badge span specifically by selector.
    expect(screen.getByText("suggestion", { selector: "span" })).toBeInTheDocument();
  });

  it("shows the observation tab content by default", () => {
    render(<CoachingPopup suggestion={WITH_SUGGESTION} onApply={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText(WITH_SUGGESTION.observation!)).toBeInTheDocument();
  });

  it("switches to why-it-matters content when that tab is clicked", () => {
    render(<CoachingPopup suggestion={WITH_SUGGESTION} onApply={vi.fn()} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByText("why it matters"));
    expect(screen.getByText(WITH_SUGGESTION.why_it_matters!)).toBeInTheDocument();
  });

  it("switches to the suggestion text when suggestion tab is clicked", () => {
    render(<CoachingPopup suggestion={WITH_SUGGESTION} onApply={vi.fn()} onDismiss={vi.fn()} />);
    // Click the tab button specifically, not the badge span.
    fireEvent.click(screen.getByRole("button", { name: "suggestion" }));
    expect(screen.getByText(WITH_SUGGESTION.suggested_prompt!)).toBeInTheDocument();
  });

  it("calls onApply with suggested_prompt when Apply is clicked", () => {
    const onApply = vi.fn();
    render(<CoachingPopup suggestion={WITH_SUGGESTION} onApply={onApply} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByText("Apply suggestion"));
    expect(onApply).toHaveBeenCalledOnce();
    expect(onApply).toHaveBeenCalledWith(WITH_SUGGESTION.suggested_prompt);
  });

  it("calls onDismiss when Dismiss is clicked", () => {
    const onDismiss = vi.fn();
    render(<CoachingPopup suggestion={WITH_SUGGESTION} onApply={vi.fn()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText("Dismiss"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does not render Apply button when suggested_prompt is null", () => {
    const noSuggestion: CoachingResponse = {
      ...WITH_SUGGESTION,
      suggested_prompt: null,
    };
    render(<CoachingPopup suggestion={noSuggestion} onApply={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.queryByText("Apply suggestion")).not.toBeInTheDocument();
  });

  it("adds the collapsed class when the collapse button is clicked", () => {
    const { container } = render(
      <CoachingPopup suggestion={WITH_SUGGESTION} onApply={vi.fn()} onDismiss={vi.fn()} />
    );
    fireEvent.click(screen.getByLabelText("Collapse"));
    expect(container.querySelector(".popup.collapsed")).toBeInTheDocument();
  });

  it("removes the collapsed class when expanded again", () => {
    const { container } = render(
      <CoachingPopup suggestion={WITH_SUGGESTION} onApply={vi.fn()} onDismiss={vi.fn()} />
    );
    fireEvent.click(screen.getByLabelText("Collapse"));
    fireEvent.click(screen.getByLabelText("Expand"));
    expect(container.querySelector(".popup.collapsed")).not.toBeInTheDocument();
  });
});
