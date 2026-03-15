import type Database from "better-sqlite3";
import type { Book, Chapter } from "../../shared/types";

export class BookRepository {
  constructor(private db: Database.Database) {}

  insertBook(title: string, filePath: string): Book {
    const stmt = this.db.prepare("INSERT INTO books (title, file_path) VALUES (?, ?)");
    const result = stmt.run(title, filePath);

    return {
      id: result.lastInsertRowid as number,
      title,
      filePath,
    };
  }

  getAllBooks(): Book[] {
    const rows = this.db.prepare("SELECT id, title, file_path FROM books").all() as {
      id: number;
      title: string;
      file_path: string;
    }[];

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      filePath: row.file_path,
    }));
  }

  getBookById(id: number): Book | null {
    const row = this.db.prepare("SELECT id, title, file_path FROM books WHERE id = ?").get(id) as
      | { id: number; title: string; file_path: string }
      | undefined;

    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      filePath: row.file_path,
    };
  }

  insertChapter(bookId: number, position: number, title: string, text: string): Chapter {
    this.db
      .prepare("INSERT INTO chapters (book_id, position, title, text) VALUES (?, ?, ?, ?)")
      .run(bookId, position, title, text);

    return { bookId, position, title };
  }

  getChaptersByBookId(bookId: number): Chapter[] {
    const rows = this.db
      .prepare("SELECT book_id, position, title FROM chapters WHERE book_id = ? ORDER BY position")
      .all(bookId) as { book_id: number; position: number; title: string }[];

    return rows.map((row) => ({
      bookId: row.book_id,
      position: row.position,
      title: row.title,
    }));
  }

  getChapterText(bookId: number, position: number): string | null {
    const row = this.db
      .prepare("SELECT text FROM chapters WHERE book_id = ? AND position = ?")
      .get(bookId, position) as { text: string } | undefined;

    return row?.text ?? null;
  }
}
