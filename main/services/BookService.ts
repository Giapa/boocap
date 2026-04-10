import path from "path";
import { existsSync } from "fs";
import type { BookWithChapters, Chapter } from "../../shared/types";
import { parseEpub } from "./EpubService";
import { analyzeChapters } from "./SummarizationService";
import { createProvider } from "../llm";
import type { BookRepository } from "../repositories/BookRepository";
import type { CharacterRepository } from "../repositories/CharacterRepository";
import type { SummaryRepository } from "../repositories/SummaryRepository";
import { appEvents } from "../events";
import * as settingsService from "./SettingsService";

export async function uploadBook(
  bookRepo: BookRepository,
  summaryRepo: SummaryRepository,
  characterRepo: CharacterRepository,
  filePath: string,
): Promise<BookWithChapters> {
  if (!existsSync(filePath)) {
    throw new Error(`EPUB file not found: ${filePath}`);
  }

  if (path.extname(filePath).toLowerCase() !== ".epub") {
    throw new Error("Only EPUB files are supported.");
  }

  const settings = settingsService.getSettingsForSummarization();
  const parsed = await parseEpub(filePath);

  if (parsed.length === 0) {
    throw new Error("No readable chapters were found in this EPUB.");
  }

  const title = path.basename(filePath, ".epub");
  const book = bookRepo.insertBook(title, filePath);

  const chapterTexts: string[] = [];
  const chapters: Chapter[] = parsed.map((ch) => {
    chapterTexts.push(ch.text);
    return bookRepo.insertChapter(book.id, ch.position, ch.title, ch.text);
  });

  const provider = createProvider(settings);
  const analyses = await analyzeChapters(provider, chapters, chapterTexts, (progress) =>
    appEvents.emit("uploadProgress", progress),
  );

  for (let i = 0; i < analyses.length; i++) {
    summaryRepo.saveSummary(book.id, i, analyses[i].summary);
    characterRepo.saveFamilyRelations(book.id, i, analyses[i].familyRelations);
  }

  return { book, chapters };
}
