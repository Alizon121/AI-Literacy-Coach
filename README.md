# AI Literacy Coach

A Chrome browser extension that provides real-time prompt coaching while using AI platforms. It evaluates prompts for clarity, specificity, and grammar, then offers constructive feedback via an inline popup.

## Architecture

```
AI-literacy-coach/
├── backend/              # Local FastAPI server (Python 3.13)
│   ├── main.py           # FastAPI app + /health + /evaluate endpoints
│   ├── response_parser.py  # 4-layer JSON extraction from model output
│   └── requirements.txt
└── extension/            # Chrome extension (MV3)
    ├── manifest.json
    ├── src/
    │   ├── background/   # Service worker — routes messages, calls backend
    │   ├── content/      # Content scripts — observes input, renders popup
    │   ├── ui/           # React popup component
    │   └── utils/        # inputDetector, preFilter, textInjector
    └── vite.config.ts    # Vite + CRXJS build
```

**Call flow:** User types → `observer.ts` debounces → sends `EVALUATE_PROMPT` to service worker → service worker calls FastAPI → FastAPI calls Ollama → result returned to observer → popup rendered via Shadow DOM.

## Setup (Power Users)

### 1. Install Ollama

Download and install the Ollama app from [ollama.com](https://ollama.com). This is the local model runtime — it must be running before the backend will work.

Then install the Python SDK and pull the model:

```bash
pip install ollama
ollama pull llama3 (or wahtever llama model you prefer)
```

Start ollama using 

```bash
ollama serve
```

### 2. Start the backend

```bash
cd backend
source .venv/bin/activate
fastapi dev main.py
```

The server runs at `http://localhost:8000`. Verify it's up: `curl http://localhost:8000/health`

### 3. Build the extension

```bash
cd extension
npm install
npm run dev       # dev mode with hot reload
```

### 4. Load in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension/dist/` folder


## Supported platforms

Claude.ai · ChatGPT · Gemini · Perplexity · Mistral · Microsoft Copilot

## Notes for Power-Users

- All prompt data stays on your device — nothing is sent to external servers.
- The extension fails silently if the backend is offline; check the browser console for setup instructions.
- To add Firefox support, add the `browser_specific_settings` gecko block to `manifest.json`.

## Setup (Non-power Users)
- Install the extension from Google Chrome Web Store
    - The extension will work out of the box and use the groq api to handle prompt generation.

- Go to console.groq.com and register for an API KEY
    - Create an account
    - Navigate to API Keys
    - And create an API Key

- Copy and Paste the API Key obtained from console.groq.com intothe Groq API Key field in the extension's options page