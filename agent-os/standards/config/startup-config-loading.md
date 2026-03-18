---
name: Startup Config Loading
description: Config is loaded once at module init; env var changes require a server restart
type: project
---

# Startup Config Loading

`loadConfig()` is called once at module initialization in `enrichment.ts`:

```typescript
// src/enrichment.ts
const config = loadConfig();  // runs once on import
```

- Env vars (`BIBLE_VERSION`, `OBSIDIAN_FORMAT`, `INCLUDE_OBSIDIAN_LINKS`) are read at server startup
- Changes to env vars after startup have no effect — **restart the server to reconfigure**
- This is intentional: MCP servers are long-lived processes configured at launch

**Testing implication:** Setting `process.env` in tests does not affect the cached
`config` object. Config-sensitive tests must either mock `loadConfig` or accept
the startup value.
