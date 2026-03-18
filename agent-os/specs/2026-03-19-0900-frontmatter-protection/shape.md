# Shape: Frontmatter Protection

## Problem Statement

`enrichMarkdown()` has no structural awareness of YAML frontmatter. The `---`-delimited block
at the start of Markdown files is passed through all five regex passes unchanged, causing Bible
and CCC references in frontmatter YAML to be converted to Markdown link syntax — corrupting
the YAML.

## Appetite

Small fix. One helper function (~15 lines), one call site change in `enrichMarkdown()`, 18 new tests.

## Solution Shape

### New Helper: `splitFrontmatter(text)`

A pure function with no side effects. Signature:

```ts
function splitFrontmatter(text: string): { frontmatter: string; body: string }
```

Detection rules:
1. If `text` does not start with `---`, return `{ frontmatter: "", body: text }`
2. Scan for closing delimiter (`---` or `...`) on its own line after the opening `---`
3. If no valid close found, treat as no frontmatter (safety: don't silently discard content)
4. `frontmatter` includes both delimiters and the trailing newline after the closing delimiter
5. `body` is everything after

### Change to `enrichMarkdown()`

```ts
export function enrichMarkdown(markdown: string): string {
  const { frontmatter, body } = splitFrontmatter(markdown);
  let result = body;
  // ... all 5 passes on result ...
  return frontmatter + result;
}
```

## Boundaries / Non-Goals

- Fenced code blocks: out of scope
- Nested YAML or multi-document YAML: out of scope
- The `---` closer mid-document: explicitly NOT treated as frontmatter (only position 0 matters)

## Rabbit Holes to Avoid

- Do not attempt to parse or validate the YAML inside frontmatter — just preserve it verbatim
- Do not try to protect fenced code blocks in the same change
- Do not change any existing enrichment logic — the only change is the split/rejoin wrapper
