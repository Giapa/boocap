import { ipcMain, dialog, BrowserWindow } from "electron";
import type { Settings } from "../../shared/types";
import * as settingsService from "../services/SettingsService";
import * as bookService from "../services/BookService";
import { BookRepository } from "../repositories/BookRepository";
import { SummaryRepository } from "../repositories/SummaryRepository";
import { getDb } from "../db/init";

let bookRepo: BookRepository;
let summaryRepo: SummaryRepository;

function sendToRenderer(channel: string, data: unknown): void {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send(channel, data);
  }
}

export function registerHandlers(): void {
  const db = getDb();
  bookRepo = new BookRepository(db);
  summaryRepo = new SummaryRepository(db);

  ipcMain.handle("getBooks", () => bookRepo.getAllBooks());

  ipcMain.handle("getChapters", (_event, bookId: number) =>
    bookRepo.getChaptersByBookId(bookId),
  );

  ipcMain.handle("uploadBook", (_event, filePath: string) =>
    bookService.uploadBook(bookRepo, summaryRepo, filePath, (progress) =>
      sendToRenderer("uploadProgress", progress),
    ),
  );

  ipcMain.handle("getSummary", (_event, bookId: number, chapterIndex: number) =>
    summaryRepo.getSummary(bookId, chapterIndex),
  );

  ipcMain.handle("getSettings", () => settingsService.getSettings());

  ipcMain.handle("saveSettings", (_event, settings: Settings) =>
    settingsService.saveSettings(settings),
  );

  ipcMain.handle("openFileDialog", async () => {
    const result = await dialog.showOpenDialog({
      filters: [{ name: "EPUB Files", extensions: ["epub"] }],
      properties: ["openFile"],
    });
    return result.canceled ? null : result.filePaths[0];
  });
}
