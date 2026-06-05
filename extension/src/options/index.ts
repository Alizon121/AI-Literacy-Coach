import { getSettings, saveSettings } from "../background/storage";

const KNOWN_GROQ_MODELS = ["llama-3.3-70b-versatile", "llama3-8b-8192", "gemma2-9b-it"];

(async () => {
  const settings = await getSettings();

  const backendLocal          = document.getElementById("backend-local")           as HTMLInputElement;
  const backendGroq           = document.getElementById("backend-groq")            as HTMLInputElement;
  const groqConfig            = document.getElementById("groq-config")             as HTMLElement;
  const localConfig           = document.getElementById("local-config")            as HTMLElement;
  const apiKeyInput           = document.getElementById("apiKey")                  as HTMLInputElement;
  const groqModelSelect       = document.getElementById("groqModel")               as HTMLSelectElement;
  const groqCustomModelField  = document.getElementById("groq-custom-model-field") as HTMLElement;
  const groqCustomModelInput  = document.getElementById("groqModelCustom")         as HTMLInputElement;
  const modelInput            = document.getElementById("model")                   as HTMLInputElement;
  const serverPortInput       = document.getElementById("serverPort")              as HTMLInputElement;
  const coachingToggle        = document.getElementById("coachingEnabled")         as HTMLInputElement;
  const sensitivitySel        = document.getElementById("sensitivity")             as HTMLSelectElement;
  const delaySlider           = document.getElementById("triggerDelay")            as HTMLInputElement;
  const delayLabel            = document.getElementById("delay-label")             as HTMLSpanElement;
  const saveBtn               = document.getElementById("save")                    as HTMLButtonElement;
  const statusEl              = document.getElementById("status")                  as HTMLSpanElement;

  // Populate fields from stored settings
  const useGroq = !!settings.apiKey;
  backendLocal.checked   = !useGroq;
  backendGroq.checked    = useGroq;
  groqConfig.hidden      = !useGroq;
  localConfig.hidden     = useGroq;
  apiKeyInput.value      = settings.apiKey;

  const isKnownModel = KNOWN_GROQ_MODELS.includes(settings.groqModel);
  groqModelSelect.value          = isKnownModel ? settings.groqModel : "custom";
  groqCustomModelInput.value     = isKnownModel ? "" : settings.groqModel;
  groqCustomModelField.hidden    = isKnownModel;

  modelInput.value       = settings.model;
  serverPortInput.value  = String(settings.serverPort);
  coachingToggle.checked = settings.coachingEnabled;
  sensitivitySel.value   = String(settings.sensitivity);
  delaySlider.value      = String(settings.triggerDelay);
  delayLabel.textContent = `${settings.triggerDelay}ms`;

  // Show/hide backend config panels
  const syncBackendVisibility = () => {
    const isGroq = backendGroq.checked;
    groqConfig.hidden = !isGroq;
    localConfig.hidden = isGroq;
  };
  backendLocal.addEventListener("change", syncBackendVisibility);
  backendGroq.addEventListener("change", syncBackendVisibility);

  // Show/hide custom model input
  groqModelSelect.addEventListener("change", () => {
    groqCustomModelField.hidden = groqModelSelect.value !== "custom";
  });

  // Live delay label + wheel scroll
  delaySlider.addEventListener("input", () => {
    delayLabel.textContent = `${delaySlider.value}ms`;
  });
  delaySlider.addEventListener("wheel", (e) => {
    e.preventDefault();
    const step = parseInt(delaySlider.step, 10) || 250;
    const min  = parseInt(delaySlider.min, 10);
    const max  = parseInt(delaySlider.max, 10);
    const next = parseInt(delaySlider.value, 10) + (e.deltaY < 0 ? step : -step);
    delaySlider.value = String(Math.min(max, Math.max(min, next)));
    delayLabel.textContent = `${delaySlider.value}ms`;
  }, { passive: false });

  // Save
  saveBtn.addEventListener("click", async () => {
    try {
      const resolvedGroqModel =
        groqModelSelect.value === "custom"
          ? groqCustomModelInput.value.trim() || "llama-3.3-70b-versatile"
          : groqModelSelect.value;

      await saveSettings({
        apiKey:          backendGroq.checked ? apiKeyInput.value.trim() : "",
        groqModel:       resolvedGroqModel,
        model:           modelInput.value.trim() || "phi4-mini",
        serverPort:      parseInt(serverPortInput.value, 10) || 8000,
        coachingEnabled: coachingToggle.checked,
        sensitivity:     parseInt(sensitivitySel.value, 10) as 1 | 2 | 3,
        triggerDelay:    parseInt(delaySlider.value, 10),
      });

      statusEl.textContent = "Saved!";
      statusEl.style.color = "#16a34a";
    } catch (err) {
      statusEl.textContent = "Error saving settings.";
      statusEl.style.color = "#dc2626";
      console.error("[AI Literacy Coach] Failed to save settings:", err);
    }
    setTimeout(() => { statusEl.textContent = ""; }, 2000);
  });
})();
