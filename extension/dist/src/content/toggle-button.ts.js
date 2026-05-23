const SIZE = 28;
export function createToggleButton(inputEl, onClick) {
  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed",
    zIndex: "2147483646",
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    pointerEvents: "none"
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
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.textContent = "Get AI feedback on your prompt";
  button.appendChild(tooltip);
  shadow.appendChild(button);
  document.body.appendChild(host);
  const reposition = () => {
    const rect = inputEl.getBoundingClientRect();
    host.style.top = `${rect.top + 2}px`;
    host.style.left = `${rect.right - SIZE - 20}px`;
  };
  reposition();
  const resizeObserver = new ResizeObserver(reposition);
  resizeObserver.observe(inputEl);
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition, { passive: true });
  return {
    anchorEl: host,
    setActive: (active) => {
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    },
    destroy: () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
      host.remove();
    }
  };
}
function styles() {
  return `
    .coach-toggle {
      width: ${SIZE}px;
      height: ${SIZE}px;
      border-radius: 40%;
      border: grey 0.1px solid;
      background: #fff;
      color: #3b82f6;
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
      position: relative;
      transition: opacity 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    }
    .coach-toggle:hover {
      opacity: 1;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .coach-toggle.active {
      border: #3b82f6 0.1px solid;
      color: #3b82f6;
      opacity: 0.5;
      box-shadow: 0 2px 6px rgba(37,99,235,0.4);
    }
    .coach-toggle.active:hover {
      opacity: 1;
      box-shadow: 0 4px 12px rgba(37,99,235,0.5);
    }
    .tooltip {
      visibility: hidden;
      width: max-content;
      max-width: 200px;
      background-color: #333;
      color: #fff;
      font-size: 11px;
      font-weight: 400;
      text-align: center;
      border-radius: 4px;
      padding: 5px 8px;
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      pointer-events: none;
      white-space: nowrap;
      transition: opacity 0.2s ease 1s;
    }
    .coach-toggle:hover .tooltip {
      visibility: visible;
      opacity: 1;
    }
  `;
}
