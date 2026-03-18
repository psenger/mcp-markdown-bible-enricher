import { lookupBook, SINGLE_CHAPTER_BOOKS } from "./books.js";
import { loadConfig, formatObsidianLink } from "./config.js";

// Load configuration once at module initialization
const config = loadConfig();

// ──────────────────────────────────────────────────────────────
// Bible Gateway URL builder
// ──────────────────────────────────────────────────────────────

const BG_PREFIX = "https://www.biblegateway.com/passage/?search=";

function bibleGatewayUrl(reference: string): string {
  return `${BG_PREFIX}${encodeURIComponent(reference)}&version=${config.bibleVersion}`;
}

// ──────────────────────────────────────────────────────────────
// Obsidian wiki-link builder
// ──────────────────────────────────────────────────────────────

/**
 * Build a single Obsidian wiki-link using the configured format
 */
function obsidianLink(abbrev: string, chapter: number, verse: number, singleChapter: boolean): string {
  // Special handling for single-chapter books
  if (singleChapter && chapter === 1) {
    // For single-chapter books at chapter 1, use the formatted template
    return formatObsidianLink(abbrev, chapter, verse, config.obsidianFormat);
  }
  if (singleChapter) {
    // For single-chapter books at other chapters, use bare name
    return `[[${abbrev}#v${verse}]]`;
  }
  return formatObsidianLink(abbrev, chapter, verse, config.obsidianFormat);
}

/**
 * Build the Obsidian portion for a parsed reference.
 * Handles single verse, verse range (v1-v3), and comma-separated verses.
 */
function obsidianSpan(
  abbrev: string,
  chapter: number,
  startVerse: number,
  endVerse: number | undefined,
  singleChapter: boolean
): string {
  const start = obsidianLink(abbrev, chapter, startVerse, singleChapter);
  if (endVerse !== undefined && endVerse !== startVerse) {
    const end = obsidianLink(abbrev, chapter, endVerse, singleChapter);
    return `${start} - ${end}`;
  }
  return start;
}

// ──────────────────────────────────────────────────────────────
// Bible Reference Regex
// ──────────────────────────────────────────────────────────────

// Matches patterns like:
//   Genesis 1:1          1 Samuel 16:1, 16:4-13
//   Isaiah 60:3-6        Matthew 2:15
//   Hosea 11:1           Numbers 24:15-19
//
// Captures:
//   1 = optional number prefix (1, 2, 3)
//   2 = book name
//   3 = the chapter:verse portion(s) — may include commas and multiple ch:v groups
//
// We intentionally keep the "tail" portion loose and post-process it.

const BOOK_NAMES = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth",
  "Samuel", "Kings", "Chronicles",
  "Ezra", "Nehemiah", "Tobit", "Judith", "Esther", "Maccabees", "Job",
  "Psalms?", "Proverbs", "Ecclesiastes", "Song of Solomon", "Song of Songs",
  "Wisdom(?:\\s+of\\s+Ben\\s+Sira)?", "Sirach", "Ecclesiasticus",
  "Isaiah", "Jeremiah", "Lamentations", "Baruch", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "Corinthians", "Galatians", "Ephesians", "Philippians",
  "Colossians", "Thessalonians", "Timothy", "Titus", "Philemon",
  "Hebrews", "James", "Peter", "Jude", "Revelation",
];

// Build a mega-regex that will match Bible references in running text.
// We look for references that are NOT already inside a markdown link []().
const bookPattern = BOOK_NAMES.join("|");

