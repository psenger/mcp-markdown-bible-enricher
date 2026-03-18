---
name: Single-Chapter Books
description: Why singleChapter:true books use [[Abbrev#vN]] instead of [[Abbrev-01#vN]]
type: project
---

# Single-Chapter Books

Five books have only one chapter: **Obadiah, Philemon, 2 John, 3 John, Jude**.
These are flagged with `singleChapter: true` in `BOOK_MAP`.

## Obsidian link format difference

| Book type | Format | Example |
|-----------|--------|---------|
| Multi-chapter | `[[Abbrev-{chapter2}#vN]]` | `[[Matt-05#v3]]` |
| Single-chapter | `[[Abbrev#vN]]` | `[[Obad#v3]]` |

The vault note for single-chapter books is named without a chapter number
(e.g. `Obad.md`, not `Obad-01.md`). Including a chapter would produce a broken link.

## Logic in obsidianLink()

```typescript
if (singleChapter) {
  return `[[${abbrev}#v${verse}]]`;  // no chapter number
}
```

When adding a new single-chapter book, set `singleChapter: true` and verify
the Obsidian vault note filename has no chapter suffix.
