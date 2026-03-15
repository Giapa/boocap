export interface Book {
  id: number;
  title: string;
  filePath: string;
}

export interface Chapter {
  bookId: number;
  position: number;
  title: string;
}

export interface BookWithChapters {
  book: Book;
  chapters: Chapter[];
}

export interface Settings {
  provider: "anthropic" | "openai" | "google";
  apiKey: string;
}
