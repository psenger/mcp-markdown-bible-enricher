---
name: changelog
description: >
  Updates CHANGELOG.md by collecting git commits since the last tag, categorising
  them into Keep a Changelog v1.1.0 sections (Added, Changed, Fixed, etc.), and
  cutting a new versioned release entry. Called autonomously by the `release` skill.
  Accepts VERSION and optional DATE arguments. Do not trigger on general conversation
  — only activate when explicitly called by another skill or invoked directly as
  /changelog <version> [date].
---

# Changelog Skill

## Usage

Called by the `release` skill, or directly:

```
/changelog <version>
/changelog <version> <date>
```

Examples:
```
/changelog 1.2.0
/changelog 1.2.0 2026-05-19
```

Arguments:
- `VERSION` — required. Semantic version string, e.g. `1.2.0` or `2.0.0-beta.1`.
- `DATE` — optional. ISO date `YYYY-MM-DD`. Defaults to today.
- `MAX_FULL_ENTRIES` — optional. Integer. When the file already contains more than this many
  versioned entries, entries beyond the threshold are collapsed to links-only (heading and
  comparison link remain; entry body is removed). Default: no limit (all entries kept in full).

---

## Commit-to-Section Mapping

Conventional Commits prefixes map to Keep a Changelog sections:

| Commit prefix | Changelog section |
|---|---|
| `feat:` / `feat!:` | Added |
| `fix:` / `fix!:` | Fixed |
| `security:` | Security |
| `deprecate:` | Deprecated |
| `remove:` / `revert:` | Removed |
| `refactor:` / `perf:` / `style:` | Changed |
| `docs:` | Changed |
| `chore:` / `ci:` / `build:` / `test:` | *(skip — not user-facing)* |
| *(no recognised prefix)* | Changed |
| Any commit with `BREAKING CHANGE` in body or `!` after type | Prefix entry with **BREAKING:** |

**Chores that are always skipped, even when they look meaningful:**

- Version bump commits ("Bump version to X.Y.Z", "chore: release X.Y.Z") — the versioned heading
  itself is the release record; a separate entry would duplicate it.
- Tagging commits — implied by the heading date and comparison link.
- Dependency version bumps (`build(deps):`, `chore(deps):`) without an explicit security advisory
  callout in the commit body — purely internal. If a commit message explicitly names a CVE or
  advisory (e.g. "fix CVE-2025-1234"), treat it as `security:` and include it under Security.
- Changelog update commits ("docs: update CHANGELOG") — the file is self-describing.

---

## Step 1 — Resolve Arguments

Parse `VERSION` from the argument. If missing, stop:

> "Usage: /changelog <version> [date]
> Example: /changelog 1.2.0"

Resolve `DATE`: use the supplied date if provided, otherwise use today's date in `YYYY-MM-DD` format.

---

## Step 2 — Detect Repository Context

```bash
# Get the GitHub repo URL for comparison links
git remote get-url origin
```

Derive `REPO_URL` in `https://github.com/{owner}/{repo}` form by converting SSH remote syntax
(`git@github.com:{owner}/{repo}.git`) if needed.

---

## Step 3 — Find the Last Tag

```bash
git tag --sort=-version:refname | head -1
```

Store as `LAST_TAG`. If no tags exist, store as empty string and collect the full commit history
in Step 4.

---

## Step 4 — Collect Commits

```bash
# With a previous tag
git log {LAST_TAG}..HEAD --oneline --no-merges --format="%s"

# No previous tag — full history
git log --oneline --no-merges --format="%s"
```

Collect all commit subjects. Ignore merge commits (`--no-merges`). Store as `COMMITS`.

---

## Step 5 — Categorise Commits

For each commit subject in `COMMITS`:

1. Strip the scope, e.g. `feat(books): add Sirach alias` → type `feat`, message `add Sirach alias`.
2. Check for `!` after the type or `BREAKING CHANGE` in the full commit body — if present, mark as breaking.
3. Map the type to a section using the table above.
4. Skip commits that map to *(skip)*.
5. Format each entry as `- {message}` (sentence-case, no trailing period).
6. Prefix breaking entries: `- **BREAKING:** {message}`.

