import { lookupBook } from "./books.js";
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

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

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
// Main enrichment function
// ──────────────────────────────────────────────────────────────

export function enrichMarkdown(markdown: string): string {
  let result = markdown;

  // 1. Enrich backtick-wrapped Bible references first (e.g. `1 Samuel 16:1, 16:4-13:`)
  result = result.replace(BACKTICK_BIBLE_RE, (_match, book: string, cv: string) => {
    return enrichBibleRef(book, cv.trim());
  });

  // 2. Enrich plain-text Bible references (not already inside links)
  result = result.replace(BIBLE_REF_RE, (_match, book: string, cv: string) => {
    return enrichBibleRef(book, cv.trim());
  });

  // 3. Enrich CCC references
  result = result.replace(CCC_RE, (_match, numbers: string) => {
    return enrichCccRef(numbers.trim());
  });

  return result;
}
