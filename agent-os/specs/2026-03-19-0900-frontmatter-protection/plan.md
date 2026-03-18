# Fix: Frontmatter Protection in enrichMarkdown()

## Context

`enrichMarkdown()` treats the entire file as one flat string and runs all five regex passes over
it without any structural awareness. YAML frontmatter — the `---` delimited block at the very
start of a Markdown file — is valid YAML, not prose. If a user stores Bible references there
(e.g. as Obsidian tags like `- Jude 9` or `- John 3:16`), the enricher's regexes corrupt the
frontmatter by injecting Markdown link syntax into YAML values. This breaks Obsidian, Hugo,
Jekyll, and any other tool that parses frontmatter.

**Scope:** Protect YAML frontmatter only. Fenced code blocks are out of scope.

---

## Critical Files

- `src/enrichment.ts` — `enrichMarkdown()` (line 313), all pass regexes
- `src/__tests__/enrichment.test.ts` — test suite to extend (currently ~112 tests)
- `agent-os/standards/enrichment/frontmatter-awareness.md` — new standard to create
- `agent-os/standards/index.yml` — add entry for new standard

---

## Task 0: Create GitHub Issue

Open a detailed GitHub issue covering the problem, impact, and acceptance criteria before any
code is written. Label it `bug`. GitHub issue: #15

---

## Task 1: Save Spec Documentation

Create `agent-os/specs/2026-03-19-0900-frontmatter-protection/` containing:

- `plan.md` — this plan
- `shape.md` — shaping notes
- `standards.md` — relevant standards (tdd-workflow, three-pass-ordering, double-link-prevention)
- `references.md` — pointers to enrichment.ts and test patterns studied

Commit: `docs: add spec for frontmatter protection`

---

## Task 2: Add New Standard

Create `agent-os/standards/enrichment/frontmatter-awareness.md`.

Add to `agent-os/standards/index.yml` under `enrichment:`.

Commit: `docs: add frontmatter-awareness standard`

---

## Task 3: Write Failing Tests (RED)

Add `describe('frontmatter protection')` block to `src/__tests__/enrichment.test.ts`.

18 tests covering:
- Basic frontmatter preservation (5 tests)
- Body still enriched when frontmatter present (4 tests)
- No regression when no frontmatter (3 tests)
- Edge cases (6 tests including idempotency)

Commit: `test: add failing tests for frontmatter protection`
Confirm all 18 tests are **RED** before proceeding.

---

## Task 4: Implement (GREEN)

Add `splitFrontmatter()` helper to `src/enrichment.ts`.
Update `enrichMarkdown()` to call `splitFrontmatter()` before all passes.

Commit: `feat: protect YAML frontmatter from enrichment`
Confirm all 18 tests are **GREEN**.

---

## Task 5: Refactor & Final Verification

- Confirm `splitFrontmatter` is a pure function (no side effects, no module state)
- Run full test suite: `npm test` — all 130+ tests must pass
- Run `npm run build` — TypeScript must compile cleanly

Commit: `refactor: tidy frontmatter split helper`

---

## Verification

```bash
npm test              # all tests green
npm run build         # TypeScript compiles cleanly
npm run inspect       # smoke test with frontmatter document in MCP Inspector
```

**Smoke test input:**
```markdown
---
tags:
  - Jude 9
  - John 3:16
  - Isaiah 53
  - CCC 528
---

Read Jude 9 and John 3:16 for context. See Isaiah 53 and CCC 528.
```

**Expected:** frontmatter block byte-for-byte identical to input; body fully enriched with Bible Gateway links and Obsidian wiki-links.

---

## Standards Applied

- `enrichment/three-pass-ordering` — frontmatter strip must happen before pass 1
- `enrichment/double-link-prevention` — unchanged; still applies to body only
- `global/tdd-workflow` — RED first (all 18 tests committed failing), then GREEN, then refactor
- `enrichment/frontmatter-awareness` — new standard created in Task 2
