export interface Book {
  id: number;
  title: string;
  filePath: string;
}

export type FamilyRelationType =
  | "parent"
  | "spouse"
  | "sibling"
  | "grandparent"
  | "aunt_uncle"
  | "cousin"
  | "guardian";

export type FamilyConnectionType =
  | FamilyRelationType
  | "child"
  | "grandchild"
  | "niece_nephew"
  | "ward";

export type RelationConfidence = "low" | "medium" | "high";

export interface Chapter {
  bookId: number;
  position: number;
  title: string;
}

export interface ChapterFamilyRelation {
  sourceCharacter: string;
  targetCharacter: string;
  relationship: FamilyRelationType;
  evidence: string;
  confidence: RelationConfidence;
}

export interface ChapterAnalysis {
  summary: string;
  familyRelations: ChapterFamilyRelation[];
}

export interface CharacterFamilyConnection {
  relativeName: string;
  relationshipToRoot: FamilyConnectionType;
  evidence: string;
  confidence: RelationConfidence;
  chapterIndex: number;
}

export interface CharacterFamilyTree {
  searchedName: string;
  matchedCharacter: string;
  connections: CharacterFamilyConnection[];
}

export interface BookWithChapters {
  book: Book;
  chapters: Chapter[];
}

export interface Settings {
  provider: "anthropic" | "openai" | "google" | "groq";
  apiKey: string;
}
