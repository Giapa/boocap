import type Database from "better-sqlite3";

export class SummaryRepository {
  constructor(private db: Database.Database) {}

  getSummary(bookId: number, chapterIndex: number): string | null {
    const row = this.db
      .prepare("SELECT rolling_summary FROM summaries WHERE book_id = ? AND chapter_index = ?")
      .get(bookId, chapterIndex) as { rolling_summary: string } | undefined;

    return row?.rolling_summary ?? null;
  }

  saveSummary(bookId: number, chapterIndex: number, rollingSummary: string): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO summaries (book_id, chapter_index, rolling_summary)
         VALUES (?, ?, ?)`,
      )
      .run(bookId, chapterIndex, rollingSummary);
  }

  getLastStoredIndex(bookId: number): number {
    const row = this.db
      .prepare("SELECT MAX(chapter_index) as max_index FROM summaries WHERE book_id = ?")
      .get(bookId) as { max_index: number | null } | undefined;

    return row?.max_index ?? -1;
  }
}
