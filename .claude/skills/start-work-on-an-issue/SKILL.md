---
name: start-work-on-an-issue
description: >
  Sets up a local git branch to begin work on a GitHub issue: verifies the environment
  is clean, fetches issue details, assigns the issue to the current user, derives a
  typed branch name, and creates the branch. Invoked explicitly with
  `/start-work-on-an-issue <issue-number>` or
  `/start-work-on-an-issue <github-issue-url>`. Do not trigger on general conversation
  about issues — only activate on an explicit invocation with a number or URL argument.
---

# Start Work on an Issue

## Usage

```
/start-work-on-an-issue <number>
/start-work-on-an-issue <github-issue-url>
```

Examples:
```
/start-work-on-an-issue 42
/start-work-on-an-issue https://github.com/psenger/mcp-markdown-bible-enricher/issues/42
```

---

## Starting Gate

The starting gate runs in two phases: **inspect** (read-only, no confirmation needed) then **act** (explain what will change and ask the user to confirm before running anything).

---

### Phase A — Inspect

**A1 must run first** — its result (`DEFAULT_BRANCH`) is required by A4. Once A1 completes, run A2, A3, and A4 in parallel.

```bash
# A1: detect the default branch (run first)
git remote show origin | grep 'HEAD branch' | awk '{print $NF}'
```

Store as `DEFAULT_BRANCH`. If the remote is unreachable, fall back to checking for a local `main` then `master`.

Then run in parallel:

```bash
# A2: find the current branch
git branch --show-current

# A3: check for uncommitted changes, staged files, AND untracked files
git status --porcelain

# A4: check how far local is behind the remote default branch
git rev-list HEAD..origin/{DEFAULT_BRANCH} --count 2>/dev/null || echo "0"
```

From the `git status --porcelain` output, split into two buckets:
- `DIRTY_FILES` — lines where the first two characters include `M`, `A`, `D`, `R`, `C`, or `U` (modified or staged)
- `UNTRACKED_FILES` — lines starting with `??`

Store results: `DEFAULT_BRANCH`, `CURRENT_BRANCH`, `DIRTY_FILES` (list or empty), `UNTRACKED_FILES` (list or empty), `COMMITS_BEHIND` (number).

---

### Phase B — Report and Confirm

Present a pre-flight summary to the user. Use a checklist format so the state is immediately scannable:

```
Starting gate for issue #{number}
──────────────────────────────────
[✓ or ✗] On default branch    current: {CURRENT_BRANCH}  required: {DEFAULT_BRANCH}
[✓ or ✗] Working tree clean   {N modified/staged files, or "clean"}
[✓ or ✗] Untracked files      {N untracked files found, or "none"}
[✓ or ✗] Up to date           {N commits behind origin/{DEFAULT_BRANCH}, or "up to date"}
```

**If `DIRTY_FILES` is non-empty**, do not list any actions. Stop with:

> "Your working tree has modified or staged files. Stash or commit them before I can continue."
> ```
> {list each dirty file}
> ```

**If `UNTRACKED_FILES` is non-empty**, list them and ask how to proceed before continuing:

> ```
> Untracked files:
>     {list each untracked file}
>
> These files are not tracked by git. They will follow you onto the new branch
> and won't affect the checkout, but you may want to handle them first.
>
> How do you want to proceed?
>   a) Leave them — continue, I won't touch them
>   b) Nuke it    — run `nuke` in your terminal first, then come back
>   c) Abort      — I'll stop here so you can handle them yourself
> ```

Wait for the user's choice before continuing:
- **a)** proceed to the actions list below
- **b)** stop — do not continue until the user returns and confirms the tree is clean
- **c)** stop

**Note:** Claude never runs `nuke` itself. The `nuke` shell function is a user-side tool that previews all deletions and requires the user to type `"nuke"` to confirm. It resets the working tree to `origin/{DEFAULT_BRANCH}`.

**If both `DIRTY_FILES` and `UNTRACKED_FILES` are empty**, list the planned actions:

```
Actions I will take:
  1. git checkout {DEFAULT_BRANCH}
     — switches to the default branch so the new branch is cut from the right base
     (skipped if already on {DEFAULT_BRANCH})

  2. git fetch origin
     — downloads latest remote refs without changing any local files

  3. git pull origin {DEFAULT_BRANCH}
     — fast-forwards local {DEFAULT_BRANCH} to match the remote
     (skipped if already up to date)
```

Then ask:

> "Does this look right? Type **yes** to run the above, or tell me if something needs adjusting."

Wait for explicit confirmation before proceeding to Phase C.

---

### Phase C — Execute

Run only the actions that are actually needed (skip steps that are already satisfied):

```bash
# Only if CURRENT_BRANCH != DEFAULT_BRANCH
git checkout {DEFAULT_BRANCH}

# Always
git fetch origin

# Only if COMMITS_BEHIND > 0
git pull origin {DEFAULT_BRANCH}
```

