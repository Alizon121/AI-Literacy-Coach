export interface ToggleButton {
  setActive: (active: boolean) => void;
  destroy: () => void;
}

const SIZE = 28;

export function createToggleButton(
  inputEl: HTMLElement,
  onClick: () => void
): ToggleButton {
  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed",
    zIndex: "2147483646",
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    pointerEvents: "none",
  });

  const shadow = host.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = styles();
  shadow.appendChild(styleEl);

  const button = document.createElement("button");
  button.className = "coach-toggle";
  button.setAttribute("aria-label", "AI Literacy Coach");
  button.textContent = "C";
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  shadow.appendChild(button);

  document.body.appendChild(host);

  const reposition = () => {
    const rect = inputEl.getBoundingClientRect();
    host.style.top = `${rect.bottom - SIZE - 8}px`;
    host.style.left = `${rect.right - SIZE - 8}px`;
  };

  reposition();

  const resizeObserver = new ResizeObserver(reposition);
  resizeObserver.observe(inputEl);
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition, { passive: true });

  return {
    setActive: (active: boolean) => {
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    },
    destroy: () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
      host.remove();
    },
  };
}

function styles(): string {
  return `
    .coach-toggle {
      width: ${SIZE}px;
      height: ${SIZE}px;
      border-radius: 50%;
      border: none;
      background: #6b7280;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      font-family: system-ui, -apple-system, sans-serif;
      letter-spacing: 0.03em;
      cursor: pointer;
      pointer-events: all;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.65;
      transition: opacity 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    }
    .coach-toggle:hover {
      opacity: 1;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .coach-toggle.active {
      background: #2563eb;
      opacity: 1;
      box-shadow: 0 2px 6px rgba(37,99,235,0.4);
    }
  `;
}
