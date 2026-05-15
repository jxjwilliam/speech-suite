# STT/TTS Hybrid App — AGENTS.md

## Quick start

```bash
# Install & run
npm install
npm run dev        # http://localhost:3000

# Verify
npm run type-check   # tsc --noEmit (run before build)
npm run lint         # next lint
npm run test         # jest (no tests exist yet — coverage thresholds will fail)
npm run build        # next build
```

All scripts in `package.json`. No pre-commit hooks, no CI.

## Required env vars

`OPENAI_API_KEY` is **required** at runtime (used by `/api/transcribe`, `/api/synthesize`, `/api/chat`). Optional: `GOOGLE_CLOUD_*`, `AZURE_SPEECH_*`.

⚠️ `.env.local` currently contains live API keys — avoid committing changes to it.

## Project architecture

**Next.js 14 App Router** — single-page app with tabs (STT / TTS / Settings).

### File layout

```
app/layout.tsx              — root layout, react-hot-toast Toaster
app/page.tsx                — single page, all state lives here (useState lifts from children)
app/globals.css             — Tailwind + shadcn/ui CSS vars, dark mode via .dark class
app/api/transcribe/route.ts — OpenAI Whisper (POST multipart audio file)
app/api/synthesize/route.ts — OpenAI TTS (POST JSON { text, voice, model })
app/api/chat/route.ts       — OpenAI gpt-4o-mini (POST JSON { message, conversationHistory })
app/api/health/route.ts     — health check, reports service availability

components/
  speech-to-text.tsx    — Web Speech API + file upload + API fallback
  text-to-speech.tsx    — Web Speech synthesis + API fallback
  settings-panel.tsx    — provider/language/voice/pitch/rate switches
  audio-visualizer.tsx  — 20-bar animated viz (demo — uses Math.random)
  ui/                   — 33 shadcn/ui primitives (button, card, tabs, slider, etc.)

lib/utils.ts            — cn() helper (clsx + tailwind-merge), getLanguageName() map
types/speech.d.ts       — Web Speech API type declarations (SpeechRecognition, etc.)
proposals/              — 7 files: PRD + user prompt + proposals from 5 LLMs
.specify/               — Cursor development workflow framework (unfilled constitution)
```

### Path alias

`@/` maps to repo root (standard `tsconfig.json` `paths`). Import like `@/components/ui/button`.

### State management

All state lives in `app/page.tsx` — lifted `useState` passed as props to child components. No context, no store.

## Key quirks

- **No tests exist** — Jest is configured (next/jest, jsdom, coverage threshold 70%) but `jest test` will fail on coverage. Write tests before running coverage checks.
- **Jest config typo**: `moduleNameMapping` should be `moduleNameMapper` — fix before tests need path resolution.
- **`tsconfig.json` `target: "es5"`** — leftover shadcn/ui default. Don't change without verifying downstream compat.
- **Audio visualizer is a demo** — uses `Math.random()`, not real audio analysis.
- **`.specify/memory/constitution.md` is a template** — all `[PLACEHOLDER]` values, no binding rules.
- **`ANALYSIS_AND_PLAN.md`** exists but is empty.
- **Vercel config** sets API route `maxDuration: 30s` for all routes under `app/api/**/*.ts`.

## Deployment

```bash
# Docker
npm run docker:build   # docker build -t stt-tts-app .
npm run docker:compose # docker-compose up -d (app + nginx reverse proxy)

# Vercel (vercel.json configured)
# API rewrites for /api/transcribe, /api/synthesize, /api/chat
# CORS headers on /api/* routes
```

## Docker compose

Runs `app` + optional `nginx` sidecar. Health check at `/api/health` (curl, 30s interval). Environment vars injected from host shell.

## Commands from `.cursor/commands/`

The repo uses a Specify workflow with Cursor commands (`/plan`, `/implement`, `/analyze`). These reference `.specify/scripts/bash/` shell scripts that may not exist yet. When using OpenCode, treat these as reference only — use direct tool execution instead.

## Guidance for agents

- **Single commit repo** — no commit history to mine for patterns.
- **TypeScript strict mode** is on — avoid `as any` and `@ts-ignore`.
- **Radix UI-based design system** — prefer existing shadcn/ui patterns over adding new dependencies.
- **No CI pipeline** — run `type-check && lint && test && build` manually for verification.
- **`.env.local` has live keys** — never copy its contents into generated output or commits.
- **Proposals in `proposals/`** — contains PRD and 5 LLM proposals for reference. The `.cursorrules` treats this app as a synthesis of those proposals.
