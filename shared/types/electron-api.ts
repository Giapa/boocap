import type { Book, BookWithChapters, Chapter, Settings } from "./index";

export interface ElectronAPI {
  getBooks(): Promise<Book[]>;
  getChapters(bookId: number): Promise<Chapter[]>;
  uploadBook(filePath: string): Promise<BookWithChapters>;
  getSummary(bookId: number, chapterIndex: number): Promise<string>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  checkDependencies(): Promise<boolean>;
  openFileDialog(): Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
