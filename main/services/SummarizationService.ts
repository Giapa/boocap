import type { LLMProvider } from "../llm";
import type { Chapter } from "../../shared/types";

const DELAY_BETWEEN_CHAPTERS_MS = 5000;
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 10000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function summarizeWithRetry(
  provider: LLMProvider,
  chapterTitle: string,
  chapterText: string,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await provider.summarize(chapterTitle, chapterText);
    } catch (error) {
      const isRateLimit = error instanceof Error && error.message.includes("429");
      if (!isRateLimit || attempt === MAX_RETRIES - 1) throw error;

      const waitTime = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
      console.log(
        `Rate limited. Retrying in ${waitTime / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await delay(waitTime);
    }
  }

  throw new Error("Unreachable");
}

export interface SummarizeProgress {
  current: number;
  total: number;
  chapterTitle: string;
}

export async function summarizeChapters(
  provider: LLMProvider,
  chapters: Chapter[],
  chapterTexts: string[],
  onProgress?: (progress: SummarizeProgress) => void,
): Promise<string[]> {
  const summaries: string[] = [];

  for (let i = 0; i < chapters.length; i++) {
    onProgress?.({ current: i + 1, total: chapters.length, chapterTitle: chapters[i].title });

    const summary = await summarizeWithRetry(provider, chapters[i].title, chapterTexts[i]);
    summaries.push(summary);

    if (i < chapters.length - 1) {
      await delay(DELAY_BETWEEN_CHAPTERS_MS);
    }
  }

  return summaries;
}
