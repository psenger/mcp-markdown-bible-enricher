# Bug Fix: Single-Chapter Book Bare Verse References

## Context

`"Jude 9"` produces no link. All 5 single-chapter books (Obadiah, Philemon, 2 John, 3 John,
Jude) are affected. `BIBLE_REF_RE` mandates a colon (`chapter:verse`), so `"Jude 9"` — a
valid way to cite a verse in a single-chapter book — never matches. No tests exist for any
single-chapter book. Fix follows strict TDD: write failing tests first, then implement.

## Critical Files

- `src/enrichment.ts` — `BIBLE_REF_RE`, `enrichMarkdown()`, `obsidianLink()`
- `src/books.ts` — `BOOK_MAP` with `singleChapter: true` flags
- `src/__tests__/enrichment.test.ts` — test suite to extend

## Task 2: Write Failing Tests (RED)

Add a `describe("single-chapter books — bare verse references")` block.

Behaviours to test:
1. `"Jude 9"` → generates Bible Gateway link for Jude 1:9
2. `"Jude 9-14"` → generates Bible Gateway link + Obsidian range links
3. `"Obadiah 21"` → generates a link
4. `"Philemon 25"` → generates a link
5. `"2 John 1"` → generates a link
6. `"3 John 14"` → generates a link
7. Idempotency — `enrichMarkdown(enrichMarkdown("Jude 9"))` equals `enrichMarkdown("Jude 9")`
8. Already-linked `[Jude 9](https://...)` is not double-enriched

## Task 3: Implement Fix (GREEN)

Approach: New `SINGLE_CHAPTER_REF_RE` regex — inserted as pass 2b.

Do NOT modify `BIBLE_REF_RE`. Add dedicated regex for bare-verse single-chapter refs.

In `src/books.ts` — export list of single-chapter book name patterns:
```ts
export const SINGLE_CHAPTER_BOOKS = Object.entries(BOOK_MAP)
  .filter(([, v]) => v.singleChapter)
  .map(([k]) => k);
```

In `src/enrichment.ts`:
1. Build book-name alternation from SINGLE_CHAPTER_BOOKS
2. Create SINGLE_CHAPTER_REF_RE with same double-link guards as BIBLE_REF_RE
3. Add pass 2b after pass 2, before CCC pass 3
4. Produce Bible Gateway URL with `1:{verse}` reference
5. Produce Obsidian link using `[[Abbrev#vN]]` format (no chapter number)

## Task 4: Refactor

- Check for duplication; extract shared helpers if warranted
- All tests must pass; TypeScript compiles cleanly
