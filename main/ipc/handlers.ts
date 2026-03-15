import path from "path";
import { ipcMain, dialog, BrowserWindow } from "electron";
import type { Settings, Book, Chapter, BookWithChapters } from "../../shared/types";
import * as settingsService from "../services/SettingsService";
import { parseEpub } from "../services/EpubService";
import * as summarizationService from "../services/SummarizationService";
import { BookRepository } from "../repositories/BookRepository";
import { SummaryRepository } from "../repositories/SummaryRepository";
import { getDb } from "../db/init";

function getBookRepo(): BookRepository {
  return new BookRepository(getDb());
}

function getSummaryRepo(): SummaryRepository {
  return new SummaryRepository(getDb());
}

function sendToRenderer(channel: string, data: unknown): void {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send(channel, data);
  }
}

function getBooks(): Book[] {
  return getBookRepo().getAllBooks();
}

function getChapters(bookId: number): Chapter[] {
  return getBookRepo().getChaptersByBookId(bookId);
}

async function uploadBook(filePath: string): Promise<BookWithChapters> {
  const parsed = await parseEpub(filePath);

  const title = path.basename(filePath, ".epub");
  const bookRepo = getBookRepo();
  const book = bookRepo.insertBook(title, filePath);

  const chapterTexts: string[] = [];
  const chapters: Chapter[] = parsed.map((ch) => {
    chapterTexts.push(ch.text);
    return bookRepo.insertChapter(book.id, ch.position, ch.title, ch.text);
  });

  await summarizationService.summarizeBook(
    getSummaryRepo(),
    book.id,
    chapters,
    chapterTexts,
    (progress) => sendToRenderer("uploadProgress", progress),
  );

  return { book, chapters };
}

function getSummary(bookId: number, chapterIndex: number): string | null {
  return summarizationService.getSummary(getSummaryRepo(), bookId, chapterIndex);
}

function getSettings(): Settings {
  return settingsService.getSettings();
}

function saveSettings(settings: Settings): void {
  settingsService.saveSettings(settings);
}

async function openFileDialog(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    filters: [{ name: "EPUB Files", extensions: ["epub"] }],
    properties: ["openFile"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}

export function registerHandlers(): void {
  ipcMain.handle("getBooks", () => getBooks());
  ipcMain.handle("getChapters", (_event, bookId: number) => getChapters(bookId));
  ipcMain.handle("uploadBook", (_event, filePath: string) => uploadBook(filePath));
  ipcMain.handle("getSummary", (_event, bookId: number, chapterIndex: number) =>
    getSummary(bookId, chapterIndex),
  );
  ipcMain.handle("getSettings", () => getSettings());
  ipcMain.handle("saveSettings", (_event, settings: Settings) => saveSettings(settings));
  ipcMain.handle("openFileDialog", () => openFileDialog());
}
