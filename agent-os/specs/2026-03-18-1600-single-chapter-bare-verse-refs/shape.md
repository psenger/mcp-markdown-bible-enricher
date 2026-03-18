# Shaping Notes: Single-Chapter Bare Verse References

## Problem

`BIBLE_REF_RE` requires `chapter:verse` syntax (a colon separator). For single-chapter books
(Obadiah, Philemon, 2 John, 3 John, Jude), it is conventional to omit the chapter number and
cite a verse directly: `"Jude 9"` rather than `"Jude 1:9"`. Neither form currently produces
a link for the bare-verse form.

## Root Cause

The regex group 2 in `BIBLE_REF_RE`:
```
([\d]+\s*[:.]\s*[\d]+...)
```
requires at least one `chapter:verse` pair. A bare `"9"` without a colon never satisfies this
constraint, so `"Jude 9"` is silently skipped.

## Solution Shape

**New pass 2b** — a dedicated regex `SINGLE_CHAPTER_REF_RE` that matches
`<SingleChapterBookName> <verse-or-range>` where the verse spec has NO colon.

Key decisions:
- Do NOT modify `BIBLE_REF_RE` (risk of regression across all books)
- `chapter` is always implied as `1` for single-chapter books
- Obsidian link format: `[[Abbrev#vN]]` (no chapter number, per single-chapter book standard)
- Bible Gateway URL: `BookName 1:N` (explicit chapter 1 for BG query)
- Same negative lookbehind/lookahead guards as existing passes for idempotency

## Edge Cases

- `"2 John 1:9"` — has colon, handled by pass 2 (BIBLE_REF_RE); pass 2b won't re-match
  because pass 2 enriches it first and the lookbehind blocks re-matching
- `"Jude 9-14"` — verse range, captured as a single group and split for Obsidian links
- `"[Jude 9](https://...)"` — already linked, negative lookbehind blocks re-matching
- Idempotency — enriched output contains `[Jude 9]` inside `[...]`, lookbehind blocks re-match
