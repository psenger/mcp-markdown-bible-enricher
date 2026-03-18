---
name: Three-Pass Enrichment Ordering
description: The strict pass order in enrichMarkdown() and why it must not change
type: project
---

# Three-Pass Enrichment Ordering

The `enrichMarkdown()` function runs three passes in strict order:

1. **Backtick-wrapped refs** — e.g. `` `1 Samuel 16:1:` `` unwrapped and enriched
2. **Plain-text Bible refs** — matches running text not already inside `[]()`
3. **CCC refs** — matches `CCC ###` not already inside `[]`

**Never reorder the passes.**

- Backticks must go first: after pass 2 adds `[text](url)` markdown, backtick patterns could partially overlap the generated link syntax
- CCC must go last: generated Bible Gateway URLs contain digit sequences that could be matched as CCC paragraph numbers
