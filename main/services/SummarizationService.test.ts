import { afterEach, describe, expect, it, vi } from "vitest";
import type { Chapter } from "../../shared/types";
import { analyzeChapters } from "./SummarizationService";

const chapters: Chapter[] = [{ bookId: 1, position: 0, title: "Chapter 1" }];

afterEach(() => {
  vi.useRealTimers();
});

describe("analyzeChapters", () => {
  it("reports progress metrics before sending a chapter", async () => {
    const provider = {
      analyzeChapter: vi.fn().mockResolvedValue({
        summary: "Summary",
        familyRelations: [],
      }),
    };
    const progressEvents: Array<{
      current: number;
      total: number;
      chapterTitle: string;
      percent: number;
      estimatedInputTokens: number;
      savedCharacters: number;
    }> = [];

    const result = await analyzeChapters(
      provider,
      chapters,
      ["Chapter 1\n\nSome text that should be summarized."],
      (progress) => {
        progressEvents.push(progress);
      },
    );

    expect(result).toEqual([
      {
        summary: "Summary",
        familyRelations: [],
      },
    ]);
    expect(progressEvents[0]).toMatchObject({
      current: 1,
      total: 1,
      chapterTitle: "Chapter 1",
      percent: 100,
    });
    expect(progressEvents[0].estimatedInputTokens).toBeGreaterThan(0);
  });

  it("retries rate-limited responses and eventually resolves", async () => {
    vi.useFakeTimers();

    const provider = {
      analyzeChapter: vi
        .fn()
        .mockRejectedValueOnce(new Error("429 too many requests"))
        .mockRejectedValueOnce(new Error("rate limit"))
        .mockResolvedValue({
          summary: "Recovered summary",
          familyRelations: [],
        }),
    };

    const promise = analyzeChapters(provider, chapters, ["Some text to summarize"]);

    await vi.advanceTimersByTimeAsync(30000);

    await expect(promise).resolves.toEqual([
      {
        summary: "Recovered summary",
        familyRelations: [],
      },
    ]);
    expect(provider.analyzeChapter).toHaveBeenCalledTimes(3);
  });

  it("fails fast when chapter metadata and text counts differ", async () => {
    const provider = {
      analyzeChapter: vi.fn(),
    };

    await expect(analyzeChapters(provider, chapters, [])).rejects.toThrow(
      "Chapter metadata and chapter text counts do not match.",
    );
  });
});
