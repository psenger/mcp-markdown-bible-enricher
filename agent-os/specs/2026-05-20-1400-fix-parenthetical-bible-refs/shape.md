# Fix Parenthetical Bible References — Shaping Notes

## Scope

Remove `(` from the negative lookbehind in `BIBLE_REF_RE`, `SINGLE_CHAPTER_REF_RE`, and
`BARE_CHAPTER_REF_RE`. Parentheses are a valid citation form in theological writing
(e.g. "Ye shall be as gods (Genesis 3:5)") and must not suppress enrichment.

## Decisions

- Remove `(` from lookbehind in all 3 patterns (not just `BIBLE_REF_RE`)
- Idempotency is preserved by the `[` guard + negative lookahead — no additional guard needed
- No behaviour change for `CCC_RE` (it uses `(?<!\[)` not `(?<![\[\(])`)

## Context

- Visuals: None
- References: `src/enrichment.ts` (all 3 regex patterns); `src/__tests__/enrichment.test.ts`
- Product alignment: Core MVP enrichment capability; issue #27

## Standards Applied

- `enrichment/double-link-prevention` — the lookbehind being corrected is documented here
- `enrichment/three-pass-ordering` — fix applies to passes 2, 2b, and 2c
- `global/tdd-workflow` — tests written before implementation (TDD)
