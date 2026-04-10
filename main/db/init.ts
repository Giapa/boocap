import Database from "better-sqlite3";
import path from "path";

let db: Database.Database;

export function initDb(userDataPath: string): Database.Database {
  db = new Database(path.join(userDataPath, "boocap.db"));

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

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

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      canonical_name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      UNIQUE(book_id, normalized_name),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS family_relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      source_character_id INTEGER NOT NULL,
      target_character_id INTEGER NOT NULL,
      relation_type TEXT NOT NULL,
      confidence TEXT NOT NULL,
      evidence TEXT NOT NULL,
      chapter_index INTEGER NOT NULL,
      UNIQUE(book_id, source_character_id, target_character_id, relation_type, chapter_index),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (source_character_id) REFERENCES characters(id) ON DELETE CASCADE,
      FOREIGN KEY (target_character_id) REFERENCES characters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chapters_book_id_position
    ON chapters (book_id, position);

    CREATE INDEX IF NOT EXISTS idx_summaries_book_id_chapter_index
    ON summaries (book_id, chapter_index);

    CREATE INDEX IF NOT EXISTS idx_characters_book_id_name
    ON characters (book_id, normalized_name);

    CREATE INDEX IF NOT EXISTS idx_family_relationships_book_id_source
    ON family_relationships (book_id, source_character_id);

    CREATE INDEX IF NOT EXISTS idx_family_relationships_book_id_target
    ON family_relationships (book_id, target_character_id);
  `);

  return db;
}

export function getDb(): Database.Database {
  return db;
}
