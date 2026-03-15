export interface LLMProvider {
  summarize(chapterTitle: string, chapterText: string): Promise<string>;
}

const MAX_CHAPTER_LENGTH = 12000;

export function buildPrompt(chapterTitle: string, chapterText: string): string {
  const truncated = chapterText.slice(0, MAX_CHAPTER_LENGTH);

  return `Summarize the following book chapter.
Be concise. Preserve important character actions, plot developments, and revelations.
Do not add commentary.

Chapter (${chapterTitle}):
${truncated}`;
}
