# Standards for Fix Parenthetical Bible References

## enrichment/double-link-prevention

Regex guards that prevent re-enriching already-linked text.

Current (buggy): `(?<![\[\(])` — not preceded by `[` or `(`
Fixed:           `(?<![\[])` — not preceded by `[`

The `(` guard was incorrectly preventing valid citation-form references.
Idempotency is maintained by:
- `(?<![\[])` — stops matching inside `[text](url)` because `[` precedes the text
- `(?![^\[]*\]\()` — stops matching text that is followed by `](`

## enrichment/three-pass-ordering

Pass ordering is unchanged. All three affected patterns (pass 2, 2b, 2c) receive
the same lookbehind correction. Pass ordering rationale remains load-bearing.

## global/tdd-workflow

Red-green-refactor: failing tests committed before implementation.
