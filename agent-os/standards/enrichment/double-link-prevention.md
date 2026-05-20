---
name: Double-Link Prevention
description: Regex guards that prevent re-enriching already-linked text and ensure idempotency
type: project
---

# Double-Link Prevention

`BIBLE_REF_RE` and `CCC_RE` use negative lookbehind/lookahead to skip text
already inside a markdown link.

```
(?<![\[])       — not preceded by [
(?![^\[]*\]\()  — not followed by ](
```

**Guarantees two things:**
1. **Idempotency** — running `enrichMarkdown()` on already-enriched output produces no change
2. **Hand-authored link preservation** — existing `[text](url)` links are never re-wrapped

Note: the lookbehind guards against `[` only, not `(`. Parentheses are a valid citation
context (e.g. `(Genesis 3:5)`) and must not suppress enrichment. Idempotency after
enriching parenthetical refs is preserved by the `[` guard — the enriched form starts
with `([text](url)...` where `[` precedes the already-linked text.

When adding new regex patterns, include these same guards.
Test idempotency: `enrichMarkdown(enrichMarkdown(input)) === enrichMarkdown(input)`
