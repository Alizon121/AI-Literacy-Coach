const MIN_LENGTH = 15;
export function isWorthEvaluating(prompt, lastEvaluated) {
  return prompt.length >= MIN_LENGTH && prompt !== lastEvaluated;
}
