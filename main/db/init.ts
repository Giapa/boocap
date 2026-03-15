import Database from "better-sqlite3";
import path from "path";

let db: Database.Database;

export function initDb(userDataPath: string): Database.Database {
  db = new Database(path.join(userDataPath, "boocap.db"));

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter_index INTEGER NOT NULL,
      rolling_summary TEXT NOT NULL,
      UNIQUE(book_id, chapter_index),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );
  `);

  return db;
}

export function getDb(): Database.Database {
  return db;
}
