# Product Mission

## Problem

Writers composing Bible studies, homilies, and devotional notes in Markdown must manually
create Bible Gateway links and Obsidian wiki-links for every Scripture reference they type.
This is repetitive, error-prone, and slows down the writing flow.

## Target Users

Catholic writers using Obsidian — people writing theology, homilies, Bible studies, or
devotional notes who want their Scripture references automatically enriched with links.

## Solution

A deterministic, regex-based MCP server that enriches Markdown documents in place.
Key differentiators:

- **No LLM inference** — enrichment is pure regex; output is predictable and repeatable.
- **Full Catholic canon** — supports all 73 books including the 7 deuterocanonical books.
- **MCP-native** — runs as an MCP server so Claude (and other MCP clients) can call it directly.
- **Idempotent** — running enrichment twice produces the same output as running it once.