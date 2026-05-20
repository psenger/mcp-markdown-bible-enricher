<div align="center">

# Bible Enrichment MCP Server - NRSVCE (New Revised Standard Version Catholic Edition)

**Turns plain-text Bible references in your Markdown notes into Bible Gateway links and Obsidian wiki-links.**

[![GitHub Release](https://img.shields.io/github/v/release/psenger/mcp-markdown-bible-enricher)](https://github.com/psenger/mcp-markdown-bible-enricher/releases)
[![Catholic Bible](https://img.shields.io/badge/Catholic%20Bible-73%20books-green.svg)](https://github.com/psenger/mcp-markdown-bible-enricher#supported-books)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.12.1-purple)](https://modelcontextprotocol.io/)
[![Obsidian](https://img.shields.io/badge/Obsidian-compatible-7c3aed)](https://obsidian.md)

[Quick Start](#quick-start) • [Installation](#installation) • [Usage](#usage) • [Configuration](#configuration) • [Contributing](#contributing) • [Changelog](#changelog)

</div>

---

**Bible Enrichment MCP Server** is a [Model Context Protocol](https://modelcontextprotocol.io/) server that transforms plain-text Bible and Catechism references in your Markdown documents into linked references with [Bible Gateway](https://www.biblegateway.com/) URLs and [Obsidian](https://obsidian.md) wiki-links. It supports all **73 books of the Catholic Bible**, including the 7 deuterocanonical books absent from Protestant translations.

Transform this:

```markdown
Read CCC 528. Also see 1 Samuel 16:1, 16:4-13 and Matthew 2:6.
```

Into this:

```markdown
Read [CCC 528](https://www.catholiccrossreference.online/catechism/#!/search/528).
Also see [1 Samuel 16:1, 16:4-13](https://www.biblegateway.com/passage/?search=1%20Samuel%2016%3A1%2C%2016%3A4-13&version=NRSVCE) ( [[1 Sam-16#v1]] , [[1 Sam-16#v4]] - [[1 Sam-16#v13]] )
and [Matthew 2:6](https://www.biblegateway.com/passage/?search=Matthew%202%3A6&version=NRSVCE) ( [[Matt-02#v6]] ).
```

Enrichment is **deterministic** — regex-based parsing with no LLM guessing involved in the transformation itself.

---

## Features

- **Bible Gateway links** — every Scripture reference becomes a clickable link (NRSVCE by default)
- **Obsidian wiki-links** — generates `[[Book-Ch#vN]]` format for vault cross-referencing
- **CCC links** — Catechism of the Catholic Church references link to Catholic Cross Reference
- **Pattern recognition** — handles complex patterns like `1 Samuel 16:1, 16:4-13` and `CCC 528-530, 610-612`
- **Idempotent** — already-linked references are skipped; safe to run the same document multiple times
- **Complete Catholic Bible** — all 73 books including Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees

---

## Quick Start

```bash
git clone https://github.com/psenger/mcp-markdown-bible-enricher.git
cd mcp-markdown-bible-enricher
npm install
npm run build
npm run inspect
```

In the MCP Inspector, call `bible_enrich_markdown` with:

```
Genesis 1:1 says "In the beginning..."
```

---

## Installation

### Prerequisites

- Node.js >= 18.0.0

### Claude Desktop

1. Locate your config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the server:

```json
{
  "mcpServers": {
    "mcp-markdown-bible-enricher": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-markdown-bible-enricher/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop.

To set a custom Bible version or Obsidian format, add `env` to the config:

```json
{
  "mcpServers": {
    "mcp-markdown-bible-enricher": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-markdown-bible-enricher/dist/index.js"],
      "env": {
        "BIBLE_VERSION": "NRSVCE",
        "OBSIDIAN_FORMAT": "[[Bible/{abbrev}/{chapter}#v{verse}]]"
      }
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add --transport stdio mcp-markdown-bible-enricher -- node /absolute/path/to/mcp-markdown-bible-enricher/dist/index.js
```

With environment variables:

```bash
claude mcp add mcp-markdown-bible-enricher \
  -e BIBLE_VERSION=NRSVCE \
  -e 'OBSIDIAN_FORMAT=[[{abbrev}-{chapter2}#v{verse}]]' \
  -- node /absolute/path/to/mcp-markdown-bible-enricher/dist/index.js
```

Use `--scope user` to install globally across all projects:

```bash
claude mcp add --transport stdio --scope user mcp-markdown-bible-enricher -- node /absolute/path/to/mcp-markdown-bible-enricher/dist/index.js
```

Verify:

```bash
claude mcp list
```

### Cursor / VS Code

Add to `.cursor/mcp.json`:

```json
{
  "mcp-markdown-bible-enricher": {
    "command": "node",
    "args": ["/absolute/path/to/mcp-markdown-bible-enricher/dist/index.js"]
  }
}
```

---

## Usage

### Process text in a conversation

```
Use the bible_enrich_markdown tool to process this text:
"According to Romans 8:28 and CCC 313, all things work together for good."
```

Result:

```markdown
According to [Romans 8:28](https://www.biblegateway.com/passage/?search=Romans%208%3A28&version=NRSVCE) ( [[Rom-08#v28]] ) and [CCC 313](https://www.catholiccrossreference.online/catechism/#!/search/313), all things work together for good.
```

### Process a file directly

```
Use bible_enrich_file with input_path: "/Users/me/Documents/bible-study.md"
```

The file is enriched in place. Supply `output_path` to write to a different location and keep the original.

### Supported reference patterns

| Pattern | Example | What it matches |
|---|---|---|
| Single verse | `John 3:16` | One verse |
| Verse range | `Matthew 5:3-12` | Consecutive verses |
| Multiple verses | `Psalm 23:1, 4, 6` | Individual verses |
| Chapter + ranges | `1 Samuel 16:1, 16:4-13` | Mixed chapter:verse patterns |
| Bare chapter | `Isaiah 53` | Entire chapter |
| Single-chapter book verse | `Jude 9` | Verse in a single-chapter book |
| Single-chapter book range | `Jude 9-14` | Verse range in single-chapter book |
| CCC single | `CCC 528` | Single paragraph |
| CCC range | `CCC 528-530` | Paragraph range |
| CCC multiple | `CCC 528-530, 610-612` | Multiple ranges |

---

## Configuration

All configuration is via environment variables, loaded once at server startup. Restart the MCP server after any change.

| Variable | Default | Description |
|---|---|---|
| `BIBLE_VERSION` | `NRSVCE` | Bible translation. NRSVCE and NABRE include deuterocanonical books; Protestant translations (ESV, NIV, KJV) do not. |
| `OBSIDIAN_FORMAT` | `[[{abbrev}-{chapter2}#v{verse}]]` | Wiki-link template. Placeholders: `{abbrev}`, `{chapter}`, `{chapter2}` (zero-padded), `{verse}` |
| `INCLUDE_OBSIDIAN_LINKS` | `true` | Set to `false` for Bible Gateway links only |

### Example configurations

Bible Gateway links only, non-default translation:

```json
"env": {
  "BIBLE_VERSION": "ESV",
  "INCLUDE_OBSIDIAN_LINKS": "false"
}
```

Custom vault folder structure:

```json
"env": {
  "OBSIDIAN_FORMAT": "[[Bible/{abbrev}/{chapter2}#v{verse}]]"
}
```

---

## API Reference

### Tools

#### `bible_enrich_markdown`

Enriches a Markdown string with Bible and CCC links.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `markdown` | string | yes | The Markdown content to enrich |

Returns the enriched Markdown string.

#### `bible_enrich_file`

Reads a Markdown file, enriches it, and writes the result.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `input_path` | string | yes | Absolute path to the input file |
| `output_path` | string | no | Absolute path for output (defaults to overwriting input) |

Returns a success message with the output path.

### Prompts

#### `bible_enrich_document`

A convenience prompt that instructs Claude to call `bible_enrich_markdown` on the supplied content.

| Parameter | Type | Required |
|---|---|---|
| `markdown` | string | yes |

#### `help`

Displays all available tools, configuration options, and usage examples. Call it with no arguments.

---

## Supported Books

All **73 books of the Catholic Bible** are supported.

**Translation note for deuterocanonical books** (Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees): these books are only available on Bible Gateway through Catholic translations. NRSVCE (default) and NABRE both include them. NCB and all Protestant translations do not.

<details>
<summary><b>Old Testament (46 books)</b></summary>

**Protestant Canon (39 books):**
- Pentateuch: Genesis, Exodus, Leviticus, Numbers, Deuteronomy
- Historical: Joshua, Judges, Ruth, 1-2 Samuel, 1-2 Kings, 1-2 Chronicles, Ezra, Nehemiah, Esther
- Wisdom: Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon
- Prophets: Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi

**Deuterocanonical (7 books — Catholic only):**
- Historical: Tobit, Judith, 1-2 Maccabees
- Wisdom: Wisdom, Sirach (Ecclesiasticus)
- Prophetic: Baruch

</details>

<details>
<summary><b>New Testament (27 books)</b></summary>

- Gospels: Matthew, Mark, Luke, John
- History: Acts
- Pauline Epistles: Romans, 1-2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1-2 Thessalonians, 1-2 Timothy, Titus, Philemon
- General Epistles: Hebrews, James, 1-2 Peter, 1-2-3 John, Jude
- Apocalypse: Revelation

</details>

<details>
<summary><b>Complete abbreviation list (all 73 books)</b></summary>

**Old Testament (46 books):**

Pentateuch: Genesis → `Gen`, Exodus → `Exod`, Leviticus → `Lev`, Numbers → `Num`, Deuteronomy → `Deut`

Historical: Joshua → `Josh`, Judges → `Judg`, Ruth → `Ruth`, 1 Samuel → `1 Sam`, 2 Samuel → `2 Sam`, 1 Kings → `1 Kings`, 2 Kings → `2 Kings`, 1 Chronicles → `1 Chron`, 2 Chronicles → `2 Chron`, Ezra → `Ezr`, Nehemiah → `Neh`, Tobit → `Tob`*, Judith → `Jdt`*, Esther → `Esth`, 1 Maccabees → `1 Macc`*, 2 Maccabees → `2 Macc`*

Wisdom: Job → `Job`, Psalms → `Ps`, Proverbs → `Prov`, Ecclesiastes → `Eccles`, Song of Solomon → `Song`, Wisdom → `Wis`*, Sirach → `Sir`*

Prophetic: Isaiah → `Isa`, Jeremiah → `Jer`, Lamentations → `Lam`, Baruch → `Bar`*, Ezekiel → `Ezek`, Daniel → `Dan`, Hosea → `Hos`, Joel → `Joel`, Amos → `Am`, Obadiah → `Obad`†, Jonah → `Jonah`, Micah → `Micah`, Nahum → `Nah`, Habakkuk → `Hab`, Zephaniah → `Zeph`, Haggai → `Hag`, Zechariah → `Zech`, Malachi → `Mal`

**New Testament (27 books):**

Gospels: Matthew → `Matt`, Mark → `Mark`, Luke → `Luke`, John → `John`

History: Acts → `Acts`

Pauline Epistles: Romans → `Rom`, 1 Corinthians → `1 Cor`, 2 Corinthians → `2 Cor`, Galatians → `Gal`, Ephesians → `Ephes`, Philippians → `Phil`, Colossians → `Col`, 1 Thessalonians → `1 Thess`, 2 Thessalonians → `2 Thess`, 1 Timothy → `1 Tim`, 2 Timothy → `2 Tim`, Titus → `Titus`, Philemon → `Philem`†

General Epistles: Hebrews → `Heb`, James → `James`, 1 Peter → `1 Pet`, 2 Peter → `2 Pet`, 1 John → `1 John`, 2 John → `2 John`†, 3 John → `3 John`†, Jude → `Jude`†

Apocalypse: Revelation → `Rev`

`*` deuterocanonical — requires NRSVCE or NABRE translation  
`†` single-chapter book — supports both `Jude 1:9` and `Jude 9` forms

Alternative names: Song of Solomon = Song of Songs; Sirach = Ecclesiasticus = Wisdom of Ben Sira

</details>

---

## How It Works

The enrichment function processes Markdown in five sequential regex passes:

1. **Backtick unwrapping** — removes backticks around references like `` `1 Samuel 16:1:` `` before processing
2. **Bible references** — matches `chapter:verse` patterns not already inside Markdown links
3. **Single-chapter bare verse** — matches bare verse citations in single-chapter books (e.g., `Jude 9`)
4. **Bare chapter** — matches chapter-only citations (e.g., `Isaiah 53`)
5. **CCC references** — matches Catechism paragraph numbers

**Key implementation details:**
- Negative lookbehind/lookahead prevents double-enriching already-linked text
- Implicit chapter inheritance: `16:1, 4-13` uses chapter 16 for both groups
- Single-chapter books use a different Obsidian link format (`[[Jude#v9]]` rather than `[[Jude-01#v9]]`)
- YAML front matter is stripped before enrichment and reattached unchanged

### Output format

| Reference | Bible Gateway link | Obsidian wiki-link |
|---|---|---|
| `John 3:16` | `[John 3:16](https://www.biblegateway.com/...)` | `[[John-03#v16]]` |
| `Matthew 5:3-12` | `[Matthew 5:3-12](https://www.biblegateway.com/...)` | `[[Matt-05#v3]] - [[Matt-05#v12]]` |
| `Jude 9` | `[Jude 9](https://www.biblegateway.com/...)` | `[[Jude#v9]]` |
| `Isaiah 53` | `[Isaiah 53](https://www.biblegateway.com/...)` | `[[Isa-53]]` |
| `CCC 528` | `[CCC 528](https://www.catholiccrossreference.online/...)` | *(none)* |

---

## Obsidian Integration

Bible references are enriched with wiki-links matching Obsidian's `[[Note#heading]]` convention. If your vault uses a different file-naming structure, set `OBSIDIAN_FORMAT` to match:

```bash
# Flat structure: "Gen 1:1" → [[Gen 1#v1]]
OBSIDIAN_FORMAT="[[{abbrev} {chapter}#v{verse}]]"

# Nested folders: "Gen 1:1" → [[Bible/Gen/01#v1]]
OBSIDIAN_FORMAT="[[Bible/{abbrev}/{chapter2}#v{verse}]]"

# Chapter-only files: "Gen 1:1" → [[Gen-01#verse-1]]
OBSIDIAN_FORMAT="[[{abbrev}-{chapter2}#verse-{verse}]]"
```

Available placeholders: `{abbrev}`, `{chapter}`, `{chapter2}` (zero-padded), `{verse}`.

---

## Agentic Usage

This server is built to work with agentic workflows. Claude Code, Claude Desktop, and other MCP clients can call the tools directly from within a conversation.

### Calling tools from Claude Code

Once the server is registered, Claude Code picks up the tools automatically. You can instruct it directly:

```
Use bible_enrich_file with input_path: "/Users/me/vault/notes/week-1.md"
```

Or use the built-in `bible_enrich_document` prompt for interactive enrichment of text you paste in.

### agent-os/ directory

The `agent-os/` directory contains machine-readable specs and standards that help AI agents work with this codebase consistently across sessions.

```
agent-os/
├── specs/           # Change-specific specs (one per feature/fix)
│   ├── 2026-03-18-1600-single-chapter-bare-verse-refs
│   ├── 2026-03-18-1700-bare-chapter-refs
│   └── 2026-03-19-0900-frontmatter-protection
└── standards/       # Durable conventions for the codebase
    ├── index.yml    # Index of all standards with descriptions
    ├── books/       # BOOK_MAP key casing, abbreviation sources, alternative names
    ├── config/      # Config loading lifecycle, opt-out patterns
    ├── enrichment/  # Regex pass ordering, lookbehind guards, chapter inheritance
    ├── global/      # Cross-cutting principles (DRY, SOLID, TDD, etc.)
    └── testing/     # Jest config module cache limitations
```

When proposing changes to the codebase, consult the relevant standard in `agent-os/standards/` before writing code. The `enrichment/three-pass-ordering` standard, for example, explains why the regex pass order is fixed and must not change.

### CLAUDE.md

`CLAUDE.md` at the project root provides Claude Code with project-specific guidance: TypeScript conventions, regex testing requirements, import extension rules, and the book-mapping schema. It is loaded automatically by Claude Code at the start of each session.

---

## Error handling

| Scenario | Behaviour |
|---|---|
| Unrecognised book name | Reference is left unchanged |
| Invalid chapter/verse numbers | Enriched, but the resulting Bible Gateway link may 404 |
| File not found | Returns `Error: ENOENT: no such file or directory` |
| Permission denied | Returns `Error: EACCES: permission denied` |

All tool errors are returned with `isError: true` and a user-readable message.

---

## Limitations

- **File size** — files are loaded entirely into memory; keep inputs under 10 MB
- **Encoding** — UTF-8 only; non-UTF-8 input produces incorrect output
- **Code blocks** — triple-backtick blocks are still enriched; only inline single-backtick references are unwrapped then enriched
- **CCC format** — requires a space: `CCC 528`, not `CCC528`
- **Configuration** — loaded once at startup; restart the server after changing env vars
- **Deuterocanonical on Bible Gateway** — NRSVCE and NABRE only; NCB and Protestant translations lack these books

---

## Development

### Project structure

```
mcp-markdown-bible-enricher/
├── src/
│   ├── __tests__/    # unit tests
│   ├── config.ts     # env var loading
│   ├── index.ts      # MCP server entry point
│   ├── enrichment.ts # core regex logic
│   └── books.ts      # Bible book → abbreviation map
├── agent-os/         # agentic specs and standards
├── dist/             # compiled output (generated)
├── CLAUDE.md         # Claude Code project guidance
├── CONTRIBUTING.md   # contributor guide
├── CHANGELOG.md      # release history
└── package.json
```

### Scripts

```bash
npm run build           # compile TypeScript
npm run start           # run the compiled server
npm run dev             # watch mode (tsx)
npm run inspect         # MCP Inspector browser GUI
npm test                # run tests
npm run test:watch      # watch mode
npm run test:coverage   # coverage report
npm run lint            # ESLint
npm run format          # Prettier
npm run format:check    # check formatting without writing
npm run clean           # remove dist/
```

### TypeScript notes

- Module system: ES Modules (`"type": "module"`)
- Import extensions: always use `.js` in imports even though source files are `.ts` — required for Node16 module resolution
- Target: ES2022, strict mode enabled

### Adding a new Bible book or alias

See `agent-os/standards/books/` for the book-map conventions and `src/books.ts` for the implementation. The key rules are in `BOOK_MAP` key casing and the `singleChapter` flag.

---

## Troubleshooting

<details>
<summary><b>Server not appearing in Claude Desktop</b></summary>

1. Verify the path in `claude_desktop_config.json` is an absolute path
2. Confirm the build succeeded: `npm run build`
3. Check MCP logs via Help → Developer Tools in Claude Desktop
4. Fully quit and restart Claude Desktop

</details>

<details>
<summary><b>References not being detected</b></summary>

- Book names are case-insensitive but must be spelled correctly
- Format must be `Book chapter:verse` — confirm there is no extra punctuation
- References already inside Markdown links `[text](url)` are skipped intentionally
- For deuterocanonical books, confirm you are using NRSVCE or NABRE

</details>

<details>
<summary><b>Deuterocanonical books not working</b></summary>

Set `BIBLE_VERSION` to `NRSVCE` (default) or `NABRE`. NCB does not include these books on Bible Gateway despite being a Catholic translation. Protestant translations (ESV, NIV, KJV) also lack them.

</details>

<details>
<summary><b>Configuration changes not taking effect</b></summary>

Configuration is loaded once at startup. After editing env vars: save the config file, **fully quit** Claude Desktop, then restart it.

</details>

<details>
<summary><b>File permission or encoding errors</b></summary>

```bash
# Check encoding
file -I /path/to/file.md

# Convert to UTF-8 if needed
iconv -f ISO-8859-1 -t UTF-8 input.md > output.md
```

</details>

<details>
<summary><b>Build errors</b></summary>

```bash
rm -rf node_modules package-lock.json
npm install
npm run clean
npm run build
```

</details>

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup and local testing
- Regex pattern conventions and testing requirements
- How to add new Bible books or aliases
- Commit message and PR conventions (Conventional Commits)
- How to use `agent-os/` specs when proposing changes

To report a bug or request a feature, [open an issue](https://github.com/psenger/mcp-markdown-bible-enricher/issues).

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full release history. This project follows [Keep a Changelog v1.1.0](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## License

Licensed under the **GNU General Public License v3.0**. See [LICENSE](./LICENSE) for full details.

---

## Acknowledgments

- [Anthropic MCP SDK](https://github.com/anthropics/modelcontextprotocol) — Model Context Protocol implementation
- [Bible Gateway](https://www.biblegateway.com/) — Scripture text and passage linking
- [Catholic Cross Reference](https://www.catholiccrossreference.online/) — Catechism paragraph linking
- [Obsidian](https://obsidian.md) — wiki-link format inspiration

---

<div align="center">

**Built for Catholic Bible study and agentic Markdown workflows**

[Report Bug](https://github.com/psenger/mcp-markdown-bible-enricher/issues) • [Request Feature](https://github.com/psenger/mcp-markdown-bible-enricher/issues) • [Security](./SECURITY.md)

</div>
