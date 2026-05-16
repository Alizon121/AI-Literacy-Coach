export function findActiveInput() {
  const candidates = [
    ...Array.from(document.querySelectorAll("textarea")),
    ...Array.from(document.querySelectorAll('[contenteditable="true"]')),
    ...Array.from(document.querySelectorAll('[role="textbox"]'))
  ];
  return candidates.find((el) => el === document.activeElement) ?? candidates[candidates.length - 1] ?? null;
}
