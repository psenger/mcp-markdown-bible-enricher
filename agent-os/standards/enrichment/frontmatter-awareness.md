---
name: Frontmatter Awareness
description: enrichMarkdown() must strip YAML frontmatter before enrichment and reattach it unchanged
type: project
---

# Frontmatter Awareness

`enrichMarkdown()` detects and isolates YAML frontmatter before running any regex pass.
Frontmatter is the `---`-delimited block at position 0 of the document only.
It is returned unchanged. Only the body that follows is enriched.

Rules:
- Frontmatter detection uses a dedicated helper: splitFrontmatter(text) → { frontmatter, body }
- If no frontmatter is detected, frontmatter is empty string and body is the full input
- The closing delimiter may be --- or ... (both are valid YAML document end markers)
- A --- appearing anywhere other than position 0 is NOT treated as frontmatter
- All regex passes operate on body only — never on the raw combined string
