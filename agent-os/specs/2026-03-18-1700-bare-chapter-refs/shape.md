# Shaping Notes: Bare Chapter References

## Problem

`BIBLE_REF_RE` group 2 requires `chapter:verse` with a colon. `"Psalm 91"` and `"Isaiah 53"`
have no colon, so they are silently skipped.

## Solution Shape

**New pass 2c** — `BARE_CHAPTER_REF_RE` — inserted after pass 2b, before CCC (pass 3).

- Reuses the same `bookPattern` alternation as `BIBLE_REF_RE`
- Group 2 captures a bare digit (no colon)
- Negative lookahead `(?![:\.\d])` prevents matching `"John 3:16"` (colon follows)
- Same lookbehind/lookahead guards for idempotency and already-linked protection
- Pass ordering ensures `BIBLE_REF_RE` (pass 2) and `SINGLE_CHAPTER_REF_RE` (pass 2b) run first;
  enriched text is protected from re-matching by the lookbehind

## Output Format

For `"Psalm 91"`:
```
[Psalm 91](https://www.biblegateway.com/passage/?search=Psalm%2091&version=NRSVCE) ( [[Ps-91]] )
```

Obsidian link: `[[{abbrev}-{chapter2}]]` — chapter zero-padded, no `#v{verse}` anchor.

## Edge Cases

- `"John 3:16"` — has colon; enriched by pass 2 before pass 2c runs; lookbehind blocks re-match
- `"Jude 9"` — single-chapter book; enriched by pass 2b; lookbehind blocks re-match by pass 2c
- `"1 Corinthians 13"` — numbered book; `lookupBook("1 Corinthians")` → `{ abbrev: "1 Cor" }`
- `"Psalm 91;"` — trailing semicolon not consumed; enrichment is clean
