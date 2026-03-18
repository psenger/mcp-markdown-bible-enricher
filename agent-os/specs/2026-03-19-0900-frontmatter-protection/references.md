# References

## Source Files Studied

### `src/enrichment.ts`

- `enrichMarkdown()` at line 313 — the function to modify
- All 5 regex passes: BACKTICK_BIBLE_RE (pass 1), BIBLE_REF_RE (pass 2), SINGLE_CHAPTER_REF_RE (pass 2b), BARE_CHAPTER_REF_RE (pass 2c), CCC_RE (pass 3)
- `parseChapterVerse()` at line 133 — unchanged, operates on captured text, not raw document
- `enrichBibleRef()` at line 170 — unchanged
- `enrichSingleChapterBibleRef()` at line 222 — unchanged
- `enrichBareChapterRef()` at line 273 — unchanged
- `enrichCccRef()` at line 302 — unchanged

### `src/__tests__/enrichment.test.ts`

- 112 existing tests as of 2026-03-19
- Test structure uses `describe` blocks per feature area
- `beforeEach` sets `process.env.BIBLE_VERSION`, `OBSIDIAN_FORMAT`, `INCLUDE_OBSIDIAN_LINKS`
- New `describe('frontmatter protection')` block added at end of file

## Test Patterns Used

From existing tests:
- `expect(output).toContain(...)` — positive assertions
- `expect(output).toBe(input)` — exact match for no-change cases
- `expect(enrichMarkdown(enrichMarkdown(input))).toBe(enrichMarkdown(input))` — idempotency

## GitHub Issue

- Issue #15: https://github.com/psenger/mcp-markdown-bible-enricher/issues/15

## Standards

- `agent-os/standards/enrichment/three-pass-ordering.md`
- `agent-os/standards/enrichment/double-link-prevention.md`
- `agent-os/standards/global/tdd-workflow.md`
- `agent-os/standards/enrichment/frontmatter-awareness.md` (new)
