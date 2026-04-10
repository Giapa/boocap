import type { LLMProvider } from "../llm";
import type { Chapter, ChapterAnalysis } from "../../shared/types";
import { buildPrompt, estimateTokens, prepareChapterText } from "../llm/types";
import { getErrorMessage } from "../../shared/utils/errors";

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 10000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function summarizeWithRetry(
  provider: LLMProvider,
  chapterTitle: string,
  chapterText: string,
): Promise<ChapterAnalysis> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await provider.analyzeChapter(chapterTitle, chapterText);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to summarize chapter.").toLowerCase();
      const isRateLimit = message.includes("429") || message.includes("rate limit");
      if (!isRateLimit || attempt === MAX_RETRIES - 1) {
        throw error;
      }

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
  percent: number;
  estimatedInputTokens: number;
  savedCharacters: number;
}

export async function analyzeChapters(
  provider: LLMProvider,
  chapters: Chapter[],
  chapterTexts: string[],
  onProgress?: (progress: SummarizeProgress) => void,
): Promise<ChapterAnalysis[]> {
  if (chapters.length !== chapterTexts.length) {
    throw new Error("Chapter metadata and chapter text counts do not match.");
  }

  const analyses: ChapterAnalysis[] = [];

  for (let i = 0; i < chapters.length; i++) {
    const preparedChapter = prepareChapterText(chapters[i].title, chapterTexts[i]);

    onProgress?.({
      current: i + 1,
      total: chapters.length,
      chapterTitle: chapters[i].title,
      percent: Math.round(((i + 1) / chapters.length) * 100),
      estimatedInputTokens: estimateTokens(buildPrompt(chapters[i].title, preparedChapter.text)),
      savedCharacters: preparedChapter.savedCharacters,
    });

    const analysis = await summarizeWithRetry(provider, chapters[i].title, preparedChapter.text);
    analyses.push(analysis);
  }

  return analyses;
}