// This regex matches:  (optional 1/2/3 + space)(BookName) (chapter:verse stuff)
// The verse-tail captures everything up to the next sentence-ending punctuation
// or markdown structural character.
const BIBLE_REF_RE = new RegExp(
  "(?<![\\[\\(])" +                          // negative lookbehind: not already in a link
  "\\b" +
  `((?:[123]\\s)?(?:${bookPattern}))` +       // group 1: full book name with optional prefix
  "\\s+" +
  "([\\d]+\\s*[:\\.]\\s*[\\d]+(?:\\s*[-–]\\s*[\\d]+)?(?:\\s*,\\s*(?:[\\d]+\\s*[:\\.]\\s*)?[\\d]+(?:\\s*[-–]\\s*[\\d]+)?)*)" + // group 2: chapter:verse spec
  "(?![^\\[]*\\]\\()",                        // negative lookahead: not inside []()
  "gi"
);

// ──────────────────────────────────────────────────────────────
// Backtick-aware Bible Reference Regex
// ──────────────────────────────────────────────────────────────

// Matches Bible references inside backticks like `1 Samuel 16:1, 16:4-13:`
const BACKTICK_BIBLE_RE = new RegExp(
  "`" +
  `((?:[123]\\s)?(?:${bookPattern}))` +
  "\\s+" +
  "([\\d]+\\s*[:\\.]\\s*[\\d]+(?:\\s*[-–]\\s*[\\d]+)?(?:\\s*,\\s*(?:[\\d]+\\s*[:\\.]\\s*)?[\\d]+(?:\\s*[-–]\\s*[\\d]+)?)*)" +
  "\\s*:?\\s*" +
  "`",
  "gi"
);

// ──────────────────────────────────────────────────────────────
// Parse the chapter:verse portion
// ──────────────────────────────────────────────────────────────

interface VerseRef {
  chapter: number;
  startVerse: number;
  endVerse?: number;
}

/**
 * Parse a chapter:verse string like "16:1, 16:4-13" into VerseRef[]
 */
