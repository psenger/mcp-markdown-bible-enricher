// Configuration for Bible Enrichment MCP Server
// Can be customized via environment variables

export interface Config {
  bibleVersion: string;
  obsidianFormat: string;
  includeObsidianLinks: boolean;
}

/**
 * Load configuration from environment variables with sensible defaults
 */
export function loadConfig(): Config {
  return {
    // Bible version for Bible Gateway URLs
    // Examples: NRSVCE, NABRE, NCB, RSV, ESV, NIV, KJV
    // NRSVCE is default because it includes deuterocanonical books
    bibleVersion: process.env.BIBLE_VERSION || "NRSVCE",

    // Obsidian wiki-link format template
    // Available placeholders: {abbrev}, {chapter}, {chapter2}, {verse}
    // {chapter2} is zero-padded to 2 digits
    // Examples:
    //   "[[{abbrev}-{chapter2}#v{verse}]]"  -> [[Matt-05#v3]]
    //   "[[{abbrev} {chapter}:{verse}]]"    -> [[Matt 5:3]]
    //   "[[Bible/{abbrev}/{chapter}#v{verse}]]" -> [[Bible/Matt/5#v3]]
    obsidianFormat: process.env.OBSIDIAN_FORMAT || "[[{abbrev}-{chapter2}#v{verse}]]",

    // Whether to include Obsidian wiki-links at all
    includeObsidianLinks: process.env.INCLUDE_OBSIDIAN_LINKS !== "false",
  };
}

/**
 * Format an Obsidian link using the configured template
 */
export function formatObsidianLink(
  abbrev: string,
  chapter: number,
  verse: number,
  format: string
): string {
  const chapter2 = chapter.toString().padStart(2, "0");

  return format
    .replace(/{abbrev}/g, abbrev)
    .replace(/{chapter2}/g, chapter2)
    .replace(/{chapter}/g, chapter.toString())
    .replace(/{verse}/g, verse.toString());
}
