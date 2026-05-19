## Linked issue

Closes #<!-- issue number -->

<!-- Every PR must link to an issue. PRs without a linked issue may be closed without review. -->

## What changed and why

<!-- Summarise the change. Explain the why, not just the what — the diff shows the what. -->

## Test plan

<!-- How did you verify this works? Include the input text and enriched output for any new or changed patterns. -->

**Input:**
```markdown

```

**Output:**
```markdown

```

## Checklist

- [ ] `npm test` passes with no failures
- [ ] New or changed regex patterns tested against complex multi-verse references
- [ ] If a new book or alias was added, `BOOK_MAP` key is lowercase and `lookupBook()` resolves it correctly
- [ ] If the enrichment pipeline changed, pass ordering was not altered without updating `agent-os/standards/enrichment/three-pass-ordering`
- [ ] Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

---

*PR review and merge is handled by the maintainer. Please do not merge your own PR.*