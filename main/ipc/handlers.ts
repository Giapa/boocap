import { ipcMain, dialog } from "electron";
import type { Settings } from "../../shared/types";
import * as settingsService from "../services/SettingsService";

function getBooks() {
  return [];
}

function getChapters(_bookId: number) {
  return [];
}

function uploadBook(_filePath: string) {
  return { book: null, chapters: [] };
}

function getSummary(_bookId: number, _chapterIndex: number) {
  return "";
}

function getSettings(): Settings {
  return settingsService.getSettings();
}

function saveSettings(settings: Settings): void {
  settingsService.saveSettings(settings);
}

function checkDependencies() {
  return true;
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