function parseChapterVerse(raw: string): VerseRef[] {
  const refs: VerseRef[] = [];
  // Split on commas first
  const parts = raw.split(/\s*,\s*/);
  let lastChapter = 0;

  for (const part of parts) {
    // Match "chapter:verse" or "chapter:verse-endverse" or just "verse-endverse" (inherits chapter)
    const cvMatch = part.match(/^(\d+)\s*[:.]\s*(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (cvMatch) {
      lastChapter = parseInt(cvMatch[1], 10);
      refs.push({
        chapter: lastChapter,
        startVerse: parseInt(cvMatch[2], 10),
        endVerse: cvMatch[3] ? parseInt(cvMatch[3], 10) : undefined,
      });
      continue;
    }

    // Bare verse or verse range (inherits last chapter)
    const vMatch = part.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (vMatch && lastChapter > 0) {
      refs.push({
        chapter: lastChapter,
        startVerse: parseInt(vMatch[1], 10),
        endVerse: vMatch[2] ? parseInt(vMatch[2], 10) : undefined,
      });
    }
  }

  return refs;
}

// ──────────────────────────────────────────────────────────────
// Enrich a single Bible reference match
// ──────────────────────────────────────────────────────────────

function enrichBibleRef(fullBook: string, chapterVerseRaw: string): string {
  const cleanRef = `${fullBook} ${chapterVerseRaw}`.replace(/\s+/g, " ").trim();
  const bookInfo = lookupBook(fullBook);

  if (!bookInfo) {
    // Unknown book — return as-is
    return cleanRef;
  }

  const bgUrl = bibleGatewayUrl(cleanRef);
  const bgLink = `[${cleanRef}](${bgUrl})`;

  // Only add Obsidian links if configured to do so
  if (!config.includeObsidianLinks) {
    return bgLink;
  }

  const refs = parseChapterVerse(chapterVerseRaw);
  if (refs.length === 0) {
    return bgLink;
  }

  const obsLinks = refs.map((r) =>
    obsidianSpan(bookInfo.abbrev, r.chapter, r.startVerse, r.endVerse, bookInfo.singleChapter)
  );

  return `${bgLink} ( ${obsLinks.join(" , ")} )`;
}

// ──────────────────────────────────────────────────────────────
// Single-chapter book bare-verse Regex (pass 2b)
// ──────────────────────────────────────────────────────────────

// Matches "Jude 9", "Jude 9-14", "Obadiah 21", "Philemon 25", "2 John 1", "3 John 14"
// Pass 2 (BIBLE_REF_RE) handles "Jude 1:9" form first, so no need to guard against : or . here.
// SINGLE_CHAPTER_BOOKS keys are lowercase; the regex uses gi flag for case-insensitive matching.
const singleChapterBookPattern = SINGLE_CHAPTER_BOOKS.join("|");
const SINGLE_CHAPTER_REF_RE = new RegExp(
  "(?<![\\[\\(])" +                              // negative lookbehind: not already in a link
  "\\b" +
  `(${singleChapterBookPattern})` +               // group 1: single-chapter book name
  "\\s+" +
  "(\\d+(?:\\s*[-–]\\s*\\d+)?)" +                // group 2: verse or verse range
  "(?!\\d)" +                                    // not followed by digit (\d+ is greedy; guards partial matches)
  "(?![^\\[]*\\]\\()",                            // not inside []()
  "gi"
);

/**
 * Enrich a single-chapter book bare-verse reference like "Jude 9" or "Jude 9-14".
 * Chapter is always implied as 1. Obsidian links use [[Abbrev#vN]] format (no chapter digits).
 */
function enrichSingleChapterBibleRef(bookName: string, verseRaw: string): string {
  const bookInfo = lookupBook(bookName);
  if (!bookInfo) return `${bookName} ${verseRaw}`;

  const verse = verseRaw.trim();
  const bgRef = `${bookName} 1:${verse}`;
  const bgUrl = bibleGatewayUrl(bgRef);
  const displayText = `${bookName} ${verse}`;
  const bgLink = `[${displayText}](${bgUrl})`;

  if (!config.includeObsidianLinks) {
    return bgLink;
  }

  const rangeMatch = verse.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  let obsLink: string;
  if (rangeMatch) {
    const startVerse = parseInt(rangeMatch[1], 10);
    const endVerse = parseInt(rangeMatch[2], 10);
    obsLink = `[[${bookInfo.abbrev}#v${startVerse}]] - [[${bookInfo.abbrev}#v${endVerse}]]`;
  } else {
    const verseNum = parseInt(verse, 10);
    obsLink = `[[${bookInfo.abbrev}#v${verseNum}]]`;
  }

  return `${bgLink} ( ${obsLink} )`;
}

// ──────────────────────────────────────────────────────────────
// Bare chapter reference Regex (pass 2c)
// ──────────────────────────────────────────────────────────────

// Matches "Isaiah 53", "Psalm 91", "John 3", "1 Corinthians 13"
// Pass 2 (BIBLE_REF_RE) handles "Isaiah 53:1" and "Isaiah 53.1" first, so no need to guard
// against : or . here — they are legitimate sentence terminators for bare chapter refs.
// Runs after passes 2 and 2b so already-enriched text is protected by the lookbehind.
const BARE_CHAPTER_REF_RE = new RegExp(
  "(?<![\\[\\(])" +                          // negative lookbehind: not already in a link
  "\\b" +
  `((?:[123]\\s)?(?:${bookPattern}))` +       // group 1: full book name (same pattern as BIBLE_REF_RE)
  "\\s+" +
  "(\\d+)" +                                  // group 2: bare chapter number
  "(?!\\d)" +                                // not followed by digit (\d+ is greedy; guards partial matches)
  "(?![^\\[]*\\]\\()",                        // not inside []()
  "gi"
);

/**
 * Enrich a bare chapter reference like "Psalm 91" or "Isaiah 53".
 * Obsidian link uses [[Abbrev-NN]] format (zero-padded chapter, no verse anchor).
 */
function enrichBareChapterRef(fullBook: string, chapterRaw: string): string {
  const cleanRef = `${fullBook} ${chapterRaw}`.replace(/\s+/g, " ").trim();
  const bookInfo = lookupBook(fullBook);

  if (!bookInfo) return cleanRef;

  const chapter = parseInt(chapterRaw.trim(), 10);
  const bgUrl = bibleGatewayUrl(cleanRef);
  const bgLink = `[${cleanRef}](${bgUrl})`;

  if (!config.includeObsidianLinks) {
    return bgLink;
  }

  const chapter2 = chapter.toString().padStart(2, "0");
  const obsLink = `[[${bookInfo.abbrev}-${chapter2}]]`;

  return `${bgLink} ( ${obsLink} )`;
}

// ──────────────────────────────────────────────────────────────
// CCC (Catechism) Regex & Enrichment
// ──────────────────────────────────────────────────────────────

const CCC_PREFIX = "https://www.catholiccrossreference.online/catechism/#!/search/";

// Matches "CCC 528", "CCC 528-530", "CCC 528,530", "CCC 528-530, 610-612"
const CCC_RE = /(?<!\[)\bCCC\s+([\d]+(?:\s*[-–]\s*\d+)?(?:\s*,\s*\d+(?:\s*[-–]\s*\d+)?)*)/gi;

function enrichCccRef(numbersRaw: string): string {
  const display = `CCC ${numbersRaw}`;
  // For the URL: encode spaces as %20, keep hyphens and commas
  const urlParam = numbersRaw.replace(/\s+/g, "%20");
  return `[${display}](${CCC_PREFIX}${urlParam})`;
}

// ──────────────────────────────────────────────────────────────
// Frontmatter split helper
// ──────────────────────────────────────────────────────────────

/**
 * Split a document into YAML frontmatter and body.
 * Frontmatter is the --- delimited block at the very start of the document.
 * The closing delimiter may be --- or ... (both valid YAML end markers).
 * Returns { frontmatter, body }. frontmatter includes both delimiters and trailing newline.
 * If no frontmatter is found, frontmatter is "" and body is the full input.
 */
function splitFrontmatter(text: string): { frontmatter: string; body: string } {
  if (!text.startsWith("---")) {
    return { frontmatter: "", body: text };
  }
  const rest = text.slice(3);
  const closeMatch = rest.match(/\n(---|\.\.\.)(\r?\n|$)/);
  if (!closeMatch || closeMatch.index === undefined) {
    return { frontmatter: "", body: text };
  }
  const endIndex = 3 + closeMatch.index + closeMatch[0].length;
  return {
    frontmatter: text.slice(0, endIndex),
    body: text.slice(endIndex),
  };
}

// ──────────────────────────────────────────────────────────────
// Main enrichment function
// ──────────────────────────────────────────────────────────────

export function enrichMarkdown(markdown: string): string {
  const { frontmatter, body } = splitFrontmatter(markdown);
  let result = body;

  // 1. Enrich backtick-wrapped Bible references first (e.g. `1 Samuel 16:1, 16:4-13:`)
  result = result.replace(BACKTICK_BIBLE_RE, (_match, book: string, cv: string) => {
    return enrichBibleRef(book, cv.trim());
  });

  // 2. Enrich plain-text Bible references (not already inside links)
  result = result.replace(BIBLE_REF_RE, (_match, book: string, cv: string) => {
    return enrichBibleRef(book, cv.trim());
  });

  // 2b. Enrich bare verse references for single-chapter books (e.g. "Jude 9", "Obadiah 21")
  result = result.replace(SINGLE_CHAPTER_REF_RE, (_match, book: string, verse: string) => {
    return enrichSingleChapterBibleRef(book, verse.trim());
  });

  // 2c. Enrich bare chapter references (e.g. "Psalm 91", "Isaiah 53")
  result = result.replace(BARE_CHAPTER_REF_RE, (_match, book: string, chapter: string) => {
    return enrichBareChapterRef(book, chapter.trim());
  });

  // 3. Enrich CCC references
  result = result.replace(CCC_RE, (_match, numbers: string) => {
    return enrichCccRef(numbers.trim());
  });

  return frontmatter + result;
}
