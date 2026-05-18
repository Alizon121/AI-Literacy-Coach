import { describe, it, expect } from "vitest";
import { isWorthEvaluating } from "../utils/preFilter";

describe("isWorthEvaluating", () => {
  describe("length gate", () => {
    it("rejects prompts shorter than 15 characters", () => {
      expect(isWorthEvaluating("too short", "")).toBe(false);
    });

    it("rejects prompts at exactly 14 characters", () => {
      expect(isWorthEvaluating("a".repeat(14), "")).toBe(false);
    });

    it("accepts prompts at exactly 15 characters", () => {
      expect(isWorthEvaluating("a".repeat(15), "")).toBe(true);
    });

    it("accepts prompts longer than 15 characters", () => {
      expect(isWorthEvaluating("Tell me about quantum physics", "")).toBe(true);
    });
  });

  describe("duplicate gate", () => {
    it("rejects a prompt identical to the last evaluated", () => {
      const prompt = "Tell me about machine learning";
      expect(isWorthEvaluating(prompt, prompt)).toBe(false);
    });

    it("accepts a prompt that differs from the last evaluated", () => {
      expect(
        isWorthEvaluating(
          "Tell me about deep learning",
          "Tell me about machine learning"
        )
      ).toBe(true);
    });

    it("accepts any prompt when lastEvaluated is empty", () => {
      expect(isWorthEvaluating("Tell me about quantum physics", "")).toBe(true);
    });
  });

  describe("combined gates", () => {
    it("rejects a short duplicate (both gates fail)", () => {
      expect(isWorthEvaluating("hi", "hi")).toBe(false);
    });

    it("rejects a long duplicate (length passes, duplicate fails)", () => {
      const prompt = "What is the meaning of life the universe and everything";
      expect(isWorthEvaluating(prompt, prompt)).toBe(false);
    });
  });
});
