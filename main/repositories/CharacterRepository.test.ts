import { describe, expect, it } from "vitest";
import { mapStoredFamilyConnectionRow } from "./CharacterRepository";

describe("mapStoredFamilyConnectionRow", () => {
  it("maps snake_case database rows into the camelCase service shape", () => {
    expect(
      mapStoredFamilyConnectionRow({
        source_character_id: 1,
        source_character_name: "Eddard Stark",
        target_character_id: 2,
        target_character_name: "Arya Stark",
        relation_type: "parent",
        confidence: "high",
        evidence: "Ned is Arya's father.",
        chapter_index: 0,
      }),
    ).toEqual({
      sourceCharacterId: 1,
      sourceCharacterName: "Eddard Stark",
      targetCharacterId: 2,
      targetCharacterName: "Arya Stark",
      relationType: "parent",
      confidence: "high",
      evidence: "Ned is Arya's father.",
      chapterIndex: 0,
    });
  });
});
