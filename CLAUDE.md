# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP server that enriches Markdown documents with:
- **Bible Gateway links** (NRSVCE by default) for Bible references
- **Obsidian wiki-links** for cross-referencing in Obsidian vaults
- **Catholic Cross Reference links** for Catechism of the Catholic Church (CCC) references

Supports all 73 books of the Catholic Bible, including the 7 deuterocanonical books (Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees). Enrichment is **deterministic** — regex-based, no LLM inference involved in the transformation.

## Development Commands

```bash
npm run build          # compile TypeScript to dist/
npm run dev            # watch mode (tsx)
npm run inspect        # MCP Inspector browser GUI
npm test               # run all unit tests
npm run test:watch     # watch mode
npm run test:coverage  # coverage report
npm run lint           # ESLint
npm run format         # Prettier (writes)
npm run format:check   # Prettier (check only)
npm run clean          # remove dist/
```

Run a single test file:
```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js src/__tests__/enrichment.test.ts
```

Or by pattern:
```bash
npm test -- --testPathPattern="enrichment"
```

## Architecture

### Entry point: `src/index.ts`

Creates an MCP server using `@modelcontextprotocol/sdk` with stdio transport. Registers:
- **Tools**: `bible_enrich_markdown` (string → string), `bible_enrich_file` (file path → file)
- **Prompts**: `bible_enrich_document` (instructs Claude to call the tool), `help` (inline docs)

### Core logic: `src/enrichment.ts`

`enrichMarkdown()` is the single exported function. It strips YAML frontmatter first (reattaches it unchanged at the end), then applies **five sequential regex passes** to the body:

| Pass | Regex | Handles |
|---|---|---|
| 1 | `BACKTICK_BIBLE_RE` | Backtick-wrapped refs like `` `1 Samuel 16:1:` `` — unwraps then enriches |
| 2 | `BIBLE_REF_RE` | Plain-text `chapter:verse` refs not already inside a Markdown link |
| 2b | `SINGLE_CHAPTER_REF_RE` | Bare-verse refs for single-chapter books: `Jude 9`, `Obadiah 21` |
| 2c | `BARE_CHAPTER_REF_RE` | Chapter-only refs: `Isaiah 53`, `Psalm 91` |
| 3 | `CCC_RE` | Catechism refs: `CCC 528`, `CCC 528-530, 610-612` |

**Pass ordering is fixed and load-bearing.** Passes 2b and 2c run after pass 2 so that already-enriched text is protected by the negative lookbehind; pass 2c runs after 2b so single-chapter books aren't double-processed. See `agent-os/standards/enrichment/three-pass-ordering` for the rationale.

**Idempotency guards:** every Bible regex uses a negative lookbehind for `[(` and a negative lookahead for `]()` to skip text already inside Markdown links.

**Implicit chapter inheritance:** `parseChapterVerse()` propagates the last seen chapter across comma-separated groups, so `16:1, 4-13` produces chapter 16 for both groups.

**Single-chapter book Obsidian format:** `Jude 9` → `[[Jude#v9]]` (no chapter digits); regular books → `[[Matt-05#v3]]`. The `singleChapter` flag on `BookInfo` controls this branch.

### Book mapping: `src/books.ts`

- `BOOK_MAP`: `Record<string, BookInfo>` keyed by **lowercase** book name. Values: `{ abbrev, singleChapter }`.
- `SINGLE_CHAPTER_BOOKS`: derived string array used to build `SINGLE_CHAPTER_REF_RE`.
- `lookupBook()`: case-insensitive lookup that normalises input to lowercase before accessing `BOOK_MAP`.

Alternative names map to the same entry (e.g., `"ecclesiasticus"` and `"wisdom of ben sira"` both resolve to `Sir`).

### Configuration: `src/config.ts`

`loadConfig()` reads env vars once at **module initialisation** (top-level call in `enrichment.ts`). There is no way to change config at runtime — the server must restart. This has a direct consequence for tests: `process.env` changes in `beforeEach` do **not** affect `config` because the module is already initialised. Use `jest.resetModules()` and dynamic `import()` inside individual tests when you need to test different env configurations. See `agent-os/standards/testing/config-module-cache-limitation`.

