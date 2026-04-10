import type Database from "better-sqlite3";
import type {
  ChapterFamilyRelation,
  FamilyRelationType,
  RelationConfidence,
} from "../../shared/types";

export interface StoredCharacter {
  id: number;
  canonicalName: string;
}

export interface StoredFamilyConnectionRow {
  sourceCharacterId: number;
  sourceCharacterName: string;
  targetCharacterId: number;
  targetCharacterName: string;
  relationType: FamilyRelationType;
  confidence: RelationConfidence;
  evidence: string;
  chapterIndex: number;
}

interface StoredFamilyConnectionDbRow {
  source_character_id: number;
  source_character_name: string;
  target_character_id: number;
  target_character_name: string;
  relation_type: FamilyRelationType;
  confidence: RelationConfidence;
  evidence: string;
  chapter_index: number;
}

interface NormalizedFamilyRelation {
  sourceCharacter: string;
  targetCharacter: string;
  relationship: FamilyRelationType;
  evidence: string;
  confidence: RelationConfidence;
}

const SYMMETRIC_RELATIONS = new Set<FamilyRelationType>(["spouse", "sibling", "cousin"]);

function normalizeCharacterName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function sanitizeCharacterName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function sortPair(first: string, second: string): [string, string] {
  return first.localeCompare(second, undefined, { sensitivity: "base" }) <= 0
    ? [first, second]
    : [second, first];
}

function normalizeRelation(relation: ChapterFamilyRelation): NormalizedFamilyRelation | null {
  const sourceCharacter = sanitizeCharacterName(relation.sourceCharacter);
  const targetCharacter = sanitizeCharacterName(relation.targetCharacter);
  const evidence = relation.evidence.trim();

  if (
    sourceCharacter.length === 0 ||
    targetCharacter.length === 0 ||
    sourceCharacter === targetCharacter
  ) {
    return null;
  }

  if (SYMMETRIC_RELATIONS.has(relation.relationship)) {
    const [normalizedSource, normalizedTarget] = sortPair(sourceCharacter, targetCharacter);
    return {
      sourceCharacter: normalizedSource,
      targetCharacter: normalizedTarget,
      relationship: relation.relationship,
      evidence,
      confidence: relation.confidence,
    };
  }

  return {
    sourceCharacter,
    targetCharacter,
    relationship: relation.relationship,
    evidence,
    confidence: relation.confidence,
  };
}

export function mapStoredFamilyConnectionRow(
  row: StoredFamilyConnectionDbRow,
): StoredFamilyConnectionRow {
  return {
    sourceCharacterId: row.source_character_id,
    sourceCharacterName: row.source_character_name,
    targetCharacterId: row.target_character_id,
    targetCharacterName: row.target_character_name,
    relationType: row.relation_type,
    confidence: row.confidence,
    evidence: row.evidence,
    chapterIndex: row.chapter_index,
  };
}

export class CharacterRepository {
  constructor(private db: Database.Database) {}

  private upsertCharacter(bookId: number, name: string): StoredCharacter {
    const canonicalName = sanitizeCharacterName(name);
    const normalizedName = normalizeCharacterName(canonicalName);

    const existing = this.db
      .prepare(
        "SELECT id, canonical_name FROM characters WHERE book_id = ? AND normalized_name = ?",
      )
      .get(bookId, normalizedName) as { id: number; canonical_name: string } | undefined;

    if (existing) {
      return {
        id: existing.id,
        canonicalName: existing.canonical_name,
      };
    }

    const result = this.db
      .prepare("INSERT INTO characters (book_id, canonical_name, normalized_name) VALUES (?, ?, ?)")
      .run(bookId, canonicalName, normalizedName);

    return {
      id: result.lastInsertRowid as number,
      canonicalName,
    };
  }

  saveFamilyRelations(
    bookId: number,
    chapterIndex: number,
    relations: ChapterFamilyRelation[],
  ): void {
    const insertRelation = this.db.prepare(
      `INSERT OR REPLACE INTO family_relationships (
         book_id,
         source_character_id,
         target_character_id,
         relation_type,
         confidence,
         evidence,
         chapter_index
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    const transaction = this.db.transaction((items: ChapterFamilyRelation[]) => {
      for (const relation of items) {
        const normalized = normalizeRelation(relation);
        if (!normalized) {
          continue;
        }

        const sourceCharacter = this.upsertCharacter(bookId, normalized.sourceCharacter);
        const targetCharacter = this.upsertCharacter(bookId, normalized.targetCharacter);

        insertRelation.run(
          bookId,
          sourceCharacter.id,
          targetCharacter.id,
          normalized.relationship,
          normalized.confidence,
          normalized.evidence,
          chapterIndex,
        );
      }
    });

    transaction(relations);
  }

  findCharacterByName(bookId: number, query: string): StoredCharacter | null {
    const normalizedQuery = normalizeCharacterName(query);

    if (normalizedQuery.length === 0) {
      throw new Error("Enter a character name to search.");
    }

    const exactMatch = this.db
      .prepare(
        "SELECT id, canonical_name FROM characters WHERE book_id = ? AND normalized_name = ? LIMIT 1",
      )
      .get(bookId, normalizedQuery) as { id: number; canonical_name: string } | undefined;

    if (exactMatch) {
      return {
        id: exactMatch.id,
        canonicalName: exactMatch.canonical_name,
      };
    }

    const partialMatch = this.db
      .prepare(
        `SELECT id, canonical_name
         FROM characters
         WHERE book_id = ? AND normalized_name LIKE ?
         ORDER BY LENGTH(canonical_name), canonical_name
         LIMIT 1`,
      )
      .get(bookId, `%${normalizedQuery}%`) as { id: number; canonical_name: string } | undefined;

    if (!partialMatch) {
      return null;
    }

    return {
      id: partialMatch.id,
      canonicalName: partialMatch.canonical_name,
    };
  }

  getFamilyConnectionsForCharacter(
    bookId: number,
    characterId: number,
  ): StoredFamilyConnectionRow[] {
    const rows = this.db
      .prepare(
        `SELECT
           source.id AS source_character_id,
           source.canonical_name AS source_character_name,
           target.id AS target_character_id,
           target.canonical_name AS target_character_name,
           relation_type,
           confidence,
           evidence,
           chapter_index
         FROM family_relationships
         INNER JOIN characters AS source ON source.id = family_relationships.source_character_id
         INNER JOIN characters AS target ON target.id = family_relationships.target_character_id
         WHERE family_relationships.book_id = ?
           AND (source_character_id = ? OR target_character_id = ?)
         ORDER BY chapter_index DESC`,
      )
      .all(bookId, characterId, characterId) as StoredFamilyConnectionDbRow[];

    return rows.map((row) => mapStoredFamilyConnectionRow(row));
  }
}
