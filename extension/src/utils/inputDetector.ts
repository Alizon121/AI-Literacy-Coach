export function findActiveInput(): HTMLElement | null {
  const candidates: HTMLElement[] = [
    ...Array.from(document.querySelectorAll<HTMLElement>("textarea")),
    ...Array.from(document.querySelectorAll<HTMLElement>('[contenteditable="true"]')),
    ...Array.from(document.querySelectorAll<HTMLElement>('[role="textbox"]')),
  ];

  return (
    candidates.find((el) => el === document.activeElement) ??
    candidates[candidates.length - 1] ??
    null
  );
}