| Variable | Default | Notes |
|---|---|---|
| `BIBLE_VERSION` | `NRSVCE` | Translation used in Bible Gateway URLs |
| `OBSIDIAN_FORMAT` | `[[{abbrev}-{chapter2}#v{verse}]]` | Placeholders: `{abbrev}`, `{chapter}`, `{chapter2}`, `{verse}` |
| `INCLUDE_OBSIDIAN_LINKS` | `true` | Only `"false"` disables; any other value enables |

## TypeScript Configuration

- ES Modules (`"type": "module"` in package.json)
- Always use `.js` extensions in imports even though source files are `.ts` — required for Node16 module resolution
- Compiles `src/` → `dist/`, target ES2022, strict mode

## Regex Pattern Guidelines

When modifying `BIBLE_REF_RE`, `SINGLE_CHAPTER_REF_RE`, or `BARE_CHAPTER_REF_RE`:

- Test against complex patterns: `1 Samuel 16:1, 16:4-13`, `Matthew 2:1-6, 11-12`, `Jude 9-14`
- Verify the negative lookbehind/lookahead still prevents matching inside existing `[text](url)` links
- Run the enrichment tests after any change — they cover idempotency (enriching already-enriched output must produce no further changes)
- `BOOK_NAMES` in `enrichment.ts` and `BOOK_MAP` in `books.ts` must stay in sync when adding new books or aliases

## agent-os/ Directory

Machine-readable specs and standards that capture design decisions not obvious from the code:

```
agent-os/
├── specs/           # per-feature change specs (timestamped)
└── standards/
    ├── index.yml    # index of all standards with one-line descriptions
    ├── books/       # BOOK_MAP key casing rules, abbrev sourcing, alternative name pattern
    ├── config/      # config loading lifecycle, INCLUDE_OBSIDIAN_LINKS opt-out semantics
    ├── enrichment/  # regex pass ordering, lookbehind guards, chapter inheritance
    ├── global/      # cross-cutting principles
    └── testing/     # Jest module cache limitation for config tests
```

Before changing the enrichment pipeline, book map, or config loading, read the relevant standard first. When proposing a new feature, create a spec under `agent-os/specs/` following the existing timestamp-slug naming convention.

## Skills (slash commands)

Four skills in `.claude/skills/` handle owner-operated workflows:

| Skill | Invocation | Purpose |
|---|---|---|
| `start-work-on-an-issue` | `/start-work-on-an-issue <number>` | Checks out `main`, creates a typed branch, assigns the GitHub issue |
| `changelog` | `/changelog <version> [date]` | Collects commits since the last tag and writes a versioned CHANGELOG entry |
| `start-a-release` | `/start-a-release <version>` | Cuts a release branch, bumps `package.json`, runs `/changelog`, opens a PR |
| `complete-a-release` | `/complete-a-release <version>` | After the release PR merges — creates the annotated tag and GitHub release |

Release sequence: `/start-a-release` → merge the PR → `/complete-a-release`.

Branches follow `{type}/{issue-number}-{slug}` (e.g. `feat/29-add-bare-chapter-refs`); `start-work-on-an-issue` derives this from issue labels and title automatically.

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`.

Breaking changes: add `!` after the type (`feat!:`) or include `BREAKING CHANGE:` in the footer.

Examples:

```
feat: add bare-verse support for single-chapter books
fix: correct lookahead in SINGLE_CHAPTER_REF_RE
docs: update Obsidian format examples in README
chore: bump @modelcontextprotocol/sdk to 1.13.0
feat!: change default OBSIDIAN_FORMAT placeholder syntax

BREAKING CHANGE: {chap} renamed to {chapter2} in OBSIDIAN_FORMAT templates
```

Never add `Co-Authored-By` trailers.

## Pull Request Format

PRs must use the template at `.github/PULL_REQUEST_TEMPLATE.md`. Required sections:

- **Linked issue** — every PR must close an issue (`Closes #N`)
- **What changed and why** — explain the motivation, not just the diff
- **Test plan** — include the exact input Markdown and expected enriched output for any new or changed patterns
- **Checklist** — all boxes must be ticked before requesting review

PR title should follow the same Conventional Commits format as commit messages. The maintainer (@psenger) handles review and merge — never merge your own PR.