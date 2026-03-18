# Relevant Standards

## enrichment/three-pass-ordering

The strict ordering of passes in `enrichMarkdown()` must not change. The frontmatter split
must occur **before** pass 1 (backtick refs) — not between passes. All passes must operate
on the body-only string.

## enrichment/double-link-prevention

The regex lookbehind/lookahead guards that prevent double-enrichment of already-linked text
remain unchanged and apply to the body only. Frontmatter protection is implemented via
structural split, not regex guards.

## global/tdd-workflow

RED first: write all 18 tests and confirm they fail before writing any implementation code.
GREEN: implement the minimum required to pass all 18 tests.
REFACTOR: clean up without breaking tests.
Each phase gets its own commit.

## enrichment/frontmatter-awareness (new — created in Task 2)

`enrichMarkdown()` detects and isolates YAML frontmatter before running any regex pass.
Frontmatter is the `---`-delimited block at position 0 of the document only.
It is returned unchanged. Only the body that follows is enriched.
