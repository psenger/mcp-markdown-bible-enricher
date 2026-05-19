---
name: start-a-release
description: >
  Opens a release PR for a given version. Validates the environment, cuts a
  release/v{VERSION} branch from the default branch, bumps package.json, updates
  CHANGELOG.md via the changelog skill, commits, pushes, and opens a PR to main.
  Invoked explicitly as /start-a-release <version> (e.g. /start-a-release 0.3.0).
  Do not trigger on general conversation about releases — only activate on an
  explicit invocation with a version argument.
---

# Start a Release

## Usage

```
/start-a-release <version>
```

Examples:
```
/start-a-release 0.3.0
/start-a-release 1.0.0
/start-a-release 2.1.0-beta.1
```

Arguments:
- `VERSION` — required. Target semantic version string, e.g. `0.3.0`.

---

## Step 1 — Parse and Validate the Version Argument

Extract `VERSION` from the argument. If missing or not a valid semver string, stop:

> "Usage: /start-a-release <version>
> Example: /start-a-release 0.3.0
> Version must be a valid semantic version (MAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH-prerelease)."

Read the current version from `package.json`:

```bash
node -e "const p = JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log(p.version)"
```

Store as `CURRENT_VERSION`. Compare `VERSION` against `CURRENT_VERSION` using semver ordering.
If `VERSION` is not strictly greater than `CURRENT_VERSION`, stop:

> "VERSION {VERSION} is not greater than the current version {CURRENT_VERSION}.
> Choose a higher version number."

---

## Step 2 — Environment Pre-flight

Run in parallel:

```bash
# A1: detect default branch
git remote show origin | grep 'HEAD branch' | awk '{print $NF}'

# A2: current branch
git branch --show-current

# A3: working tree status
git status --porcelain

# A4: commits behind origin default branch
git fetch origin --quiet
git rev-list HEAD..origin/{DEFAULT_BRANCH} --count 2>/dev/null || echo "0"
```

**Split A3 output into:**
- `DIRTY_FILES` — lines where first two chars include `M`, `A`, `D`, `R`, `C`, `U`
- `UNTRACKED_FILES` — lines starting with `??`

Present a pre-flight checklist:

```
Pre-flight for release {VERSION}
─────────────────────────────────
[✓ or ✗] On default branch    current: {CURRENT_BRANCH}  required: {DEFAULT_BRANCH}
[✓ or ✗] Working tree clean   {N modified/staged files, or "clean"}
[✓ or ✗] Up to date           {N commits behind, or "up to date"}
```

**If `CURRENT_BRANCH` != `DEFAULT_BRANCH`**, stop:

> "You must be on `{DEFAULT_BRANCH}` to start a release. Switch branches and try again."

**If `DIRTY_FILES` is non-empty**, stop:

> "Your working tree has modified or staged files. Commit or stash them first.
> {list each dirty file}"

**If `COMMITS_BEHIND` > 0**, stop:

> "{COMMITS_BEHIND} commit(s) behind origin/{DEFAULT_BRANCH}. Run `git pull` first."

**If `UNTRACKED_FILES` is non-empty**, list them and ask:

> "Untracked files found:
>     {list each}
> These will follow onto the release branch. Continue? (yes / abort)"

Wait for confirmation. If abort, stop.

---

## Step 3 — Confirm the Release Plan

Show the user exactly what will happen:

```
Release plan for v{VERSION}
───────────────────────────────────────────────
Current version:  {CURRENT_VERSION}
Target version:   {VERSION}
Release branch:   release/v{VERSION}  (new, from {DEFAULT_BRANCH})

Actions:
  1. git checkout -b release/v{VERSION}
  2. Bump version in package.json  {CURRENT_VERSION} → {VERSION}
  3. Run /changelog {VERSION}  (update CHANGELOG.md)
  4. git add package.json CHANGELOG.md
  5. git commit -m "chore: release {VERSION}"
  6. git push origin release/v{VERSION}
  7. Open PR:  release/v{VERSION} → {DEFAULT_BRANCH}
```

Ask:

> "Shall I proceed? (yes / cancel)"

Wait for explicit confirmation before continuing.

---

## Step 4 — Create the Release Branch

Check if the branch already exists:

```bash
git branch --list release/v{VERSION}
```

If it exists locally, stop:

> "Branch `release/v{VERSION}` already exists. Delete it or choose a different version."

Check if it exists on the remote:

```bash
git ls-remote --heads origin release/v{VERSION}
```

If it exists on the remote, stop with the same message.

Otherwise:

```bash
git checkout -b release/v{VERSION}
```

---

## Step 5 — Bump the Version in package.json

Read `package.json`, update the `"version"` field to `VERSION`, and write it back.
Preserve all other content and formatting exactly — do not reformat the file.

Verify the change:

```bash
node -e "const p = JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log(p.version)"
```

Confirm it prints `{VERSION}`. If not, stop and report the error.

---

## Step 6 — Update CHANGELOG.md

Call the `changelog` skill:

```
/changelog {VERSION}
```

The changelog skill will:
- Collect commits since the last git tag
- Categorise them into Keep a Changelog sections
- Cut a new `## [{VERSION}] - {DATE}` entry
- Update the comparison links at the bottom

After the skill completes, read the new `## [{VERSION}]` entry from `CHANGELOG.md` and store it
as `RELEASE_NOTES` — it will be used as the PR body and later as the GitHub release notes.

---

## Step 7 — Commit the Changes

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release {VERSION}"
```

If the commit fails, stop and report the error. Do not proceed to push.

---

## Step 8 — Push the Branch

```bash
git push origin release/v{VERSION}
```

If the push fails (e.g. auth error, remote rejects), stop and report:

> "Push failed. Check your remote access and try again.
> Error: {error message}"

---

## Step 9 — Open the Pull Request

**If MCP GitHub tools are available**, use `mcp__github__create_pull_request`:
- title: `chore: release {VERSION}`
- base: `{DEFAULT_BRANCH}`
- head: `release/v{VERSION}`
- body: the `RELEASE_NOTES` captured in Step 6, prefixed with:

```markdown
## Release v{VERSION}

This PR bumps the version and updates the changelog for release v{VERSION}.
Merge this PR, then run `/complete-a-release {VERSION}` to tag and publish the release.

---

{RELEASE_NOTES}
```

**If only `gh` CLI is available**:

```bash
gh pr create \
  --title "chore: release {VERSION}" \
  --base {DEFAULT_BRANCH} \
  --head release/v{VERSION} \
  --body "$(cat <<'EOF'
## Release v{VERSION}
...
EOF
)"
```

Store the returned PR URL as `PR_URL`.

---

## Step 10 — Report

```
Release v{VERSION} started
──────────────────────────────────────────────────────
Branch:   release/v{VERSION}
PR:       {PR_URL}

Next steps:
  1. Review the PR and confirm the changelog entry looks correct
  2. Merge the PR into {DEFAULT_BRANCH}
  3. Run /complete-a-release {VERSION}
```

---

## Behavioral Rules

- Never create a tag or push a tag — that is `complete-a-release`'s responsibility.
- Never touch `{DEFAULT_BRANCH}` directly — all changes go via the release branch and PR.
- If any step after branch creation fails, leave the branch and any committed changes in place;
  do not attempt to clean up. Report the failure clearly and tell the user which step failed.
- Never run `npm publish`.