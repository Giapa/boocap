import { ipcMain, dialog } from "electron";

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

function getSettings() {
  return { provider: "anthropic" as const, apiKey: "" };
}

function saveSettings() {
  return;
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
  ipcMain.handle("saveSettings", (_event, _settings) => saveSettings());
  ipcMain.handle("checkDependencies", () => checkDependencies());
  ipcMain.handle("openFileDialog", () => openFileDialog());
}
