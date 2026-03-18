---
name: Obsidian Links Opt-Out
description: INCLUDE_OBSIDIAN_LINKS is enabled by default; only the string 'false' disables it
type: project
---

# Obsidian Links Opt-Out

Obsidian wiki-links are **enabled by default**. The primary use case is Obsidian vaults;
you must explicitly disable them.

```typescript
// src/config.ts
includeObsidianLinks: process.env.INCLUDE_OBSIDIAN_LINKS !== "false"
```

- Only the string `"false"` disables Obsidian links
- Missing env var, `"true"`, `"1"`, `"yes"` — all produce `true`
- Do not change this to opt-in (`=== "true"`) without updating docs and tests

To disable: set `INCLUDE_OBSIDIAN_LINKS=false` in the server's environment.
