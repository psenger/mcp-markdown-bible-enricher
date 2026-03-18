---
name: Config Module Cache Limitation
description: Why process.env changes in Jest beforeEach don't affect enrichment config
type: project
---

# Config Module Cache Limitation

`enrichment.ts` loads config at module init (`const config = loadConfig()`).
Jest caches modules between tests, so changing `process.env` in `beforeEach`
does **not** affect the `config` object already in memory.

```typescript
// This does NOT work — config is already cached
beforeEach(() => {
  process.env.BIBLE_VERSION = 'ESV';
});
```

## Workarounds

1. **Mock `loadConfig`** using `jest.mock('../config.js')` to return a specific config
2. **Accept startup defaults** — tests that check config-driven output verify against
   whatever env was set when the test process started
3. **Integration test via env** — set env vars before running Jest (e.g. in a separate
   test script or CI job)

The two config tests in `enrichment.test.ts` (lines 169-189) use option 2 and
are effectively no-ops for config variation — they confirm the output format,
not that config switching works.
