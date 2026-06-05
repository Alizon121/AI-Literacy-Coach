const SIZE = 28;
export function createToggleButton(inputEl, callbacks) {
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
  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";
  const button = document.createElement("button");
  button.className = "coach-toggle";
  button.setAttribute("aria-label", "AI Literacy Coach");
  button.setAttribute("aria-haspopup", "true");
  button.textContent = "C";
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.textContent = "AI Literacy Coach";
  button.appendChild(tooltip);
  const menu = document.createElement("div");
  menu.className = "mini-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-hidden", "true");
  const feedbackBtn = makeMenuItem("💬  Get prompt feedback");
  const disableBtn = makeMenuItem("⏸  Pause on this site", true);
  menu.appendChild(feedbackBtn);
  menu.appendChild(disableBtn);
  wrapper.appendChild(button);
  wrapper.appendChild(menu);
  shadow.appendChild(wrapper);
  document.body.appendChild(host);
  let menuOpen = false;
  const openMenu = () => {
    menuOpen = true;
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
  };
  const closeMenu = () => {
    menuOpen = false;
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
  };
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    menuOpen ? closeMenu() : openMenu();
  });
  feedbackBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMenu();
    callbacks.onGetFeedback();
  });
  disableBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMenu();
    callbacks.onTogglePause();
  });
  const handleOutsideClick = () => {
    if (menuOpen) closeMenu();
  };
  const handleEscape = (e) => {
    if (e.key === "Escape" && menuOpen) closeMenu();
  };
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);
  const reposition = () => {
    const rect = inputEl.getBoundingClientRect();
    host.style.top = `${rect.top + 2}px`;
    host.style.left = `${rect.right - SIZE - 30}px`;
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
    setPaused: (paused) => {
      button.classList.toggle("paused", paused);
      feedbackBtn.hidden = paused;
      disableBtn.textContent = paused ? "▶  Resume coaching" : "⏸  Pause on this site";
      disableBtn.classList.toggle("menu-item--danger", !paused);
    },
    destroy: () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      host.remove();
    }
  };
}
function makeMenuItem(label, isDanger = false) {
  const btn = document.createElement("button");
  btn.className = isDanger ? "menu-item menu-item--danger" : "menu-item";
  btn.setAttribute("role", "menuitem");
  btn.textContent = label;
  return btn;
}
function styles() {
  return `
    [hidden] { display: none !important; }
    .wrapper {
      position: relative;
      width: ${SIZE}px;
      height: ${SIZE}px;
    }
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
    .coach-toggle.paused {
      border: #9ca3af 0.1px solid;
      color: #9ca3af;
      opacity: 0.5;
    }
    .coach-toggle.paused:hover {
      opacity: 1;
    }
    .mini-menu {
      display: none;
      flex-direction: column;
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      background: #1f2937;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      padding: 4px;
      min-width: 190px;
      pointer-events: all;
      z-index: 1;
    }
    .mini-menu.open {
      display: flex;
    }
    .menu-item {
      display: flex;
      align-items: center;
      padding: 9px 12px;
      border-radius: 7px;
      border: none;
      background: transparent;
      color: #f9fafb;
      font-size: 12px;
      font-weight: 500;
      font-family: system-ui, -apple-system, sans-serif;
      cursor: pointer;
      text-align: left;
      width: 100%;
      white-space: nowrap;
      pointer-events: all;
    }
    .menu-item:hover {
      background: rgba(255,255,255,0.1);
    }
    .menu-item--danger {
      color: #fca5a5;
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
