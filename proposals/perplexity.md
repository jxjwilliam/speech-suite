
Based on the attached STT_TTS_PRD.md requirements, please generate a full architectural plan, including a file structure proposal, and a brief proof-of-concept code snippet for the core STT processing loop. Focus on robustness and scalability.

# STT/TTS Hybrid LLM Implementation Plan — Cursor IDE

**One-line summary:** Build a Speech-to-Text (STT) / Text-to-Speech (TTS) application that queries multiple LLMs (ChatGPT, Perplexity, Grok, Gemini, Claude), collects and normalizes their implementation proposals, ingests them into a Cursor IDE workspace, and uses automated analysis + human-in-the-loop review to synthesize a hybrid, best-practice implementation.

---

## Goals & Success Criteria

* Support real-time or near-real-time STT→LLM→TTS flows.
* Compare LLM proposals consistently and automatically.
* Produce a hybrid implementation plan that optimizes accuracy, latency, cost, and maintainability.
* Keep artifacts (proposals, analyses, prototypes) inside Cursor workspace for traceability.

**Primary metrics:** transcription WER, TTS naturalness MOS (subjective), latency (ms), cost per 1,000 requests, and engineering complexity score.

---

## High-level architecture

```
[Mic / Audio File] -> STT Engine -> Text Normalizer -> LLM Orchestrator (multi-LLM queries)
       ↓                                        ↓
     Logs                                  /---> Proposal Normalizer ---> /data/proposal-*.json
       ↓                                  /                                    ↓
  Local DB / Storage --------------------/                                     Analysis Engine (Cursor + scripts)
                                                                                 ↓
                                                                            Hybrid Plan -> Implementation (STT + LLM selection + TTS)
```

---

## Folder structure (Cursor workspace)

```
stt-tts-hybrid-llm/
├─ .env
├─ package.json
├─ src/
│  ├─ stt/                # STT adapters (whisper, web-speech, cloud STT)
│  ├─ tts/                # TTS adapters (elevenlabs, google, openai-tts)
│  ├─ api/                # LLM connectors & orchestrator
│  │   ├─ chatgpt.ts
│  │   ├─ perplexity.ts
│  │   ├─ gemini.ts
│  │   ├─ grok.ts
│  │   ├─ claude.ts
│  │   └─ collectProposals.ts
│  ├─ analysis/           # scoring, hybridization, utilities
│  ├─ data/               # saved proposals and results
│  ├─ ui/                 # optional Next.js UI for demo
│  └─ scripts/            # helpers (run-local, tests)
├─ README.md
└─ data/
   ├─ proposals-<ts>.json
   └─ analysis-<ts>.json
```

---

## Quick setup (commands)

```bash
# create project folder and init
mkdir stt-tts-hybrid-llm && cd stt-tts-hybrid-llm
npm init -y
npm install axios openai fs-extra dotenv
# add other SDKs later (elevenlabs, whisper client, or vendor SDKs)
```

Create `.env` (example):

```
OPENAI_API_KEY=
PERPLEXITY_API_KEY=
GEMINI_API_KEY=
GROK_API_KEY=
CLAUDE_API_KEY=
STT_PROVIDER_KEY=
TTS_PROVIDER_KEY=
```

---

## Normalized proposal JSON schema

Save every LLM response to the same schema so Cursor and scripts can easily analyze.

```json
{
  "id": "uuid-timestamp",
  "source": "ChatGPT|Perplexity|Gemini|Grok|Claude",
  "prompt": "<exact prompt sent>",
  "summary": "<one-paragraph summary>",
  "components": [
    { "name": "STT", "suggestion": "use whisper", "pros": [], "cons": [], "code": "<snippet>" },
    { "name": "LLM_arch", "suggestion": "retrieval + chain-of-thought", "pros": [], "cons": [], "code": "<snippet>" }
  ],
  "estimated_cost": { "monthly": 0, "notes": "approx" },
  "confidence": "low|medium|high",
  "raw": "<raw full-text-response>",
  "created_at": "2025-10-04T12:00:00Z"
}
```

