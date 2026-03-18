# References

## Source Files Studied

### `src/enrichment.ts`

- `BIBLE_REF_RE` (line 99): requires `chapter:verse` — root cause of the bug
- `BACKTICK_BIBLE_RE` (line 114): same constraint but for backtick-wrapped refs
- `enrichBibleRef()` (line 174): builds BG URL + Obsidian links for matched refs
- `obsidianLink()` (line 28): builds a single Obsidian wiki-link; for `singleChapter && chapter === 1`
  calls `formatObsidianLink` (produces `[[Abbrev-01#vN]]`); second branch produces `[[Abbrev#vN]]`
- `obsidianSpan()` (line 45): wraps `obsidianLink()` for single-verse and ranges
- `enrichMarkdown()` (line 223): three-pass pipeline — backtick, plain-text, CCC
- `parseChapterVerse()` (line 137): parses `chapter:verse` strings; handles inherited chapters

### `src/books.ts`

- `BOOK_MAP` (line 9): all 73 Catholic Bible books; 5 flagged `singleChapter: true`:
  - `"obadiah"` → `{ abbrev: "Obad", singleChapter: true }`
  - `"philemon"` → `{ abbrev: "Philem", singleChapter: true }`
  - `"2 john"` → `{ abbrev: "2 John", singleChapter: true }`
  - `"3 john"` → `{ abbrev: "3 John", singleChapter: true }`
  - `"jude"` → `{ abbrev: "Jude", singleChapter: true }`
- `lookupBook()` (line 95): case-insensitive lookup via `.toLowerCase()`

### `src/config.ts`

- `formatObsidianLink()` (line 37): applies `{abbrev}`, `{chapter2}`, `{chapter}`, `{verse}` templates
- Default format: `[[{abbrev}-{chapter2}#v{verse}]]` → e.g. `[[Jude-01#v9]]`

## Key Insight

For the new pass 2b, Obsidian links use the bare `[[Abbrev#vN]]` format (no chapter digits),
consistent with how single-chapter books are typically cited in Obsidian vaults.
This differs from the default template output (`[[Jude-01#v9]]`) produced by `formatObsidianLink`.
