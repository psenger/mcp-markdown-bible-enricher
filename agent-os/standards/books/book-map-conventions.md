---
name: Book Map Conventions
description: BOOK_MAP key casing rules, abbreviation source, and alternative name pattern
type: project
---

# Book Map Conventions

`BOOK_MAP` in `src/books.ts` maps book names to abbreviations used in Obsidian wiki-links.

## Key rules

- All keys are **lowercase** — `lookupBook()` calls `.toLowerCase()` before lookup
- Never add a mixed-case key; lookups will silently fail

```typescript
// Correct
"1 samuel": { abbrev: "1 Sam", singleChapter: false }

// Wrong — will never match
"1 Samuel": { abbrev: "1 Sam", singleChapter: false }
```

## Abbreviation values

The `abbrev` field must match the **actual note filenames in the Obsidian vault**.
Changing an abbrev breaks existing wiki-links. Verify vault filenames before editing.

## Alternative names

Multiple keys can share the same `abbrev` (e.g. `"sirach"`, `"ecclesiasticus"`,
`"wisdom of ben sira"` all map to `{ abbrev: "Sir" }`). Use this for books
with variant names.
