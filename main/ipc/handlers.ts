import { ipcMain, dialog, BrowserWindow } from "electron";
import type { Settings } from "../../shared/types";
import * as settingsService from "../services/SettingsService";
import * as bookService from "../services/BookService";
import { BookRepository } from "../repositories/BookRepository";
import { SummaryRepository } from "../repositories/SummaryRepository";
import { appEvents } from "../events";
import { getDb } from "../db/init";

let bookRepo: BookRepository;
let summaryRepo: SummaryRepository;

function sendToRenderer(channel: string, data: unknown): void {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send(channel, data);
  }
}

async function safe<T>(fn: () => T | Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message, { cause: error });
  }
}

export function registerHandlers(): void {
  const db = getDb();
  bookRepo = new BookRepository(db);
  summaryRepo = new SummaryRepository(db);

  appEvents.on("uploadProgress", (progress) => {
    sendToRenderer("uploadProgress", progress);
  });

  ipcMain.handle("getBooks", () => safe(() => bookRepo.getAllBooks()));

  ipcMain.handle("getChapters", (_e, bookId: number) =>
    safe(() => bookRepo.getChaptersByBookId(bookId)),
  );

  ipcMain.handle("uploadBook", (_e, filePath: string) =>
    safe(() => bookService.uploadBook(bookRepo, summaryRepo, filePath)),
  );

  ipcMain.handle("getSummary", (_e, bookId: number, chapterIndex: number) =>
    safe(() => summaryRepo.getSummary(bookId, chapterIndex)),
  );

  ipcMain.handle("getSettings", () => safe(() => settingsService.getSettings()));

  ipcMain.handle("saveSettings", (_e, settings: Settings) =>
    safe(() => settingsService.saveSettings(settings)),
  );

  ipcMain.handle("openFileDialog", async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: "EPUB Files", extensions: ["epub"] }],
      properties: ["openFile"],
    });
    return result.canceled ? null : result.filePaths[0];
  });
}
