import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { enrichMarkdown } from "./enrichment.js";

// ──────────────────────────────────────────────────────────────
// Server
// ──────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "mcp-markdown-bible-enricher",
  version: "0.0.1",
});

// ──────────────────────────────────────────────────────────────
// Tool: bible_enrich_markdown
// ──────────────────────────────────────────────────────────────

server.tool(
  "bible_enrich_markdown",
  `Enrich Markdown with Bible Gateway links and CCC Catechism references.

For every Bible reference found (e.g. "Genesis 1:1", "1 Samuel 16:1, 16:4-13"):
  - Wraps it in a Bible Gateway link (NRSVCE by default, configurable)
  - Appends an Obsidian wiki-link for vault cross-referencing

For every CCC reference found (e.g. "CCC 528", "CCC 528-530, 610-612"):
  - Wraps it in a Catholic Cross Reference link

Supports all 73 books of the Catholic Bible (including deuterocanonical books).
The tool operates deterministically via regex — no LLM guessing.
Pass the entire markdown document as input and receive the enriched version.`,
  {
    markdown: z
      .string()
      .describe("The full Markdown document to enrich with Bible and CCC links"),
  },
  async ({ markdown }) => {
    try {
      const enriched = enrichMarkdown(markdown);
      return {
        content: [{ type: "text", text: enriched }],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error enriching markdown: ${message}` }],
        isError: true,
      };
    }
  }
);

// ──────────────────────────────────────────────────────────────
// Tool: bible_enrich_file
// ──────────────────────────────────────────────────────────────

server.tool(
  "bible_enrich_file",
  `Read a Markdown file, enrich it with Bible Gateway and CCC links, and write the result.

Same enrichment as enrich_markdown, but operates on file paths.
If no output_path is provided, the input file is overwritten in place.

Note: File must be UTF-8 encoded. Large files (>10MB) may cause performance issues.`,
  {
    input_path: z
      .string()
      .describe("Absolute path to the Markdown file to enrich"),
    output_path: z
      .string()
      .optional()
      .describe("Absolute path to write the enriched file (defaults to overwriting input_path)"),
  },
  async ({ input_path, output_path }) => {
    try {
      const fs = await import("node:fs/promises");
      const raw = await fs.readFile(input_path, "utf-8");
      const enriched = enrichMarkdown(raw);
      const dest = output_path ?? input_path;
      await fs.writeFile(dest, enriched, "utf-8");
      return {
        content: [
          { type: "text", text: `Enriched and saved to: ${dest}` },
        ],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// ──────────────────────────────────────────────────────────────
// Prompt: bible_enrich_document
// ──────────────────────────────────────────────────────────────

server.prompt(
  "bible_enrich_document",
  "Enrich markdown with Bible Gateway links, Obsidian wiki-links, and CCC Catechism references",
  {
    markdown: z.string().describe("The markdown to enrich"),
  },
  ({ markdown }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please use the bible_enrich_markdown tool to add Bible Gateway links, Obsidian wiki-links, and CCC Catechism links to the following document:\n\n${markdown}`,
        },
      },
    ],
  })
);

// ──────────────────────────────────────────────────────────────
// Prompt: help
// ──────────────────────────────────────────────────────────────

server.prompt(
  "help",
  "Show available Bible enrichment tools and how to use them",
  {},
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Bible Enrichment MCP Server v0.0.1

Available Bible Enrichment Tools:

**bible_enrich_markdown**
- Purpose: Enrich markdown text with Bible Gateway links, Obsidian wiki-links, and CCC Catechism references
- Input: markdown (string)
- Usage: "Use bible_enrich_markdown to process: [your text]"
- Returns: Enriched markdown in the conversation (copy and paste it)

**bible_enrich_file**
- Purpose: Read a .md file, enrich it, and save the result
- Input: input_path (required), output_path (optional)
- Usage: "Use bible_enrich_file with input_path: /path/to/file.md"
- Returns: Saves enriched file directly (overwrites input if no output path specified)

**Configuration** (set in Claude Desktop config):
- BIBLE_VERSION: Bible translation (default: NRSVCE)
  NRSVCE includes deuterocanonical books (Tobit, Judith, Wisdom, Sirach, Baruch, Maccabees)
  Options: NRSVCE, NABRE, NCB, ESV, NIV, KJV, etc.
- OBSIDIAN_FORMAT: Wiki-link template (default: [[{abbrev}-{chapter2}#v{verse}]])
- INCLUDE_OBSIDIAN_LINKS: true/false (default: true)

**Example:**
"Use bible_enrich_markdown to process: John 3:16 and CCC 313"

**Tip:** For less verbose output, ask "return ONLY the enriched text" when using the tool.`,
        },
      },
    ],
  })
);

// ──────────────────────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bible Enrichment MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
