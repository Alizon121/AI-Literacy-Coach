const MIN_LENGTH = 15;

export function isWorthEvaluating(prompt: string, lastEvaluated: string): boolean {
  return prompt.length >= MIN_LENGTH && prompt !== lastEvaluated;
}
