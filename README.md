<p align="center">
  <h1 align="center">BooCap</h1>
  <p align="center">AI-powered chapter summaries for your EPUB library</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/electron-41-47848F?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/vue-3-4FC08D?logo=vuedotjs" alt="Vue 3" />
  <img src="https://img.shields.io/badge/typescript-5.9-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tailwindcss-v4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
</p>

---

BooCap is a desktop app that parses EPUB books, extracts chapters, and generates per-chapter summaries using LLM APIs. Upload a book, pick your AI provider, and get readable summaries cached locally — no cloud storage, no subscriptions.

## Features

- **EPUB Parsing** — Automatically extracts chapters, filters out non-content sections (copyright, appendix, etc.)
- **Multi-Provider AI** — Choose between Anthropic, OpenAI, Google, or Groq (free tier available)
- **Local-First** — All data stored in a local SQLite database. Your books and summaries never leave your machine
- **Real-Time Progress** — Live progress updates while chapters are being summarized
- **Token-Aware Preprocessing** — Duplicate chapters are skipped, noisy whitespace is collapsed, repeated chapter titles are trimmed, and very long inputs are cut on cleaner boundaries before they reach a model
- **Rate-Limit Resilient** — Built-in retry with exponential backoff to handle API throttling
- **Chapter Navigation** — Browse summaries chapter-by-chapter with a sidebar interface
- **Input Validation** — Uploads fail early if the EPUB path is invalid or the selected provider key is missing

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An API key from one of the supported providers

### Installation

```bash
git clone https://github.com/Giapa/boocap.git
cd boocap
npm install
npx electron-rebuild   # required for native SQLite module
```

### Running

```bash
npm run dev
```

## How It Works

1. **Upload** — Select an EPUB file through the native file dialog
2. **Parse** — Chapters are extracted and filtered by content length and title
3. **Summarize** — Each cleaned chapter is sent to your chosen LLM provider with retry-on-rate-limit behavior instead of a fixed per-chapter delay
4. **Cache** — Summaries are stored in SQLite so you only pay for generation once
5. **Read** — Browse chapter summaries anytime, even offline

## Quality Guardrails

- `npm run typecheck` validates both the Electron main process and the Vue renderer
- `npm run lint` enforces a stricter baseline for consistency and imports
- `npm run test` covers settings validation, prompt preparation, response parsing, and summarization retry logic

## Architecture

```
shared/types/            Single source of truth for types
main/
  db/                    SQLite initialization
  repositories/          Data access
  services/              Business logic and orchestration
  llm/                   Provider interface + implementations
  ipc/                   Thin IPC handler layer
  events.ts              Typed EventEmitter
  preload.ts             Context bridge
renderer/src/
  features/              Feature modules (book, reading, settings)
    */composables/       Decoupled logic via Vue composables
  shared/
    components/          Reusable base components
    composables/         App-wide composables (navigation, notifications, progress)
```