Build a map of section → list of entries. Only include sections that have at least one entry.

Section order in output: Added, Changed, Deprecated, Removed, Fixed, Security.

---

## Step 6 — Bootstrap CHANGELOG.md if Missing

If `CHANGELOG.md` does not exist at the project root, create it:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!-- comparison links — maintained automatically by the changelog skill -->
```

---

## Step 7 — Build the New Release Section

Construct the versioned entry block:

```markdown
## [{VERSION}] - {DATE}

### Added
- entry one
- entry two

### Fixed
- entry three
```

Only include section headings that have entries. If `COMMITS` is empty (no user-facing changes),
add a single entry under Changed:

```markdown
### Changed
- Internal maintenance and dependency updates
```

---

## Step 8 — Update CHANGELOG.md

Read the current `CHANGELOG.md`. Apply these edits in order:

1. **Replace the `## [Unreleased]` block** — remove all content between `## [Unreleased]` and
   the next `## [` heading (or end of file before the links section). Insert the new versioned
   release section in its place.

2. **Re-insert a blank `## [Unreleased]` section** above the new versioned section:

   ```markdown
   ## [Unreleased]

   ## [{VERSION}] - {DATE}
   ...
   ```

3. **Update or create comparison links** at the bottom of the file. The links section sits below
   all versioned entries. Maintain this structure:

   ```markdown
   [Unreleased]: {REPO_URL}/compare/v{VERSION}...HEAD
   [{VERSION}]: {REPO_URL}/compare/v{PREV_TAG}...v{VERSION}
   [{PREV_TAG}]: ...
   ```

   Where `PREV_TAG` is `LAST_TAG` (without a leading `v` added twice — match the existing tag
   format in the repo). If there is no previous tag, the first versioned link uses the first
   commit SHA:

   ```markdown
   [{VERSION}]: {REPO_URL}/commits/v{VERSION}
   ```

Write the updated content back to `CHANGELOG.md`.

---

## Step 8b — Apply History Threshold (optional)

Only runs when `MAX_FULL_ENTRIES` was supplied.

Count the versioned entries in the file (every `## [X.Y.Z]` heading that is not `## [Unreleased]`).
If the count exceeds `MAX_FULL_ENTRIES`, collapse the oldest entries down to links-only:

**Before (full entry):**
```markdown
## [0.1.0] - 2026-01-15

### Added
- Initial release with bible_enrich_markdown tool
```

**After (links-only):**
```markdown
## [0.1.0] - 2026-01-15

*See the [0.1.0 comparison](comparison-link) for details.*
```

Rules:
- Collapse from the oldest entry upward until the count of full entries equals `MAX_FULL_ENTRIES`.
- The newest `MAX_FULL_ENTRIES` entries always remain in full.
- Never collapse `[Unreleased]`.
- The comparison link at the bottom is always preserved regardless of threshold.
- If the file already has links-only entries and the count of full entries is within the threshold,
  do nothing — do not re-expand collapsed entries.

---

## Step 9 — Report

Print:

```
CHANGELOG.md updated
  Version:       {VERSION}
  Date:          {DATE}
  Sections:      {comma-separated list of sections written, e.g. "Added, Fixed"}
  Commits:       {N} user-facing commits included ({M} skipped as internal)
  Links:         comparison links updated
  Collapsed:     {K} old entries reduced to links-only  (omit line if K = 0)
```

Return control to the calling skill (e.g. `release`) without creating a git commit —
committing is the responsibility of the caller.

---

## Behavioral Rules

- Never commit or stage files — the caller is responsible for that.
- Never invent entries not present in the git log.
- Never remove existing versioned entries from the changelog.
- If `CHANGELOG.md` already contains an entry for `VERSION`, stop:
  > "CHANGELOG.md already has an entry for {VERSION}. Bump the version or edit the file manually."
- Preserve any manually written content in the `## [Unreleased]` section by including it in the
  new versioned entry before the auto-generated entries (manual entries first, then git-derived).
- Never re-expand a previously collapsed (links-only) entry, even if `MAX_FULL_ENTRIES` is raised.
- When `MAX_FULL_ENTRIES` is not supplied, never collapse any entries — the default is no limit.
