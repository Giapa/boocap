import type {
  CharacterFamilyConnection,
  CharacterFamilyTree,
  FamilyConnectionType,
  RelationConfidence,
} from "../../shared/types";
import type {
  CharacterRepository,
  StoredCharacter,
  StoredFamilyConnectionRow,
} from "../repositories/CharacterRepository";

type CharacterFamilySearchRepository = Pick<
  CharacterRepository,
  "findCharacterByName" | "getFamilyConnectionsForCharacter"
>;

function confidenceWeight(confidence: RelationConfidence): number {
  switch (confidence) {
    case "high":
      return 3;
    case "medium":
      return 2;
    default:
      return 1;
  }
}

function mapRelationshipToRoot(
  rootCharacterId: number,
  row: StoredFamilyConnectionRow,
): FamilyConnectionType {
  const rootIsSource = row.sourceCharacterId === rootCharacterId;

  switch (row.relationType) {
    case "parent":
      return rootIsSource ? "child" : "parent";
    case "grandparent":
      return rootIsSource ? "grandchild" : "grandparent";
    case "aunt_uncle":
      return rootIsSource ? "niece_nephew" : "aunt_uncle";
    case "guardian":
      return rootIsSource ? "ward" : "guardian";
    default:
      return row.relationType;
  }
}

function toFamilyConnection(
  rootCharacter: StoredCharacter,
  row: StoredFamilyConnectionRow,
): CharacterFamilyConnection | null {
  const rootIsSource = row.sourceCharacterId === rootCharacter.id;
  const relativeName = rootIsSource ? row.targetCharacterName : row.sourceCharacterName;

  if (typeof relativeName !== "string" || relativeName.trim().length === 0) {
    return null;
  }

  return {
    relativeName: relativeName.trim(),
    relationshipToRoot: mapRelationshipToRoot(rootCharacter.id, row),
    evidence: row.evidence,
    confidence: row.confidence,
    chapterIndex: row.chapterIndex,
  };
}

function dedupeConnections(connections: CharacterFamilyConnection[]): CharacterFamilyConnection[] {
  const deduped = new Map<string, CharacterFamilyConnection>();

  for (const connection of connections) {
    const normalizedName =
      typeof connection.relativeName === "string" ? connection.relativeName.trim() : "";

    if (normalizedName.length === 0) {
      continue;
    }

    const normalizedConnection = {
      ...connection,
      relativeName: normalizedName,
    };
    const key = `${normalizedConnection.relationshipToRoot}:${normalizedName.toLowerCase()}`;
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, normalizedConnection);
      continue;
    }

    const currentWeight = confidenceWeight(normalizedConnection.confidence);
    const existingWeight = confidenceWeight(existing.confidence);

    if (
      currentWeight > existingWeight ||
      (currentWeight === existingWeight &&
        normalizedConnection.chapterIndex > existing.chapterIndex)
    ) {
      deduped.set(key, normalizedConnection);
    }
  }

  return [...deduped.values()].sort((left, right) => {
    if (left.relationshipToRoot === right.relationshipToRoot) {
      return left.relativeName.localeCompare(right.relativeName, undefined, {
        sensitivity: "base",
      });
    }

    return left.relationshipToRoot.localeCompare(right.relationshipToRoot);
  });
}

export function searchCharacterFamilyTree(
  characterRepo: CharacterFamilySearchRepository,
  bookId: number,
  searchedName: string,
): CharacterFamilyTree | null {
  const matchedCharacter = characterRepo.findCharacterByName(bookId, searchedName);

  if (!matchedCharacter) {
    return null;
  }

  const rows = characterRepo.getFamilyConnectionsForCharacter(bookId, matchedCharacter.id);
  const connections = dedupeConnections(
    rows
      .map((row) => toFamilyConnection(matchedCharacter, row))
      .filter((connection): connection is CharacterFamilyConnection => connection !== null),
  );

  return {
    searchedName: searchedName.trim(),
    matchedCharacter: matchedCharacter.canonicalName,
    connections,
  };
}
