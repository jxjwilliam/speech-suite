# STT/TTS Hybrid App — Setup & Usage Guide

## Setup

### Prerequisites

- **Node.js 18+** and npm
- **OpenAI API key** (required for transcription, TTS, and chat)
- Google Cloud or Azure credentials (optional — alternative providers)

### Installation

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd stt-tts-hybrid-app

# 2. Install dependencies
npm install

# 3. Set up environment
cp env.example .env.local
```

Edit `.env.local` and add your API key:

```env
OPENAI_API_KEY=sk-...
```

Optional providers:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
AZURE_SPEECH_KEY=your-key
AZURE_SPEECH_REGION=eastus
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app has three tabs: **Speech-to-Text**, **Text-to-Speech**, and **Settings**.

### Verify it works

```bash
# Confirm the app is running
curl http://localhost:3000/api/health

# Full verification (no tests exist yet, so coverage will fail — that's expected)
npm run type-check && npm run lint && npm run build
```

---

## How to Use

### Speech-to-Text Tab

**Two ways to transcribe audio:**

**1. Live microphone recording** (best for real-time dictation)

- Click the large circular microphone button to start.
- Grant microphone permission when prompted by your browser.
- Speak — your words appear in the Transcript panel in real time.
- Click the red microphone button to stop.

> Only available in browsers that support the Web Speech API (Chrome, Edge, Safari). Unsupported browsers see only the file upload option.

**2. Upload an audio file** (best for pre-recorded clips)

- Click the dashed upload area or drag a file onto it.
- Accepted formats: MP3, WAV, M4A, WebM. Max file size: **25 MB**.
- After selecting a file, click **Process Audio**.
- The audio is sent to the `/api/transcribe` endpoint (OpenAI Whisper).
- The transcript appears in the Transcript panel.

**Export a transcript:**

- Click the download icon (top-right of the Transcript card) to save as a `.txt` file.

### Text-to-Speech Tab

- Type or paste text into the textarea.
- Click **Speak** to synthesize it.
- While playing, additional controls appear: **Pause/Resume**, **Stop**.
- If audio was generated (API path only, not browser speech), a **Download** button appears to save the audio as `.mp3`.

**Two synthesis modes:**

| Provider | Behavior |
|---|---|
| **Browser** (Web Speech API) | Synthesized instantly in-browser. No download available. |
| **OpenAI / Google / Azure** | API call returns an audio file. Supports pause, stop, and download. |

### Settings Tab

Configure everything before or during use:

| Setting | Options | Default |
|---|---|---|
| **STT Provider** | OpenAI Whisper / Google Cloud / Azure Speech / Browser Web Speech API | OpenAI |
| **TTS Provider** | OpenAI TTS / Google Cloud TTS / Azure Speech TTS / Browser Web Speech API | OpenAI |
| **Language** | 80+ languages (`en-US`, `zh-CN`, `ja-JP`, `ko-KR`, etc.) | en-US |
| **Voice** | Depends on TTS provider (see table below) | alloy |
| **Speech Rate** | 0.5x – 2.0x (slider, 0.1 steps) | 1.0 |
| **Speech Pitch** | 0.5x – 2.0x (slider, 0.1 steps) | 1.0 |

Click **Save** to apply changes, or **Reset** to revert to defaults.

**Voices per provider:**

| Provider | Voices |
|---|---|
| OpenAI | `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer` |
| Google Cloud | Standard-A through J, Wavenet-A through J (20 voices) |
| Azure | AriaNeural, DavisNeural, GuyNeural, JaneNeural, etc. (16 voices) |
| Browser | System-dependent (set to `default`) |

---

## API Endpoints

These are consumed by the UI but can also be called directly:

### `POST /api/transcribe`

Transcribe an audio file using OpenAI Whisper.

```
Content-Type: multipart/form-data
Body: audio=<file>
```

Returns JSON with `text`, `language`, `duration`, and `words` (with timestamps).

### `POST /api/synthesize`

Convert text to speech using OpenAI TTS.

```json
{ "text": "Hello world", "voice": "alloy", "model": "tts-1" }
```

Returns `audio/mpeg` binary.

### `POST /api/chat`

Send a message to GPT-4o-mini.

```json
{ "message": "Hello", "conversationHistory": [] }
```

Returns JSON with `response` and `usage`.

### `GET /api/health`

Health check. Reports available services (openai/google/azure) based on configured env vars.

---

## Provider Quick Reference

| Provider | Requires | STT | TTS | Cost |
|---|---|---|---|---|
| **Browser (Web Speech API)** | Nothing | ✓ (Chrome/Edge/Safari only) | ✓ | Free |
| **OpenAI** | `OPENAI_API_KEY` | ✓ (Whisper) | ✓ (TTS) | Per-token |
| **Google Cloud** | `GOOGLE_CLOUD_PROJECT_ID` | ✓ | ✓ | Per-minute |
| **Azure** | `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` | ✓ | ✓ | Per-hour |

> The Browser provider works without any API key but is limited to ~70 languages and lower accuracy.

---

## Docker Deployment

```bash
# Build the image
npm run docker:build

# Run with docker-compose (app + optional nginx reverse proxy)
npm run docker:compose

# Health check
curl http://localhost:3000/api/health
```

Environment variables are injected from your host shell at runtime, so export them before running:

```bash
export OPENAI_API_KEY=sk-...
npm run docker:compose
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Mic button does nothing | Browser doesn't support Web Speech API | Use Chrome/Edge, or switch to file upload |
| Microphone permission denied | Browser permission blocked | Check browser site settings, grant mic access |
| "Failed to transcribe audio" | `OPENAI_API_KEY` missing or invalid | Check `.env.local`, restart dev server |
| "Failed to synthesize speech" | Same as above | Same as above |
| API routes returning 500 | Missing env var, or API quota exceeded | Check server console for detailed error |
| No sound on Speak | Audio autoplay blocked by browser | Click the page first, then try again |
| `npm run test` fails on coverage | No tests written yet | Add tests before running coverage checks |
| Any fetch error in console | Dev server not running or port mismatch | Confirm `npm run dev` is on port 3000 |
