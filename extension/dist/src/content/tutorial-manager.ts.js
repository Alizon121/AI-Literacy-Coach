const STEPS = [
  {
    title: "Welcome to AI Literacy Coach",
    body: "I watch your prompts as you type and suggest improvements to help you get better results from AI."
  },
  {
    title: "Automatic suggestions",
    body: "When I detect a prompt that could be clearer or more specific, a coaching popup will appear automatically after you pause typing."
  },
  {
    title: "This button is your control",
    body: "Click it anytime to request feedback on what you've typed, or to dismiss an active suggestion."
  },
  {
    title: "One thing to know",
    body: "Suggestions are AI-generated and may vary between evaluations of the same prompt. Nothing changes unless you click Apply — you're always in control."
  }
];
const DISCLAIMER_STEP = STEPS.length - 1;
function isTutorialComplete() {
  return new Promise((resolve) => {
    chrome.storage.local.get("tutorialComplete", (result) => {
      resolve(!!result.tutorialComplete);
    });
  });
}
function markTutorialComplete() {
  chrome.storage.local.set({ tutorialComplete: true });
}
export async function maybeStartTutorial(anchorHost) {
  const complete = await isTutorialComplete();
  if (complete) return;
  startTutorial(anchorHost);
}
function startTutorial(anchorHost) {
  let currentStep = 0;
  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed",
    zIndex: "2147483647",
    width: "280px",
    pointerEvents: "none"
  });
  const shadow = host.attachShadow({ mode: "open" });
  const styleEl = document.createElement("style");
  styleEl.textContent = styles();
  shadow.appendChild(styleEl);
  const card = document.createElement("div");
  card.className = "card";
  card.style.pointerEvents = "all";
  shadow.appendChild(card);
  const arrow = document.createElement("div");
  arrow.className = "arrow";
  shadow.appendChild(arrow);
  document.body.appendChild(host);
  function reposition() {
    const rect = anchorHost.getBoundingClientRect();
    const cardWidth = 280;
    const anchorCenterX = rect.left + rect.width / 2;
    const idealLeft = anchorCenterX - cardWidth / 2;
    const clampedLeft = Math.max(8, Math.min(idealLeft, window.innerWidth - cardWidth - 8));
    const distFromBottom = window.innerHeight - rect.top;
    host.style.bottom = `${distFromBottom + 10}px`;
    host.style.left = `${clampedLeft}px`;
    const arrowLeft = anchorCenterX - clampedLeft;
    arrow.style.left = `${arrowLeft}px`;
  }
  function render() {
    const step = STEPS[currentStep];
    const isLast = currentStep === STEPS.length - 1;
    card.innerHTML = "";
    const header = document.createElement("div");
    header.className = "header";
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = step.title;
    const skipBtn = document.createElement("button");
    skipBtn.className = "skip-btn";
    skipBtn.textContent = "Skip";
    skipBtn.style.visibility = isLast ? "hidden" : "visible";
    skipBtn.addEventListener("click", () => {
      currentStep = DISCLAIMER_STEP;
      render();
      reposition();
    });
    header.appendChild(title);
    header.appendChild(skipBtn);
    const body = document.createElement("p");
    body.className = "body";
    body.textContent = step.body;
    const footer = document.createElement("div");
    footer.className = "footer";
    const dots = document.createElement("div");
    dots.className = "dots";
    STEPS.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = i === currentStep ? "dot dot-active" : "dot";
      dots.appendChild(dot);
    });
    const nextBtn = document.createElement("button");
    nextBtn.className = isLast ? "next-btn next-btn-final" : "next-btn";
    nextBtn.textContent = isLast ? "Got it" : "Next";
    nextBtn.addEventListener("click", () => {
      if (isLast) {
        dismiss();
      } else {
        currentStep++;
        render();
        reposition();
      }
    });
    footer.appendChild(dots);
    footer.appendChild(nextBtn);
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
  }
  function dismiss() {
    markTutorialComplete();
    resizeObserver.disconnect();
    window.removeEventListener("scroll", reposition);
    window.removeEventListener("resize", reposition);
    host.remove();
  }
  const resizeObserver = new ResizeObserver(reposition);
  resizeObserver.observe(anchorHost);
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition, { passive: true });
  render();
  reposition();
}
function styles() {
  return `
    .card {
      width: 280px;
      background: #1e293b;
      color: #f1f5f9;
      border-radius: 10px;
      padding: 14px 16px 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .title {
      font-weight: 600;
      font-size: 13px;
      color: #f1f5f9;
    }
    .skip-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 12px;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
    }
    .skip-btn:hover { color: #cbd5e1; }
    .body {
      margin: 0 0 12px;
      color: #cbd5e1;
      font-size: 13px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #475569;
      display: inline-block;
    }
    .dot-active { background: #3b82f6; }
    .next-btn {
      background: #3b82f6;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 5px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease;
    }
    .next-btn:hover { background: #2563eb; }
    .next-btn-final { background: #16a34a; }
    .next-btn-final:hover { background: #15803d; }
    .arrow {
      position: fixed;
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 7px solid #1e293b;
      transform: translateX(-50%);
      pointer-events: none;
    }
  `;
}
