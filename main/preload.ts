import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "../renderer/src/shared/types/electron-api";

const api: ElectronAPI = {
  getBooks: () => ipcRenderer.invoke("getBooks"),
  getChapters: (bookId) => ipcRenderer.invoke("getChapters", bookId),
  uploadBook: (filePath) => ipcRenderer.invoke("uploadBook", filePath),
  getSummary: (bookId, chapterIndex) => ipcRenderer.invoke("getSummary", bookId, chapterIndex),
  getSettings: () => ipcRenderer.invoke("getSettings"),
  saveSettings: (settings) => ipcRenderer.invoke("saveSettings", settings),
  checkDependencies: () => ipcRenderer.invoke("checkDependencies"),
  openFileDialog: () => ipcRenderer.invoke("openFileDialog"),
};

contextBridge.exposeInMainWorld("electronAPI", api);
