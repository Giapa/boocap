# /// script
# requires-python = ">=3.11"
# dependencies = ["ebooklib", "beautifulsoup4"]
# ///

import json
import sys

from bs4 import BeautifulSoup
from ebooklib import epub

MIN_CHAPTER_LENGTH = 200


def parse_epub(path: str) -> list[dict]:
    book = epub.read_epub(path, options={"ignore_ncx": True})

    spine_ids = [item_id for item_id, _ in book.spine]
    items_by_id = {item.get_id(): item for item in book.get_items()}

    chapters = []
    position = 0

    for item_id in spine_ids:
        item = items_by_id.get(item_id)
        if item is None or not isinstance(item, epub.EpubHtml):
            continue

        soup = BeautifulSoup(item.get_content(), "html.parser")
        text = soup.get_text(separator="\n", strip=True)

        if len(text) < MIN_CHAPTER_LENGTH:
            continue

        title_tag = soup.find(["h1", "h2", "h3", "title"])
        title = title_tag.get_text(strip=True) if title_tag else f"Chapter {position + 1}"

        chapters.append({"position": position, "title": title, "text": text})
        position += 1

    return chapters


def main():
    line = sys.stdin.readline()
    if not line:
        json.dump({"error": "No input received"}, sys.stdout)
        return

    try:
        request = json.loads(line)
    except json.JSONDecodeError as e:
        json.dump({"error": f"Invalid JSON: {e}"}, sys.stdout)
        return

    if request.get("command") != "parse":
        json.dump({"error": f"Unknown command: {request.get('command')}"}, sys.stdout)
        return

    path = request.get("path")
    if not path:
        json.dump({"error": "Missing 'path' field"}, sys.stdout)
        return

    try:
        chapters = parse_epub(path)
        json.dump({"chapters": chapters}, sys.stdout)
    except Exception as e:
        json.dump({"error": str(e)}, sys.stdout)


if __name__ == "__main__":
    main()
