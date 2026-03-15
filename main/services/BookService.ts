import path from "path";
import type { BookWithChapters, Chapter } from "../../shared/types";
import { parseEpub } from "./EpubService";
import { summarizeChapters, type SummarizeProgress } from "./SummarizationService";
import { createProvider } from "../llm";
import { BookRepository } from "../repositories/BookRepository";
import { SummaryRepository } from "../repositories/SummaryRepository";
import * as settingsService from "./SettingsService";

export async function uploadBook(
  bookRepo: BookRepository,
  summaryRepo: SummaryRepository,
  filePath: string,
  onProgress?: (progress: SummarizeProgress) => void,
): Promise<BookWithChapters> {
  const parsed = await parseEpub(filePath);

  const title = path.basename(filePath, ".epub");
  const book = bookRepo.insertBook(title, filePath);

  const chapterTexts: string[] = [];
  const chapters: Chapter[] = parsed.map((ch) => {
    chapterTexts.push(ch.text);
    return bookRepo.insertChapter(book.id, ch.position, ch.title, ch.text);
  });

  const provider = createProvider(settingsService.getSettings());
  const summaries = await summarizeChapters(provider, chapters, chapterTexts, onProgress);

  for (let i = 0; i < summaries.length; i++) {
    summaryRepo.saveSummary(book.id, i, summaries[i]);
  }

  return { book, chapters };
}
