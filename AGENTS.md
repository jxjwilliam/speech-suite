# STT/TTS Hybrid App — AGENTS.md

## Quick start

```bash
npm install        # install deps
npm run dev        # http://localhost:3000

# Verify (cheapest first):
npm run type-check   # tsc --noEmit — do this before build
npm run lint         # next lint
npm run build        # next build

# Tests (optional — will fail on coverage, no tests written yet):
npm run test         # jest — coverage threshold 70% blocks with 0 tests
```

All scripts in `package.json`. No pre-commit hooks, no CI.

## Required env vars

`OPENAI_API_KEY` is **required** at runtime (used by `/api/transcribe`, `/api/synthesize`, `/api/chat`).

Optional: `GOOGLE_CLOUD_*`, `AZURE_SPEECH_*`.

⚠️ `.env.local` currently contains live API keys — avoid committing changes to it.

## Architecture

**Next.js 14 App Router** — single-page app with 3 tabs (STT / TTS / Settings).

```
app/layout.tsx              — root layout, react-hot-toast Toaster
app/page.tsx                — all state lives here (useState lifts from children)
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
  ui/                   — 33 shadcn/ui primitives

lib/utils.ts            — cn() helper (clsx + tailwind-merge), getLanguageName() map
types/speech.d.ts       — Web Speech API type declarations (SpeechRecognition, etc.)
proposals/              — 7 files: PRD + user prompt + proposals from 5 LLMs
```

**State management**: All state in `app/page.tsx` — lifted `useState` passed as props. No context, no store.

**Path alias**: `@/` maps to repo root (tsconfig.json `paths`). Import like `@/components/ui/button`.

**`next-env.d.ts`** is auto-generated — do not edit.

## Key quirks

- **No tests exist** — Jest configured (next/jest, jsdom, coverage 70%), but `npm test` will fail on coverage. Write tests before running coverage checks.
- **Jest config typo**: `moduleNameMapping` (line 13) should be `moduleNameMapper` — fix before tests need path resolution.
- **`tsconfig.json` `target: "es5"`** — leftover shadcn/ui default. Do not change without verifying downstream compat.
- **Audio visualizer is a demo** — uses `Math.random()`, not real audio analysis.
- **`ANALYSIS_AND_PLAN.md`** exists but is empty.
- **`.specify/memory/constitution.md`** is a template — all `[PLACEHOLDER]`, no binding rules.
- **`.cursor/commands/`** references `.specify/scripts/bash/` — those scripts DO exist but are part of a Cursor/Specify workflow. For OpenCode, use direct tool execution.
- **Vercel** sets `maxDuration: 30s` on all `app/api/**/*.ts` routes. CORS headers on `/api/*`. Rewrites for `/api/transcribe`, `/api/synthesize`, `/api/chat`.

## TypeScript & code conventions

- **strict: true** in tsconfig — avoid `as any`, `@ts-ignore`, `@ts-expect-error`.
- **Radix UI / shadcn/ui** design system — prefer existing components over new dependencies.
- **Framer Motion** available for animations.
- **`lucide-react`** for icons.

## Docker

```bash
npm run docker:build   # docker build -t speech-suite .
npm run docker:compose # docker-compose up -d (app + optional nginx sidecar)
```

Dockerfile uses Next.js **standalone** output mode. Health check at `/api/health` (curl, 30s interval).

## Proposals

`proposals/` contains the PRD and 5 LLM proposals (ChatGPT, Claude, Gemini, Grok, Perplexity) that informed the design. The `.cursorrules` file references these for synthesis — treat as reference material.