---

## LLM Connector templates (TypeScript) — pattern

Create one adapter per LLM that returns the normalized schema. Example (ChatGPT / OpenAI SDK):

```ts
// src/api/chatgpt.ts
import OpenAI from "openai";
import { normalize } from "../analysis/normalize";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function chatGPTProposal(prompt: string) {
  const r = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1200
  });
  const text = r.choices[0].message.content;
  return normalize({ source: "ChatGPT", prompt, raw: text });
}
```

For other LLMs, implement the same function signature `async function XProposal(prompt)` that returns the normalized object. If an LLM lacks a public SDK, wrap their HTTP API using `axios` and handle rate-limits & retries.

---

## Orchestrator: collect + persist proposals

```ts
// src/api/collectProposals.ts
import fs from 'fs-extra';
import { chatGPTProposal } from './chatgpt';
// import other adapters

export async function collectAll(prompt: string) {
  const adapters = [chatGPTProposal /*, perplexityProposal, geminiProposal, grokProposal, claudeProposal */];
  const results = await Promise.allSettled(adapters.map(a => a(prompt)));

  const proposals = results.map((r, i) => ({
    source: r.status === 'fulfilled' ? r.value.source : `Error-${i}`,
    normalized: r.status === 'fulfilled' ? r.value : { error: String((r as any).reason) }
  }));

  const file = `./data/proposals-${Date.now()}.json`;
  await fs.writeJson(file, proposals, { spaces: 2 });
  return { file, proposals };
}
```

Run: `node ./src/api/collectProposals.js "Design an STT/TTS implementation"` — this will create a JSON file in `/data`.

---

## Analysis & scoring (automated rules + LLM-assisted evaluation)

1. **Define scoring rubric** (weights configurable):

   * Accuracy / Quality (40%)
   * Latency (20%)
   * Cost (15%)
   * Complexity / Dev effort (15%)
   * Privacy / Compliance (10%)

2. **Automated scoring**: parse each `proposal.normalized.components` and compute numeric scores (0–100) per metric.

3. **LLM-assisted scoring**: optionally send normalized proposals to a strong evaluator LLM (e.g., GPT-4o) with a system prompt "Score these proposals using the rubric" to get third-party judgment.

**Example skeleton:**

```ts
// src/analysis/score.ts
export function scoreProposal(p) {
  const scores = { accuracy: 70, latency: 60, cost: 50, complexity: 40, privacy: 80 };
  const weighted = (scores.accuracy*0.4 + scores.latency*0.2 + scores.cost*0.15 + scores.complexity*0.15 + scores.privacy*0.1);
  return { scores, weighted };
}
```

Save `analysis-<ts>.json` with ranking across sources.

---

## Hybridization logic (how to merge proposals)

Approaches:

* **Best-of-breed composition:** pick the best STT suggestion from one source, best TTS from another, best prompt engineering or retrieval technique from a third.
* **Weighted voting / ensemble:** use scores to weight proposals; if >60% weight favors a specific design decision, lock it in.
* **Conflict resolution policy:** when two proposals contradict, prefer lower-latency and lower-cost option for MVP; prefer privacy-preserving option for product release.

**Algorithm sketch:**

1. Collect all unique design choices per component (STT, TTS, caching, retrieval, prompt flow).
2. For each design choice, compute `score = Σ(source_weight * normalized_score_for_choice)`.
3. Pick top choice per component.
4. Create combined architecture and run quick PoC tests for sanity.

---

## Cursor IDE-specific workflow (practical steps)

1. **Open Cursor → New Project** and point to your `stt-tts-hybrid-llm` folder (or create it in Cursor).
2. Drop `/data` and `/src` files into the workspace.
3. Use Cursor’s inline AI to `Open` a proposals file and run prompts like:

   * `Summarize this proposal in 6 bullet points and extract recommended components.`
   * `Compare these five proposals and produce a ranked summary (table) using the rubric: accuracy, latency, cost, complexity.`
   * `Generate a hybrid architecture.md combining top ideas from Proposal A and Proposal B — include a minimal Next.js server scaffolding.`
