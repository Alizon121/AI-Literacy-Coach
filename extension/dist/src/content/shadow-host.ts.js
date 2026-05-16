import { getPopupStyles } from "/src/content/popup-styles.ts.js";
export function createShadowHost(inputEl) {
  const host = document.createElement("div");
  const rect = inputEl.getBoundingClientRect();
  Object.assign(host.style, {
    position: "fixed",
    zIndex: "2147483647",
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: "360px",
    pointerEvents: "none"
  });
  const shadow = host.attachShadow({ mode: "open" });
  const styleEl = document.createElement("style");
  styleEl.textContent = getPopupStyles();
  shadow.appendChild(styleEl);
  document.body.appendChild(host);
  const stopTracking = trackPosition(host, inputEl);
  return { host, shadow, stopTracking };
}
function trackPosition(host, inputEl) {
  const reposition = () => {
    const rect = inputEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popupHeight = 320;
    if (spaceBelow < popupHeight + 16) {
      host.style.top = `${rect.top - popupHeight - 8}px`;
    } else {
      host.style.top = `${rect.bottom + 8}px`;
    }
    host.style.left = `${rect.left}px`;
  };
  const resizeObserver = new ResizeObserver(reposition);
  resizeObserver.observe(inputEl);
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition, { passive: true });
  return () => {
    window.removeEventListener("scroll", reposition);
    window.removeEventListener("resize", reposition);
    resizeObserver.disconnect();
  };
}
