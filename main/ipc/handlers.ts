import { ipcMain, dialog, BrowserWindow } from "electron";
import type { Settings } from "../../shared/types";
import { getErrorMessage } from "../../shared/utils/errors";
import * as settingsService from "../services/SettingsService";
import * as bookService from "../services/BookService";
import { BookRepository } from "../repositories/BookRepository";
import { CharacterRepository } from "../repositories/CharacterRepository";
import { SummaryRepository } from "../repositories/SummaryRepository";
import { appEvents } from "../events";
import { getDb } from "../db/init";
import * as characterService from "../services/CharacterService";

let bookRepo: BookRepository;
let summaryRepo: SummaryRepository;
let characterRepo: CharacterRepository;

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
    throw new Error(getErrorMessage(error), { cause: error });
  }
}

export function registerHandlers(): void {
  const db = getDb();
  bookRepo = new BookRepository(db);
  summaryRepo = new SummaryRepository(db);
  characterRepo = new CharacterRepository(db);

  appEvents.on("uploadProgress", (progress) => {
    sendToRenderer("uploadProgress", progress);
  });

  ipcMain.handle("getBooks", () => safe(() => bookRepo.getAllBooks()));

  ipcMain.handle("getChapters", (_e, bookId: number) =>
    safe(() => bookRepo.getChaptersByBookId(bookId)),
  );

  ipcMain.handle("uploadBook", (_e, filePath: string) =>
    safe(() => bookService.uploadBook(bookRepo, summaryRepo, characterRepo, filePath)),
  );

  ipcMain.handle("getSummary", (_e, bookId: number, chapterIndex: number) =>
    safe(() => summaryRepo.getSummary(bookId, chapterIndex)),
  );

  ipcMain.handle("searchCharacterFamilyTree", (_e, bookId: number, characterName: string) =>
    safe(() => characterService.searchCharacterFamilyTree(characterRepo, bookId, characterName)),
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
