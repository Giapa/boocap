import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "../shared/types/electron-api";
import type { UploadProgress } from "../shared/types/electron-api";

const api: ElectronAPI = {
  getBooks: () => ipcRenderer.invoke("getBooks"),
  getChapters: (bookId) => ipcRenderer.invoke("getChapters", bookId),
  uploadBook: (filePath) => ipcRenderer.invoke("uploadBook", filePath),
  onUploadProgress: (callback) => {
    ipcRenderer.on("uploadProgress", (_event, progress: UploadProgress) => callback(progress));
  },
  getSummary: (bookId, chapterIndex) => ipcRenderer.invoke("getSummary", bookId, chapterIndex),
  getSettings: () => ipcRenderer.invoke("getSettings"),
  saveSettings: (settings) => ipcRenderer.invoke("saveSettings", settings),
  openFileDialog: () => ipcRenderer.invoke("openFileDialog"),
};

contextBridge.exposeInMainWorld("electronAPI", api);
