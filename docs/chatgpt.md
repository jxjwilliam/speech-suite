# Adding Multi-Media Audio & Speech Features in Next.js (Whisper + ElevenLabs)

This guide explains how to integrate speech-to-text (Whisper) and text-to-speech (ElevenLabs) features into a Next.js app, using Cursor IDE for development.

---

## 1. Core Flow

1. **Input**: Capture microphone or upload audio file  
2. **Speech-to-Text**: Send audio → Whisper (OpenAI or local Ollama)  
3. **Processing**: Text → (optional) AI pipeline  
4. **Text-to-Speech**: Send text → ElevenLabs API → get audio  
5. **Output**: Play the audio in browser  

---

## 2. Setup in Next.js

### Install Packages

```bash
npm install openai elevenlabs multer
```

If running Whisper locally (e.g., with Ollama), expose a local API endpoint. Otherwise, use OpenAI’s Whisper API.

---

## 3. API Routes in Next.js

Create routes under `app/api` (Next.js 13+) or `pages/api` (Next.js 12).

### (a) Whisper Speech-to-Text (STT)

```ts
// app/api/stt/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  const tempPath = path.join('/tmp', file.name);
  await writeFile(tempPath, Buffer.from(await file.arrayBuffer()));

  const transcript = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: fs.createReadStream(tempPath),
  });

  return NextResponse.json({ text: transcript.text });
}
```

**Client:**

```ts
async function uploadAudio(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/stt', { method: 'POST', body: formData });
  return res.json();
}
```

---

### (b) ElevenLabs Text-to-Speech (TTS)

```ts
// app/api/tts/route.ts
import { NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';

const eleven = new ElevenLabsClient({ apiKey: process.env.ELEVEN_API_KEY });

export async function POST(req: Request) {
  const { text } = await req.json();
  const audio = await eleven.generate({
    voice: "Rachel",
    model_id: "eleven_multilingual_v2",
    text,
  });

  return new NextResponse(audio, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
```

**Client:**

```ts
async function playSpeech(text: string) {
  const res = await fetch('/api/tts', {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: { 'Content-Type': 'application/json' },
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
}
```

---

## 4. UI Integration

- Add a **Record** button using `MediaRecorder` API to capture microphone audio → upload to `/api/stt`
- Display transcript text
- Add **Speak** button → calls `/api/tts` to playback audio response

---

## 5. Cursor IDE Setup

- Cursor can generate scaffolds for API routes and React hooks easily
- Add `.env.local`:

```env
OPENAI_API_KEY=sk-xxxx
ELEVEN_API_KEY=eleven_xxxx
```

Cursor will assist with autocomplete and context-aware refactoring for these routes.

---

## 6. Extensions / Multi-Media

- Handle **uploaded MP3/WAV/MP4** → send to Whisper
- Add **streaming** for live conversation (Whisper real-time / ElevenLabs WebSocket)
- Combine with **vector DB (e.g., LlamaIndex)** for retrieval-augmented dialogue

---

### ✅ Summary

This integration enables your Next.js app to support both **speech-to-text** and **text-to-speech** features. You can easily extend it into a full **voice-enabled chat app** or **AI assistant interface**.

---

> **Tip:** Decide whether you want real-time streaming (for live conversations) or batch mode (record → transcribe → reply → speak) depending on your app's use case.
