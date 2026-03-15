import path from "path";
import { ipcMain, dialog } from "electron";
import type { Settings, Book, Chapter, BookWithChapters } from "../../shared/types";
import * as settingsService from "../services/SettingsService";
import { isUvAvailable, parseEpub } from "../services/EpubService";
import { BookRepository } from "../repositories/BookRepository";
import { getDb } from "../db/init";

function getBookRepo(): BookRepository {
  return new BookRepository(getDb());
}

function getBooks(): Book[] {
  return getBookRepo().getAllBooks();
}

function getChapters(bookId: number): Chapter[] {
  return getBookRepo().getChaptersByBookId(bookId);
}

async function uploadBook(filePath: string): Promise<BookWithChapters> {
  const title = path.basename(filePath, ".epub");
  const repo = getBookRepo();

  const book = repo.insertBook(title, filePath);
  const parsed = await parseEpub(filePath);

  const chapters: Chapter[] = parsed.map((ch) => {
    return repo.insertChapter(book.id, ch.position, ch.title, ch.text);
  });

  return { book, chapters };
}

function getSummary(_bookId: number, _chapterIndex: number): string {
  return "";
}

function getSettings(): Settings {
  return settingsService.getSettings();
}

function saveSettings(settings: Settings): void {
  settingsService.saveSettings(settings);
}

function checkDependencies(): boolean {
  return isUvAvailable();
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
  ipcMain.handle("checkDependencies", () => checkDependencies());
  ipcMain.handle("openFileDialog", () => openFileDialog());
}
