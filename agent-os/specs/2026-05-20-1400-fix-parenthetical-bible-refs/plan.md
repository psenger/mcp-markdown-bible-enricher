# Fix: Bible References Inside Parentheses Not Enriched

## Context

Issue #27. `(Genesis 3:5)` is silently skipped by the enricher. Root cause: the negative
lookbehind `(?<![\\[\\(])` in `BIBLE_REF_RE`, `SINGLE_CHAPTER_REF_RE`, and `BARE_CHAPTER_REF_RE`
blocks matching when the preceding character is `(`. Parentheses are a standard citation form
in biblical and theological writing and must not suppress enrichment.

The fix is to remove `(` from the negative lookbehind in all three regex patterns.
Idempotency is preserved by the `[` guard (which stops re-matching inside `[text](url)`)
and by the negative lookahead `(?![^\\[]*\\]\\()`.

---

## Execution Protocol (MANDATORY)

These rules govern any agent executing this plan. They are not optional.

1. **The checkbox is the source of truth.** A task is not complete until its checkbox in this file has been changed from `- [ ]` to `- [x]` using the Edit tool. Verbal claims of completion in chat are not completion.
2. **Flip immediately.** After finishing any action, edit this file to update the checkbox **before** beginning the next action. Do not batch checkbox updates across multiple tasks.
3. **Done-when gates are blocking.** If a task has a `### Done when` block, every item in it must be verifiably true before that task's checkbox may be flipped to `[x]`. No exceptions.
4. **Failure stops the run.** If any Done-when item cannot be satisfied, stop. Do not proceed to later tasks. Report the failure and wait for direction.
5. **No silent skips.** If a task is intentionally skipped, change `- [ ]` to `- [~]` and append a one-line note explaining why. Never delete a task.
6. **Self-audit before reporting completion.** Before telling the user the plan is done, re-read this file and confirm every checkbox is `[x]` or `[~]`. If any `[ ]` remains, the plan is not complete.

---

## Complexity

**Rating:** 2 — Simple

**Evidence:**
- `src/enrichment.ts`: remove `(` from lookbehind in 3 regex patterns (~line 96, ~207, ~258)
- `src/__tests__/enrichment.test.ts`: add ~12 new test cases
- `agent-os/standards/enrichment/double-link-prevention.md`: update documented lookbehind

**Model Recommendation:** Sonnet
**Reason:** Targeted one-character regex change with clear, unambiguous test coverage requirements.

---

## Task 1: Save spec documentation

- [x] Create `agent-os/specs/2026-05-20-1400-fix-parenthetical-bible-refs/` with plan.md, shape.md, standards.md, references.md

---

## Tasks (TDD — RED then GREEN)

- [x] **RED** — Add failing tests to `src/__tests__/enrichment.test.ts`:
  - New `describe('parenthetical references')` block covering:
    - Pass 2: `(Genesis 3:5)` → enriched; `> *Ye shall be as gods* (Genesis 3:5)` → enriched; `(John 3:16)` → enriched
    - Pass 2b: `(Jude 9)` → enriched; `(Obadiah 21)` → enriched
    - Pass 2c: `(Isaiah 53)` → enriched; `(Psalm 91)` → enriched
    - Idempotency: `enrichMarkdown(enrichMarkdown('(Genesis 3:5)')) === enrichMarkdown('(Genesis 3:5)')`
    - Guard still active: `([Genesis 3:5](url))` is NOT double-enriched
  - Confirmed: 7 new tests FAILED, 112 pre-existing passed

- [x] **GREEN** — In `src/enrichment.ts`, changed `(?<![\\[\\(])` → `(?<![\\[])` in:
  - `BIBLE_REF_RE` (line 96)
  - `SINGLE_CHAPTER_REF_RE` (line 207)
  - `BARE_CHAPTER_REF_RE` (line 258)
  - Confirmed: 141/141 tests pass

- [x] Updated `agent-os/standards/enrichment/double-link-prevention.md`:
  - Changed documented lookbehind from `(?<![\[\(])` to `(?<![\[])` with note that `(` is a valid citation context

### Done when
- [x] `npm test` exits 0 with no failures — 141/141 passed
- [~] `npm run lint` exits 0 — pre-existing failure: no eslint.config.js has ever existed in this repo (confirmed via git log); unrelated to this fix
- [x] `enrichMarkdown('(Genesis 3:5)')` output contains `[Genesis 3:5]`
- [x] `enrichMarkdown('(Jude 9)')` output contains `[Jude 9]`
- [x] `enrichMarkdown('(Isaiah 53)')` output contains `[Isaiah 53]`
- [x] Idempotency holds: second enrichment of parenthetical output is a no-op
