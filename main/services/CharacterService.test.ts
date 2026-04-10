import { describe, expect, it } from "vitest";
import type {
  CharacterRepository,
  StoredCharacter,
  StoredFamilyConnectionRow,
} from "../repositories/CharacterRepository";
import { searchCharacterFamilyTree } from "./CharacterService";

type CharacterFamilySearchRepository = Pick<
  CharacterRepository,
  "findCharacterByName" | "getFamilyConnectionsForCharacter"
>;

function createRepositoryStub(options: {
  matchedCharacter: StoredCharacter | null;
  rows?: StoredFamilyConnectionRow[];
}): CharacterFamilySearchRepository {
  return {
    findCharacterByName: () => options.matchedCharacter,
    getFamilyConnectionsForCharacter: () => options.rows ?? [],
  };
}

describe("searchCharacterFamilyTree", () => {
  it("builds a family tree from stored relations", () => {
    const repository = createRepositoryStub({
      matchedCharacter: {
        id: 7,
        canonicalName: "Arya Stark",
      },
      rows: [
        {
          sourceCharacterId: 2,
          sourceCharacterName: "Eddard Stark",
          targetCharacterId: 7,
          targetCharacterName: "Arya Stark",
          relationType: "parent",
          confidence: "high",
          evidence: "Ned is Arya's father.",
          chapterIndex: 0,
        },
        {
          sourceCharacterId: 7,
          sourceCharacterName: "Arya Stark",
          targetCharacterId: 9,
          targetCharacterName: "Bran Stark",
          relationType: "sibling",
          confidence: "high",
          evidence: "Bran is Arya's brother.",
          chapterIndex: 1,
        },
      ],
    });

    const tree = searchCharacterFamilyTree(repository, 1, "Arya Stark");

    expect(tree).toEqual({
      searchedName: "Arya Stark",
      matchedCharacter: "Arya Stark",
      connections: [
        {
          relativeName: "Eddard Stark",
          relationshipToRoot: "parent",
          evidence: "Ned is Arya's father.",
          confidence: "high",
          chapterIndex: 0,
        },
        {
          relativeName: "Bran Stark",
          relationshipToRoot: "sibling",
          evidence: "Bran is Arya's brother.",
          confidence: "high",
          chapterIndex: 1,
        },
      ],
    });
  });

  it("returns child connections when the root is the source parent", () => {
    const repository = createRepositoryStub({
      matchedCharacter: {
        id: 3,
        canonicalName: "Catelyn Stark",
      },
      rows: [
        {
          sourceCharacterId: 3,
          sourceCharacterName: "Catelyn Stark",
          targetCharacterId: 4,
          targetCharacterName: "Robb Stark",
          relationType: "parent",
          confidence: "medium",
          evidence: "Catelyn speaks to her son Robb.",
          chapterIndex: 4,
        },
      ],
    });

    const tree = searchCharacterFamilyTree(repository, 1, "Catelyn");

    expect(tree?.connections).toEqual([
      {
        relativeName: "Robb Stark",
        relationshipToRoot: "child",
        evidence: "Catelyn speaks to her son Robb.",
        confidence: "medium",
        chapterIndex: 4,
      },
    ]);
  });

  it("deduplicates repeated links by strongest confidence", () => {
    const repository = createRepositoryStub({
      matchedCharacter: {
        id: 11,
        canonicalName: "Elain Archeron",
      },
      rows: [
        {
          sourceCharacterId: 11,
          sourceCharacterName: "Elain Archeron",
          targetCharacterId: 12,
          targetCharacterName: "Nesta Archeron",
          relationType: "sibling",
          confidence: "medium",
          evidence: "The sisters argue.",
          chapterIndex: 0,
        },
        {
          sourceCharacterId: 12,
          sourceCharacterName: "Nesta Archeron",
          targetCharacterId: 11,
          targetCharacterName: "Elain Archeron",
          relationType: "sibling",
          confidence: "high",
          evidence: "Nesta calls Elain her sister again.",
          chapterIndex: 3,
        },
      ],
    });

    const tree = searchCharacterFamilyTree(repository, 1, "elain");

    expect(tree?.matchedCharacter).toBe("Elain Archeron");
    expect(tree?.connections).toEqual([
      {
        relativeName: "Nesta Archeron",
        relationshipToRoot: "sibling",
        evidence: "Nesta calls Elain her sister again.",
        confidence: "high",
        chapterIndex: 3,
      },
    ]);
  });

  it("returns null when no character match exists", () => {
    const repository = createRepositoryStub({
      matchedCharacter: null,
    });

    expect(searchCharacterFamilyTree(repository, 1, "Unknown Character")).toBeNull();
  });

  it("ignores malformed rows instead of crashing the search", () => {
    const repository = createRepositoryStub({
      matchedCharacter: {
        id: 7,
        canonicalName: "Arya Stark",
      },
      rows: [
        {
          sourceCharacterId: 2,
          sourceCharacterName: undefined as unknown as string,
          targetCharacterId: 7,
          targetCharacterName: "Arya Stark",
          relationType: "parent",
          confidence: "high",
          evidence: "Broken data row",
          chapterIndex: 0,
        },
      ],
    });

    expect(searchCharacterFamilyTree(repository, 1, "Arya Stark")).toEqual({
      searchedName: "Arya Stark",
      matchedCharacter: "Arya Stark",
      connections: [],
    });
  });
});
