import type { Book, BookWithChapters, Chapter, Settings } from "./index";

export interface UploadProgress {
  current: number;
  total: number;
  chapterTitle: string;
}

export interface ElectronAPI {
  getBooks(): Promise<Book[]>;
  getChapters(bookId: number): Promise<Chapter[]>;
  uploadBook(filePath: string): Promise<BookWithChapters>;
  onUploadProgress(callback: (progress: UploadProgress) => void): void;
  getSummary(bookId: number, chapterIndex: number): Promise<string>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  openFileDialog(): Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
