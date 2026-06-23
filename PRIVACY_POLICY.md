# Privacy Policy — AI Literacy Coach

**Last updated: June 15, 2026**

## Overview

AI Literacy Coach is a browser extension that helps you write clearer, more effective prompts when using AI platforms. This policy explains what data is handled, where it goes, and what we never do with it.

## Data We Do Not Collect

The developer of AI Literacy Coach does **not** collect, store, transmit, or have access to any of the following:

- Your prompt text or any content you type
- Your Groq API key or any credentials
- Browsing history or activity on AI platforms
- Personal information of any kind
- Usage analytics or telemetry

## Data Handled Locally on Your Device

The extension stores the following in Chrome's built-in `chrome.storage.sync` (synced across your own signed-in Chrome instances, never sent to the developer):

- **Extension settings** — your chosen backend (local or Groq), model preferences, coaching sensitivity, feedback delay, and whether coaching is enabled
- **Your Groq API key** (if you choose to use the Groq backend) — stored only in your Chrome profile
- **Aggregate usage counts** — a local tally of prompts evaluated and suggestions accepted/dismissed. These counts never leave your device.

## Prompt Text and Third-Party Services

When the coach evaluates a prompt, the text you have typed is sent to whichever AI backend you have configured:

### Local backend (Ollama)
If you use the local backend, your prompt is sent to a server running on your own machine (`http://localhost`). It never leaves your device.

### Groq cloud backend
If you configure a Groq API key, your prompt is sent to **Groq's API** (`https://api.groq.com`) for evaluation. In this case, Groq's own privacy policy and terms of service apply to that data. You can review them at [https://groq.com/privacy-policy](https://groq.com/privacy-policy).

The extension only contacts Groq when you have explicitly provided a Groq API key in the settings. No prompt data is ever sent to the extension developer.

## Permissions

The extension requests the following Chrome permissions:

| Permission | Why it is needed |
|---|---|
| `storage` | To save your settings and local usage counts |
| `activeTab` | To detect the text input area on supported AI platforms |
| `scripting` | To inject the coaching UI into supported AI platforms |
| Host permissions for supported AI sites | To run the content script on Claude, ChatGPT, Gemini, and other supported platforms |
| Host permission for `api.groq.com` | To contact the Groq API when the Groq backend is configured |

## Children's Privacy

This extension is not directed at children under the age of 13 and does not knowingly collect any information from children.

## Changes to This Policy

If this policy changes materially, the "Last updated" date above will be revised. Continued use of the extension after a change constitutes acceptance of the updated policy.

## Contact

If you have questions about this privacy policy, please open an issue at the project's GitHub repository.