After each command, check for errors. If `git pull` produces merge conflicts, stop:

> "Pull resulted in merge conflicts. Resolve them and run `git merge --continue`, then try again."

On success, confirm to the user:

> "Environment ready. On `{DEFAULT_BRANCH}`, up to date with origin."

Then proceed to Step 0.

---

## Step 0 — Detect Tooling

Check what GitHub access is available. Try in this order:

1. **GitHub MCP server** — look for `mcp__github__` tools in the current session. If present, use them for issue lookup and assignment.
2. **`gh` CLI** — run `command -v gh && gh auth status`. If authenticated, use it.
3. If neither is available, tell the user and stop.

Set `USE_MCP` or `USE_GH` accordingly.

---

## Step 1 — Parse the Issue Number

The skill is invoked explicitly. The argument is either a bare number or a GitHub issue URL.

**Bare number** — `42` or `#42`:
- Strip the leading `#` if present and use the integer directly.

**GitHub issue URL** — `https://github.com/{owner}/{repo}/issues/{number}`:
- Extract the trailing integer from the path.
- Note the `{owner}/{repo}` for use in Step 2 (overrides the value derived from `git remote`).

If the argument is missing or cannot be parsed, stop:

> "Please provide an issue number or GitHub issue URL, e.g.:
> `/start-work-on-an-issue 42`
> `/start-work-on-an-issue https://github.com/psenger/mcp-markdown-bible-enricher/issues/42`"

---

## Step 2 — Fetch Issue Details

**If USE_MCP:** call `mcp__github__issue_read` with the repo owner/name from `git remote get-url origin`.

**If USE_GH:**
```bash
gh issue view <number> --json number,title,body,labels,assignees
```

Capture: `number`, `title`, `body`, `labels` (array of label names), `assignees`.

---

## Step 3 — Assign to Self

Assign the issue to the authenticated user automatically (no confirmation needed).

**If USE_MCP:** use `mcp__github__issue_write` to add the current user as assignee.

**If USE_GH:**
```bash
gh issue edit <number> --add-assignee @me
```

If this fails, note it but continue — don't block on assignment errors.

---

## Step 4 — Derive Branch Name

### Branch type reference

| Branch type prefix | Meaning |
|---|---|
| `feat` | New feature or enhancement |
| `fix` | Bug fix |
| `docs` | Documentation-only change |
| `chore` | Dependency update or maintenance task |

### Type from labels

Map issue labels to a branch type prefix using this priority order (first match wins):

| Label (case-insensitive) | Branch type |
|---|---|
| `bug` | `fix` |
| `enhancement`, `feature` | `feat` |
| `documentation`, `docs` | `docs` |
| `dependencies`, `chore` | `chore` |
| *(no match or no labels)* | `feat` |

### Slug from title

Transform the issue title:
1. Lowercase
2. Replace any character that is not `a-z`, `0-9`, or `-` with a hyphen
3. Collapse consecutive hyphens into one
4. Strip leading and trailing hyphens
5. Truncate to 50 characters, cutting at a hyphen boundary if possible

### Final branch name

```
{type}/{number}-{slug}
```

Example: issue #29 "feat: make project agentic — add CHANGELOG..." with label `enhancement` →
`feat/29-feat-make-project-agentic-add-changelog`

---

## Step 5 — Preview and Confirm

Before touching GitHub or git, show the user exactly what will happen:

```
Ready to start work on issue #{number}
──────────────────────────────────────
Issue:   {title}
Branch:  {branch-name}  (new, from {DEFAULT_BRANCH})
Assign:  @{current-user}

Actions:
  1. Assign issue #{number} to @{current-user} on GitHub
  2. git checkout -b {branch-name}
```

Ask:

> "Shall I proceed? (yes / adjust branch name / cancel)"

- **yes** — continue
- **adjust branch name** — let the user provide a name, then re-display the summary
- **cancel** — stop, do nothing

---

## Step 6 — Create the Git Branch

Check if the branch already exists:
```bash
git branch --list {branch-name}
```

If it already exists, stop and ask:

> "Branch `{branch-name}` already exists. Check it out, or would you like to use a different name?"

Otherwise:
```bash
git checkout -b {branch-name}
```

Confirm the active branch with `git branch --show-current`. If the checkout fails for any reason, the spec files that were just written should be left in place — they are still useful and can be picked up on the next attempt.

---

## Step 7 — Report Back

Print a summary:

```
Branch:   {branch-name}
Issue:    #{number} — {title}
Assigned: yes / skipped (reason)
```

Then say: "You're on `{branch-name}`. Ready to start."

---

## Behavioral Rules

- Never touch GitHub or git before the user confirms in Step 5.
- Never invent issue content — derive the branch type and slug solely from the fetched labels and title.
- Never run `nuke` or any destructive cleanup command. If the working tree needs a hard reset, point the user to the `nuke` shell function and wait for them to return.
- If branch creation fails after assignment has already been made, leave the assignment in place — the user is still the owner of the issue.
