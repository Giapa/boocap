import { existsSync } from "fs";
import EPub from "epub";
import * as cheerio from "cheerio";

const MIN_CHAPTER_LENGTH = 2000;

const SKIP_TITLES = [
  "also by",
  "reading order",
  "glossary",
  "copyright",
  "acknowledgement",
  "acknowledgment",
  "about the author",
  "table of contents",
  "dedication",
  "title page",
  "cover",
  "frontispiece",
  "colophon",
  "bibliography",
  "index",
  "appendix",
  "thank you",
  "note from the author",
  "author's note",
  "bonus",
  "preview",
  "excerpt",
  "other books",
  "books by",
];

function isSkipTitle(title: string): boolean {
  const lower = title.toLowerCase().trim();
  return SKIP_TITLES.some((skip) => lower.includes(skip));
}

function htmlToText(html: string): string {
  const $ = cheerio.load(html);
  return $.text().trim();
}

function extractTitle(html: string): string | null {
  const $ = cheerio.load(html);
  const tag = $("h1, h2, h3, title").first();
  return tag.length ? tag.text().trim() : null;
}

export interface ParsedChapter {
  position: number;
  title: string;
  text: string;
}

export async function parseEpub(filePath: string): Promise<ParsedChapter[]> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const epub = new EPub(filePath);
  await epub.parse();

  const chapters: ParsedChapter[] = [];
  let position = 0;

  for (const item of epub.flow) {
    const html = await epub.getChapter(item.id);
    const text = htmlToText(html);

    if (text.length < MIN_CHAPTER_LENGTH) continue;

    const title = extractTitle(html) ?? `Chapter ${position + 1}`;

    if (isSkipTitle(title)) continue;

    chapters.push({ position, title, text });
    position++;
  }

  return chapters;
}