4. Save Cursor’s generated outputs into `/analysis` (e.g., `analysis/proposal-comparison.md`, `analysis/hybrid-plan.md`).
5. Use Cursor to refactor code: select code & `Ask AI` for improvements or to generate unit tests.

**Cursor prompt examples** (copy into Cursor):

```
Read these files: ./data/proposals-*.json
Summarize key tradeoffs for STT, and produce a recommended MVP implementation (short list of 5 tasks) with commands to run tests.
```

```
Compare proposals and make a table: source | STT | TTS | retrieval | estimated monthly cost | score.
```

---

## Prototyping & testing

1. Implement minimal PoCs for the top 2 candidate pipelines (e.g., Whisper+GPT+ElevenLabs vs Google STT+Gemini+OpenAI-TTS).
2. Create a small test harness that runs a set of audio clips through both pipelines and records: latency, WER (against transcripts), MOS (human label), and cost.
3. Store results to `/data/benchmarks-<ts>.json` and load into Cursor for analysis.

Sample test runner command:

```bash
node ./scripts/run-benchmarks.js --samples ./samples --pipelines pipelineA,pipelineB
```

---

## CI / Deployment

* Use GitHub for source control. Push project to a private repo.
* Use GitHub Actions to run tests and linting.
* Deploy frontend demo to Vercel; backend serverless functions to Vercel or a small Node server on a VM.
* Secrets (API keys) should be stored in GitHub Secrets and in Cursor’s `.env` (locally only).

---

## Checklist (step-by-step)

1. Create Cursor project and folder structure.
2. Add `.env` with keys.
3. Implement adapters for each LLM returning normalized proposals.
4. Implement `collectProposals` orchestration and store outputs in `/data`.
5. Implement `analysis/score.ts` and produce `analysis-<ts>.json`.
6. Use Cursor prompts to generate `analysis/hybrid-plan.md`.
7. Prototype the top 2-3 hybrid architectures.
8. Run benchmarks and iterate.
9. Finalize architecture and create implementation issues / tasks.
10. Deploy demo and monitor metrics.

---

## Helpful prompts (copy/paste)

**Prompt to send to each LLM (uniform):**

```
You are an expert system architect for STT/TTS systems. Given the following goals: real-time transcription, <languages>, latency <200ms>, budget <$X/month, privacy must be Y, propose a production-ready implementation for a web/Node environment. Include: recommended STT engine (or approach), TTS engine, LLM architecture/pattern (retrieval, caching), data flow diagram, sample code snippets, estimated costs and confidence level. Output in JSON with keys: summary, components, code, cost_estimate, confidence.
```

**Prompt for Cursor to analyze proposals:**

```
Open all files under /data (proposals-*.json). Produce: 1) a 6-bullet summary per source; 2) a comparison table using rubric accuracy/latency/cost/complexity/privacy; 3) a hybrid plan for MVP with top-5 implementation tasks and file skeletons.
```

---

## Next steps (optional deliverables I can prepare for you)

* A ready-to-import Cursor project scaffold (folder + starter files + .env.example).
* A `collectProposals` runnable script with mock adapters for each LLM.
* `analysis/score.ts` + a sample `analysis/hybrid-plan.md` filled with initial outputs.

---

## Notes & best practices

* Log every prompt/response for traceability and reproducibility.
* Normalize outputs early — it makes all downstream analysis simpler.
* Start small: pick 2 LLMs for the first iteration to validate the pipeline before expanding to all five.
* Keep privacy and data residency in mind when sending audio/transcripts to cloud providers.

---

*Document generated: `stt-tts-hybrid-llm-plan.md` — open in Cursor to download or edit further.*
