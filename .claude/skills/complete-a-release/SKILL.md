---
name: complete-a-release
description: >
  Completes a release after the release PR has been merged. Verifies the default
  branch contains the correct version bump, creates and pushes a git tag, then
  creates a GitHub release using the changelog entry as release notes.
  Invoked explicitly as /complete-a-release <version> (e.g. /complete-a-release 0.3.0).
  Must be run after /start-a-release <version> and after the release PR is merged.
  Do not trigger on general conversation — only activate on an explicit invocation
  with a version argument.
---

# Complete a Release

## Usage

```
/complete-a-release <version>
```

Examples:
```
/complete-a-release 0.3.0
/complete-a-release 1.0.0
```

Arguments:
- `VERSION` — required. The version being released. Must match what was used in
  `/start-a-release <version>`.

---

## Step 1 — Parse the Version Argument

Extract `VERSION` from the argument. If missing or not a valid semver string, stop:

> "Usage: /complete-a-release <version>
> Example: /complete-a-release 0.3.0
> This must match the version passed to /start-a-release."

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

# A4: fetch and check commits behind
git fetch origin --quiet
git rev-list HEAD..origin/{DEFAULT_BRANCH} --count 2>/dev/null || echo "0"
```

Present a pre-flight checklist:

```
Pre-flight for completing release {VERSION}
────────────────────────────────────────────
[✓ or ✗] On default branch    current: {CURRENT_BRANCH}  required: {DEFAULT_BRANCH}
[✓ or ✗] Working tree clean   {N modified/staged files, or "clean"}
[✓ or ✗] Up to date           {N commits behind origin/{DEFAULT_BRANCH}, or "up to date"}
```

**If `CURRENT_BRANCH` != `DEFAULT_BRANCH`**, stop:

> "You must be on `{DEFAULT_BRANCH}` to complete a release. The release PR must be merged
> before running this command."

**If working tree has modified or staged files**, stop:

> "Your working tree has modified or staged files. This command should only be run on a
> clean checkout of `{DEFAULT_BRANCH}` after merging the release PR."

**If `COMMITS_BEHIND` > 0**, stop:

> "{COMMITS_BEHIND} commit(s) behind origin/{DEFAULT_BRANCH}. Run `git pull` first — you
> need the merged release PR commit locally before tagging."

---

## Step 3 — Verify the Release PR Was Merged

Read the version from `package.json`:

```bash
node -e "const p = JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log(p.version)"
```

Store as `PACKAGE_VERSION`. If `PACKAGE_VERSION` != `VERSION`, stop:

> "package.json version is {PACKAGE_VERSION}, not {VERSION}.
> Has the release PR for {VERSION} been merged? Check that the correct PR was merged
> into {DEFAULT_BRANCH} before running this command."

Verify `CHANGELOG.md` contains a `## [{VERSION}]` entry:

```bash
grep -c "## \[{VERSION}\]" CHANGELOG.md
```

If the entry is missing, stop:

> "CHANGELOG.md does not have an entry for [{VERSION}].
> The release PR may not have been merged, or the changelog was not updated correctly."

---

## Step 4 — Check the Tag Does Not Already Exist

```bash
git tag --list v{VERSION}
```

If the tag already exists locally, stop:

> "Tag `v{VERSION}` already exists locally. Has this release already been completed?"

```bash
git ls-remote --tags origin v{VERSION}
```

If the tag already exists on the remote, stop:

> "Tag `v{VERSION}` already exists on origin. This release may have already been published."

---

## Step 5 — Extract Release Notes from CHANGELOG.md

Read `CHANGELOG.md` and extract the body of the `## [{VERSION}]` entry — everything between
the `## [{VERSION}]` heading and the next `## [` heading (or the comparison links section).

Store as `RELEASE_NOTES`. This will be used as the GitHub release body.

If extraction fails or the entry body is empty, use a fallback:

```
See CHANGELOG.md for details.
```

---

## Step 6 — Confirm Before Tagging

Show the user exactly what will happen:

```
Ready to complete release v{VERSION}
──────────────────────────────────────────────────────────
Tag:       v{VERSION}  →  {SHORT_SHA} ("{latest commit subject}")
Push:      git push origin v{VERSION}
Release:   GitHub release "v{VERSION}" created from tag

Release notes preview:
{first 10 lines of RELEASE_NOTES}
...
```

Ask:

> "Shall I proceed? This will create and push the tag and open a GitHub release. (yes / cancel)"

Wait for explicit confirmation. This is the last gate before irreversible actions.

---

## Step 7 — Create the Git Tag

```bash
git tag -a v{VERSION} -m "Release v{VERSION}"
```

If this fails, stop and report the error. Do not attempt to push.

---

## Step 8 — Push the Tag

```bash
git push origin v{VERSION}
```

If the push fails, stop:

> "Tag was created locally but push failed.
> Error: {error message}
> You can retry with: git push origin v{VERSION}"

Do not attempt to create the GitHub release if the push failed — the tag must be on the
remote before the release is created against it.

---

## Step 9 — Create the GitHub Release

Use the `gh` CLI:

```bash
gh release create v{VERSION} \
  --title "v{VERSION}" \
  --notes "{RELEASE_NOTES}"
```

Add `--prerelease` if `VERSION` contains a pre-release identifier (e.g. `-beta`, `-rc`, `-alpha`).

Store the returned release URL as `RELEASE_URL`.

---

## Step 10 — Report

```
Release v{VERSION} complete
──────────────────────────────────────────────────────────
Tag:      v{VERSION}  (pushed to origin)
Release:  {RELEASE_URL}

The release branch release/v{VERSION} can now be deleted:
  git branch -d release/v{VERSION}
  git push origin --delete release/v{VERSION}
```

Do not delete the release branch automatically — leave that to the user.

---

## Behavioral Rules

- Never run unless on the default branch with a clean, up-to-date working tree.
- Never create the tag before verifying `package.json` and `CHANGELOG.md` both reflect `VERSION`.
- Never push the tag unless `git tag` succeeded cleanly.
- Never create the GitHub release unless the tag push succeeded.
- Never run `npm publish`.
- If the GitHub release creation fails after the tag is pushed, report clearly:
  > "Tag v{VERSION} was pushed successfully. GitHub release creation failed: {error}.
  > You can create the release manually at: {REPO_URL}/releases/new?tag=v{VERSION}"
- Mark the release as prerelease automatically when VERSION contains `-beta`, `-rc`, `-alpha`,
  or any other pre-release identifier per semver spec.