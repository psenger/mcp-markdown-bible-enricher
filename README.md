<div align="center">

# Bible Enrichment MCP Server - NRSVCE (New Revised Standard Version Catholic Edition)

**Intelligent Markdown enrichment for Scripture and Catechism references**

[![Catholic Bible](https://img.shields.io/badge/Catholic%20Bible-73%20books-green.svg)](https://github.com/psenger/mcp-markdown-bible-enricher#supported-books)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.12.1-purple)](https://modelcontextprotocol.io/)

[Features](#features) • [Quick Start](#quick-start) • [Installation](#installation) • [Usage](#usage) • [Configuration](#configuration) • [API Reference](#api-reference)

</div>

---

## Overview

**Bible Enrichment MCP Server** is a [Model Context Protocol](https://modelcontextprotocol.io/) server that automatically transforms plain-text Bible and Catechism references in your Markdown documents into linked references with Bible Gateway URLs and Obsidian wiki-links.

**Catholic Bible Resource:** This tool is designed for the Catholic Bible canon, supporting all **73 books** including the 7 deuterocanonical books:
- **Tobit** - Righteousness and family
- **Judith** - Courage and faith
- **Wisdom** - Divine wisdom
- **Sirach** (Ecclesiasticus) - Practical wisdom
- **Baruch** - Prophecy and comfort
- **1 Maccabees** - Jewish revolt history
- **2 Maccabees** - Theological history

These 7 books are included in Catholic Bibles but not in Protestant Bibles (which have 66 books). The default translation (NRSVCE) includes all deuterocanonical books.

Perfect for:
- Catholic theologians and researchers
- Catholic content creators
- Obsidian vault builders
- Catholic Bible study workflows

### What It Does

Transform this:
```markdown
Read CCC 528. Also see 1 Samuel 16:1, 16:4-13 and Matthew 2:6.
```

Into this:
```markdown
Read [CCC 528](https://www.catholiccrossreference.online/catechism/#!/search/528). Also see [1 Samuel 16:1, 16:4-13](https://www.biblegateway.com/passage/?search=1%20Samuel%2016%3A1%2C%2016%3A4-13&version=NRSVCE) ( [[1 Sam-16#v1]] , [[1 Sam-16#v4]] - [[1 Sam-16#v13]] ) and [Matthew 2:6](https://www.biblegateway.com/passage/?search=Matthew%202%3A6&version=NRSVCE) ( [[Matt-02#v6]] ).
```

---

## Features

- **Bible Gateway Links** — Every Scripture reference becomes a clickable link to Bible Gateway (NRSVCE translation by default)
- **Obsidian Wiki-Links** — Automatically generates `[[Book-Ch#vN]]` format for vault cross-referencing
- **CCC Links** — Catechism of the Catholic Church references link directly to Catholic Cross Reference
- **Deterministic Parsing** — Regex-based parsing (no LLM required)
- **Pattern Recognition** — Recognizes complex patterns like `1 Samuel 16:1, 16:4-13` and `CCC 528-530, 610-612`
- **Safe** — Won't modify existing links or break your Markdown structure
- **Complete Catholic Bible** — Supports all 73 books including 7 deuterocanonical books
- **Two Modes** — Process strings in memory or read/write files directly

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/psenger/mcp-markdown-bible-enricher.git
cd mcp-markdown-bible-enricher

# Install dependencies
npm install

# Build the project
npm run build

# Test with MCP Inspector
npm run inspect
```

In the Inspector, try calling `bible_enrich_markdown` with:
```
Genesis 1:1 says "In the beginning..."
```

---

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Local Development Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run dev
```

### Integration with AI Tools

#### Claude Desktop

1. Locate your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the server configuration:

**Basic configuration (uses defaults):**
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

**With custom Bible version and Obsidian format:**
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

3. Restart Claude Desktop

#### Claude Code CLI

```bash
claude mcp add mcp-markdown-bible-enricher -- node /absolute/path/to/mcp-markdown-bible-enricher/dist/index.js
```

Verify installation:
```bash
claude mcp list
```

#### Cursor / VS Code with MCP Extension

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

### Quick Example

**In Claude Desktop:**
```
Use the bible_enrich_markdown tool to process this text:
"According to Romans 8:28 and CCC 313, all things work together for good."
```

**Result:**
```markdown
According to [Romans 8:28](https://www.biblegateway.com/passage/?search=Romans%208%3A28&version=NRSVCE) ( [[Rom-08#v28]] ) and [CCC 313](https://www.catholiccrossreference.online/catechism/#!/search/313), all things work together for good.
```

**Example with Deuterocanonical Books:**
```
Use the bible_enrich_markdown tool to process this text:
"Read Tobit 12:8 and Wisdom 3:1-4 for guidance."
```

**Result:**
```markdown
Read [Tobit 12:8](https://www.biblegateway.com/passage/?search=Tobit%2012%3A8&version=NRSVCE) ( [[Tob-12#v8]] ) and [Wisdom 3:1-4](https://www.biblegateway.com/passage/?search=Wisdom%203%3A1-4&version=NRSVCE) ( [[Wis-03#v1]] - [[Wis-03#v4]] ) for guidance.
```

### Two Ways to Use

**Option 1: Process Text (Copy Result)**
- Paste markdown into Claude conversation
- Use `bible_enrich_markdown` tool
- Copy enriched result and paste into your notes

**Option 2: Process Files (Automatic Save)**
- Use `bible_enrich_file` with a file path
- File is enriched and saved automatically
- Optionally specify different output path to keep original

```
Use bible_enrich_file with input_path: "/Users/me/Documents/bible-study.md"
```

### Supported Reference Patterns

| Input Pattern    | Example                  | What It Recognizes         |
|------------------|--------------------------|----------------------------|
| Single verse     | `John 3:16`              | One verse                  |
| Verse range      | `Matthew 5:3-12`         | Consecutive verses         |
| Multiple verses  | `Psalm 23:1, 4, 6`       | Multiple individual verses |
| Chapter + ranges | `1 Samuel 16:1, 16:4-13` | Mixed patterns             |
| CCC single       | `CCC 528`                | Single paragraph           |
| CCC range        | `CCC 528-530`            | Paragraph range            |
| CCC multiple     | `CCC 528-530, 610-612`   | Multiple ranges            |

---

## Configuration

Customize the server via environment variables in your Claude Desktop config:

### Environment Variables

| Variable                 | Default                            | Description                                                                                          |
|--------------------------|------------------------------------|------------------------------------------------------------------------------------------------------|
| `BIBLE_VERSION`          | `NRSVCE`                           | Bible translation (NRSVCE, NABRE, NCB, ESV, NIV, KJV, etc.) - NRSVCE includes deuterocanonical books |
| `OBSIDIAN_FORMAT`        | `[[{abbrev}-{chapter2}#v{verse}]]` | Wiki-link template (placeholders: `{abbrev}`, `{chapter}`, `{chapter2}`, `{verse}`)                  |
| `INCLUDE_OBSIDIAN_LINKS` | `true`                             | Include Obsidian links (`false` for Bible Gateway only)                                              |

**Important:** Configuration changes require restarting the MCP server (fully quit and restart Claude Desktop).

### Example Configurations

**Different Bible version:**
```json
{
  "mcpServers": {
    "mcp-markdown-bible-enricher": {
      "command": "node",
      "args": ["/path/to/mcp-markdown-bible-enricher/dist/index.js"],
      "env": {
        "BIBLE_VERSION": "NRSVCE"
      }
    }
  }
}
```

**Custom Obsidian format:**
```json
"env": {
  "OBSIDIAN_FORMAT": "[[Bible/{abbrev}/{chapter}#v{verse}]]"
}
```

**Bible Gateway links only:**
```json
"env": {
  "BIBLE_VERSION": "ESV",
  "INCLUDE_OBSIDIAN_LINKS": "false"
}
```

---

## API Reference

### MCP Tools

#### `bible_enrich_markdown`

Enriches a Markdown string with Bible and CCC links.

**Parameters:**
- `markdown` (string, required) — The Markdown document to enrich

**Returns:**
- `string` — The enriched Markdown content

**Example:**
```json
{
  "markdown": "Read Isaiah 40:31 and CCC 2095 about hope."
}
```

#### `bible_enrich_file`

Reads a Markdown file, enriches it, and writes the result.

**Parameters:**
- `input_path` (string, required) — Absolute path to the input Markdown file
- `output_path` (string, optional) — Absolute path for the output file (defaults to overwriting input)

**Returns:**
- `string` — Success message with output path

**Example:**
```json
{
  "input_path": "/Users/me/notes.md",
  "output_path": "/Users/me/notes-enriched.md"
}
```

### MCP Prompts

#### `bible_enrich_document`

A convenience prompt that instructs Claude to use the `bible_enrich_markdown` tool.

**Parameters:**
- `markdown` (string, required) — The Markdown content to enrich

#### `help`

Displays documentation for all available tools, configuration options, and usage examples.

**Usage in Claude Desktop:**
```
Use the help prompt
```

Or simply:
```
help
```

This will show:
- Available tools and their parameters
- Configuration options (Bible versions, Obsidian formats)
- Usage examples
- Tips for better results

---

## Supported Books

All **73 books of the Catholic Bible** are supported:

**Important:** To use deuterocanonical books (Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees), you must use a translation that includes them on Bible Gateway:
- SUPPORTED: **NRSVCE** (New Revised Standard Version Catholic Edition) - **Default** - Includes all 73 books
- SUPPORTED: **NABRE** (New American Bible Revised Edition) - Includes all 73 books
- NOT SUPPORTED: **NCB** (New Catholic Bible) - Does NOT include deuterocanonical books on Bible Gateway
- NOT SUPPORTED: Protestant translations (ESV, NIV, KJV, etc.) - Only 66 books

<details>
<summary><b>Old Testament (46 books)</b></summary>

**Protestant Canon (39 books):**
- Pentateuch: Genesis, Exodus, Leviticus, Numbers, Deuteronomy
- Historical: Joshua, Judges, Ruth, 1-2 Samuel, 1-2 Kings, 1-2 Chronicles, Ezra, Nehemiah, Esther
- Wisdom: Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon
- Prophets: Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi

**Deuterocanonical Books (7 books - Catholic only):**
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

### Obsidian Abbreviations

<details>
<summary><b>Complete list of all 73 book abbreviations</b></summary>

**Old Testament (46 books):**

Pentateuch:
- Genesis → `Gen`
- Exodus → `Exod`
- Leviticus → `Lev`
- Numbers → `Num`
- Deuteronomy → `Deut`

Historical Books:
- Joshua → `Josh`
- Judges → `Judg`
- Ruth → `Ruth`
- 1 Samuel → `1 Sam`
- 2 Samuel → `2 Sam`
- 1 Kings → `1 Kings`
- 2 Kings → `2 Kings`
- 1 Chronicles → `1 Chron`
- 2 Chronicles → `2 Chron`
- Ezra → `Ezr`
- Nehemiah → `Neh`
- Tobit → `Tob` (deuterocanonical)
- Judith → `Jdt` (deuterocanonical)
- Esther → `Esth`
- 1 Maccabees → `1 Macc` (deuterocanonical)
- 2 Maccabees → `2 Macc` (deuterocanonical)

Wisdom Books:
- Job → `Job`
- Psalms → `Ps`
- Proverbs → `Prov`
- Ecclesiastes → `Eccles`
- Song of Solomon → `Song`
- Wisdom → `Wis` (deuterocanonical)
- Sirach → `Sir` (deuterocanonical, also called Ecclesiasticus)

Prophetic Books:
- Isaiah → `Isa`
- Jeremiah → `Jer`
- Lamentations → `Lam`
- Baruch → `Bar` (deuterocanonical)
- Ezekiel → `Ezek`
- Daniel → `Dan`
- Hosea → `Hos`
- Joel → `Joel`
- Amos → `Am`
- Obadiah → `Obad` (single chapter)
- Jonah → `Jonah`
- Micah → `Micah`
- Nahum → `Nah`
- Habakkuk → `Hab`
- Zephaniah → `Zeph`
- Haggai → `Hag`
- Zechariah → `Zech`
- Malachi → `Mal`

**New Testament (27 books):**

Gospels:
- Matthew → `Matt`
- Mark → `Mark`
- Luke → `Luke`
- John → `John`

History:
- Acts → `Acts`

Pauline Epistles:
- Romans → `Rom`
- 1 Corinthians → `1 Cor`
- 2 Corinthians → `2 Cor`
- Galatians → `Gal`
- Ephesians → `Ephes`
- Philippians → `Phil`
- Colossians → `Col`
- 1 Thessalonians → `1 Thess`
- 2 Thessalonians → `2 Thess`
- 1 Timothy → `1 Tim`
- 2 Timothy → `2 Tim`
- Titus → `Titus`
- Philemon → `Philem` (single chapter)

General Epistles:
- Hebrews → `Heb`
- James → `James`
- 1 Peter → `1 Pet`
- 2 Peter → `2 Pet`
- 1 John → `1 John`
- 2 John → `2 John` (single chapter)
- 3 John → `3 John` (single chapter)
- Jude → `Jude` (single chapter)

Apocalypse:
- Revelation → `Rev`

**Notes:**
- Single-chapter books (Obadiah, Philemon, 2 John, 3 John, Jude) still use chapter:verse format (e.g., "Jude 1:24")
- Alternative names: Song of Solomon = Song of Songs, Sirach = Ecclesiasticus = Wisdom of Ben Sira
- All deuterocanonical books marked above

</details>

---

## How It Works

### Architecture

The enrichment process uses **three sequential regex passes**:

1. **Backtick Unwrapping** — Detects references like `` `1 Samuel 16:1:` `` and removes backticks before processing
2. **Bible Reference Detection** — Matches plain-text Scripture references (skips existing Markdown links)
3. **CCC Reference Detection** — Matches Catechism paragraph numbers

### Parsing Strategy

```mermaid
graph LR
    A[Input Markdown] --> B[Unwrap Backticks]
    B --> C[Match Bible Refs]
    C --> D[Match CCC Refs]
    D --> E[Output Enriched]
```

**Key Features:**
- Negative lookbehind/lookahead prevents double-linking
- Handles implicit chapter repetition (`16:1, 4-13` → chapter 16 for both)
- Parses verse ranges (`3-12`) and comma-separated lists (`1, 4, 6`)
- Special formatting for single-chapter books

### Bible Gateway URLs

Format: `https://www.biblegateway.com/passage/?search={reference}&version=NRSVCE`
- Translation: New Revised Standard Version Catholic Edition (NRSVCE) by default
- NRSVCE includes all 73 Catholic Bible books (deuterocanonical books included)
- URL encoding handles spaces and special characters
- Configurable via `BIBLE_VERSION` environment variable

### Obsidian Wiki-Links

Format: `[[Book-Ch#vN]]`
- Example: `[[Matt-05#v3]]` for Matthew 5:3
- Special case: Single-chapter books use `[[Obad-01#v1]]` for chapter 1

### CCC Links

Format: `https://www.catholiccrossreference.online/catechism/#!/search/{numbers}`
- Supports ranges: `528-530`
- Supports lists: `528, 530, 532`

---

## Error Handling

### Invalid Book Names
References to non-existent books (e.g., "Book of Mormon 1:1") are **left unchanged**. The tool only enriches recognized Bible book names.

### Invalid Chapter/Verse References
Invalid chapter or verse numbers (e.g., "Genesis 999:999") are **processed but may produce broken Bible Gateway links**. Bible Gateway will show an error page for invalid references.

### File Errors
- **File not found**: Returns error message: `Error: ENOENT: no such file or directory`
- **Permission denied**: Returns error message: `Error: EACCES: permission denied`
- **Invalid encoding**: Non-UTF-8 files may produce garbled output or errors

### Tool Errors
All tool errors are caught and returned with `isError: true` flag. Error messages are user-friendly and indicate the problem.

---

## Limitations

### File Size
- Files are loaded entirely into memory
- **Recommended limit**: < 10MB
- Large files (>10MB) may cause performance issues or memory errors

### Character Encoding
- **Required**: UTF-8 encoding
- Non-UTF-8 files will produce incorrect output or errors
- **No automatic encoding detection**

### Pattern Recognition
- Uses regex for pattern matching
- Very complex nested structures may not be detected
- References inside code blocks (triple backticks) are still enriched
- References inside inline code (single backticks) are unwrapped and enriched
- **Chapter:verse format required**: Use "John 3:16", not "John 316"
- **Single-chapter books need colon**: Use "Jude 1:24", not "Jude 24" (applies to Obadiah, Philemon, 2 John, 3 John, Jude)
- **CCC requires space**: Use "CCC 528", not "CCC528"

### Bible Gateway Limitations
- Links depend on Bible Gateway's URL structure
- Not all Bible translations are available on Bible Gateway
- **Deuterocanonical books**: Only available in Catholic translations (NRSVCE, NABRE)
- **NCB**: Does NOT include deuterocanonical books despite being "Catholic"

### Configuration
- Configuration is loaded **once at startup**
- Changing environment variables requires **restarting the MCP server**
- No runtime configuration changes supported

---
 
## Development

### Project Structure

```
mcp-markdown-bible-enricher/
├── src/
│   ├── __tests__/       # tests
│   ├── config.ts        # Configuration for Bible Enrichment MCP Server
│   ├── index.ts         # MCP server entry point
│   ├── enrichment.ts    # Core regex logic
│   └── books.ts         # Bible book mappings
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── CLAUDE.md           # Claude Code guidance
└── README.md
```

### Available Scripts

```bash
npm run build         # Compile TypeScript
npm run start         # Run the server
npm run dev           # Watch mode (auto-rebuild)
npm run inspect       # MCP Inspector GUI
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint          # Lint with ESLint
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm run clean         # Remove dist/
```

### Testing

**Unit Tests (Jest):**
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Test coverage:** 73 Catholic Bible books, configuration, enrichment patterns, edge cases

**Interactive Testing (MCP Inspector):**
```bash
npm run inspect
```

Opens browser GUI for:
- Testing tools with custom inputs
- Inspecting server capabilities
- Real-time debugging

### TypeScript Configuration

- **Module System**: ES Modules (`"type": "module"`)
- **Import Extensions**: Use `.js` in imports even though files are `.ts`
- **Target**: ES2022
- **Strict Mode**: Enabled

---

## Troubleshooting

### Common Issues

<details>
<summary><b>Server not appearing in Claude Desktop</b></summary>

1. Verify the path in `claude_desktop_config.json` is absolute
2. Ensure the build succeeded: `npm run build`
3. Check the MCP logs (Help → Developer Tools in Claude Desktop)
4. Restart Claude Desktop

</details>

<details>
<summary><b>References not being detected</b></summary>

- Ensure book names are spelled correctly (case-insensitive)
- Check for typos in chapter:verse format (must be `chapter:verse`)
- Verify references aren't already inside Markdown links `[text](url)`
- For deuterocanonical books, ensure you're using a Catholic translation (NRSVCE or NABRE)
- Use backticks for ambiguous cases: `` `John 3:16` ``

</details>

<details>
<summary><b>Deuterocanonical books not working</b></summary>

If references to Tobit, Judith, Wisdom, Sirach, Baruch, or Maccabees aren't working:

1. **Check your Bible version**: NCB does NOT include deuterocanonical books
   ```json
   "env": {
     "BIBLE_VERSION": "NRSVCE"
   }
   ```

2. **Verify translation on Bible Gateway**: Visit Bible Gateway and manually search for "Tobit 1:1" with your chosen translation

3. **Supported translations for deuterocanonical books**:
   - SUPPORTED: NRSVCE (default)
   - SUPPORTED: NABRE
   - NOT SUPPORTED: NCB, ESV, NIV, KJV (Protestant translations)

</details>

<details>
<summary><b>File permission or encoding errors</b></summary>

```bash
# Check file permissions
ls -l /path/to/file.md

# Check file encoding
file -I /path/to/file.md

# Convert to UTF-8 if needed
iconv -f ISO-8859-1 -t UTF-8 input.md > output.md
```

</details>

<details>
<summary><b>Configuration changes not taking effect</b></summary>

Configuration is loaded **once at startup**. After changing environment variables in Claude Desktop config:

1. Save the config file
2. **Fully quit** Claude Desktop (not just close window)
3. Restart Claude Desktop
4. Test with: `Use the help prompt` to verify configuration

</details>

<details>
<summary><b>Build errors</b></summary>

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean and rebuild
npm run clean
npm run build
```

</details>

### Getting Help

- Check the [API Reference](#api-reference)
- [Open a discussion](https://github.com/psenger/mcp-markdown-bible-enricher/discussions)
- [Report a bug](https://github.com/psenger/mcp-markdown-bible-enricher/issues)

---

## License

This project is licensed under the **GNU General Public License v3.0**.

See the [LICENSE](LICENSE) file for full details, or visit [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html).

---

## Acknowledgments

- **Model Context Protocol** — [Anthropic's MCP SDK](https://github.com/anthropics/modelcontextprotocol)
- **Bible Gateway** — Scripture text and linking
- **Catholic Cross Reference** — Catechism paragraph linking
- **Obsidian Community** — Inspiration for wiki-link format

---

## Support

If this project helps your work:

- Star the repository
- Report bugs and suggest features
- Contribute code or documentation
- Share with others who might benefit

---

<div align="center">

**Built for Catholic Bible study and research**

[Report Bug](https://github.com/psenger/mcp-markdown-bible-enricher/issues) • [Request Feature](https://github.com/psenger/mcp-markdown-bible-enricher/issues) • [Documentation](https://github.com/psenger/mcp-markdown-bible-enricher#readme)

</div>
