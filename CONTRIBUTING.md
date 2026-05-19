# Contributing

Contributions are welcome. Please read this document before opening a PR.

## Start with an issue

**Open an issue before writing any code.** This gives the maintainer a chance to confirm
the change is wanted, discuss the approach, and avoid wasted effort. PRs opened without a
linked issue may be closed without review.

- [Report a bug](https://github.com/psenger/mcp-markdown-bible-enricher/issues/new?template=bug_report.md)
- [Request a feature](https://github.com/psenger/mcp-markdown-bible-enricher/issues/new?template=feature_request.md)
- [Report a security vulnerability](./SECURITY.md) — do not use a public issue for security reports

## Contribution workflow

1. Open an issue and wait for a response before starting work
2. Fork the repository
3. Create a branch from `main`: `git checkout -b feat/123-short-description`
4. Make your changes (see code conventions below)
5. Ensure all tests pass: `npm test`
6. Push to your fork and open a PR against `main`
7. Fill in the PR template — link the issue your PR addresses

**PR review and merge is handled by the maintainer (@psenger).** Do not merge your own PR.
The maintainer may request changes, ask questions, or close the PR if it doesn't fit the
project direction.

## Development setup

```bash
git clone https://github.com/<your-fork>/mcp-markdown-bible-enricher.git
cd mcp-markdown-bible-enricher
npm install
npm run build
```

Test interactively with the MCP Inspector:

```bash
npm run inspect
```

Watch mode during development:

```bash
npm run dev
```

## Running tests

```bash
npm test                    # all tests
npm run test:watch          # watch mode
npm run test:coverage       # coverage report

# single file
node --experimental-vm-modules node_modules/jest/bin/jest.js src/__tests__/enrichment.test.ts

# by pattern
npm test -- --testPathPattern="enrichment"
```

**Config module cache:** `loadConfig()` runs at module initialisation, so `process.env` changes
in `beforeEach` do not affect it. Use `jest.resetModules()` and dynamic `import()` inside the
test body when you need to test different env configurations. See
`agent-os/standards/testing/config-module-cache-limitation`.

## Agent OS workflow

This project uses [Agent OS v3](https://buildermethods.com/agent-os) to manage coding conventions and feature specs. Install Agent OS before contributing — the workflow below depends on its slash commands inside Claude Code.

[Install Agent OS →](https://buildermethods.com/agent-os/installation)

### Step 1 — Inject relevant standards before writing any code

`agent-os/standards/` contains the conventions for this codebase, indexed in `agent-os/standards/index.yml`. At the start of every task, run:

```
/inject-standards
```

Agent OS reads `index.yml`, analyses your current conversation context, and presents the relevant standards to confirm. You can also be explicit about which domain you need:

```
/inject-standards enrichment
/inject-standards books
/inject-standards enrichment books
```

| Changing… | Domain to inject |
|---|---|
| Enrichment pipeline (`src/enrichment.ts`) | `enrichment` |
| Book map (`src/books.ts`) | `books` |
| Config loading (`src/config.ts`) | `config` |
| Test patterns | `testing` |

Do not write code until the relevant standards are loaded. The standards contain constraints that are not obvious from the code and that the PR checklist will verify.

### Step 2 — Plan significant features with a spec

For anything beyond a small bug fix, create a spec before writing code. A spec captures scope, decisions, and the standards that apply — it is what reviewers read to understand *why* the code looks the way it does.

1. In Claude Code, type `/plan` to activate plan mode.
2. Run `/shape-spec`. It asks:
   - **What are you building?** Describe the feature and paste the issue number.
   - **Are there similar patterns in the codebase?** Point at files or features to reference.
   - **Which standards apply?** Auto-suggested from `index.yml` — confirm or adjust.
3. Agent OS builds a full implementation plan. Task 1 is always "save spec documentation" — the spec folder is written before any code is touched.
4. Review the plan, then approve. Scope changes after approval must be reflected back in the spec.

The spec is saved to:

```
agent-os/specs/YYYY-MM-DD-HHMM-short-description/
├── plan.md        — full implementation plan
├── shape.md       — scope, decisions, open questions
├── references.md  — pointers to similar existing code
└── standards.md   — full content of the relevant standards
```

Include the spec folder path in your PR description.

### Standards vs skills

`agent-os/standards/` files describe **conventions** (what to follow). `.claude/skills/` files describe **procedures** (owner-operated tasks such as cutting a release). Contributors do not create or modify skills.

## Code conventions

**TypeScript:**
- ES Modules throughout — always use `.js` extensions in imports even though source files are `.ts`
- Strict mode; target ES2022
- No comments unless the *why* is non-obvious

**Regex patterns:**
- Every Bible reference regex must use a negative lookbehind for `[(` and a negative lookahead
  for `]()` to prevent double-enriching already-linked text
- Test any change to `BIBLE_REF_RE`, `SINGLE_CHAPTER_REF_RE`, or `BARE_CHAPTER_REF_RE` against:
  `1 Samuel 16:1, 16:4-13`, `Matthew 2:1-6, 11-12`, `Jude 9-14`
- The five enrichment passes in `enrichMarkdown()` are order-dependent and must not be reordered
  — see `agent-os/standards/enrichment/three-pass-ordering`

**Book map (`src/books.ts`):**
- Keys in `BOOK_MAP` are lowercase — `lookupBook()` normalises input before lookup
- All alternative names (e.g. `"ecclesiasticus"`, `"wisdom of ben sira"`) must map to the same
  `BookInfo` as the canonical name
- Set `singleChapter: true` only for books with exactly one chapter (Obadiah, Philemon, 2 John,
  3 John, Jude) — this changes the Obsidian link format from `[[Abbrev-01#vN]]` to `[[Abbrev#vN]]`
- See `agent-os/standards/books/` for full conventions

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Format

```
<type>[optional scope]: <short description>  ← 72 chars max, imperative mood

[optional body]
- What changed and why (one bullet per logical change)
- Focus on the reason, not the mechanism — the diff shows the what

[optional footer]
Closes #<issue-number>
BREAKING CHANGE: <description>  ← only if applicable
```

### Type reference

| Type | When to use |
|---|---|
| `feat` | New capability visible to users (new book alias, new reference pattern) |
| `fix` | Corrects wrong behaviour (regex mismatch, incorrect URL encoding) |
| `docs` | README, CONTRIBUTING, inline comments only — no code change |
| `refactor` | Code restructure with no behaviour change |
| `test` | Add or fix tests only |
| `chore` | Dependency bumps, build config, tooling |
| `build` | Changes to the build system (`tsconfig`, `package.json` scripts) |
| `ci` | GitHub Actions, CI config |

### Full example

```
feat(books): add Tobit bare-chapter reference support

- Extend BOOK_MAP entry for Tobit with singleChapter: false
- Add Tobit to BARE_CHAPTER_REF_RE alternation group
- Add test cases for Tobit 3, Tobit 12-14

Tobit bare-chapter refs ("Tobit 3") were silently skipped because the
book was missing from the chapter-only regex pass. Catholic study notes
commonly cite entire chapters rather than individual verses.

Closes #57
```

### Checklist before committing

- [ ] Subject line is 72 characters or fewer and uses imperative mood ("add", not "added")
- [ ] Body bullets explain *why* the change was made, not just *what* changed
- [ ] Breaking changes marked with `!` after the type or `BREAKING CHANGE:` in the footer
- [ ] Issue linked with `Closes #N` in the footer
- [ ] `npm test` passes with no failures