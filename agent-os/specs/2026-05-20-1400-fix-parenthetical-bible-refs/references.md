# References for Fix Parenthetical Bible References

## BIBLE_REF_RE — `src/enrichment.ts` line ~96

Primary regex for chapter:verse references.
Lookbehind to fix: `(?<![\\[\\(])` → `(?<![\\[])`

## SINGLE_CHAPTER_REF_RE — `src/enrichment.ts` line ~207

Handles bare-verse refs for single-chapter books (`Jude 9`, `Obadiah 21`, etc.)
Same lookbehind fix required.

## BARE_CHAPTER_REF_RE — `src/enrichment.ts` line ~258

Handles bare chapter refs (`Isaiah 53`, `Psalm 91`, etc.)
Same lookbehind fix required.

## Existing test patterns — `src/__tests__/enrichment.test.ts`

- `'period, colon and ellipsis termination'` describe blocks show the pattern for
  structural context tests (parens, bullet, blockquote, quotes)
- Idempotency tests follow the pattern:
  ```typescript
  const once = enrichMarkdown(input);
  expect(enrichMarkdown(once)).toBe(once);
  ```
