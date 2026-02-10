// Complete mapping of Bible book names to Obsidian wiki-link abbreviations
// Based on the user's Obsidian vault naming convention

export interface BookInfo {
  abbrev: string;       // e.g. "Gen", "1 Sam"
  singleChapter: boolean; // books with only 1 chapter (Obadiah, Philemon, 2 John, 3 John, Jude)
}

export const BOOK_MAP: Record<string, BookInfo> = {
  // --- Old Testament ---
  "genesis":          { abbrev: "Gen",       singleChapter: false },
  "exodus":           { abbrev: "Exod",      singleChapter: false },
  "leviticus":        { abbrev: "Lev",       singleChapter: false },
  "numbers":          { abbrev: "Num",       singleChapter: false },
  "deuteronomy":      { abbrev: "Deut",      singleChapter: false },
  "joshua":           { abbrev: "Josh",      singleChapter: false },
  "judges":           { abbrev: "Judg",      singleChapter: false },
  "ruth":             { abbrev: "Ruth",      singleChapter: false },
  "1 samuel":         { abbrev: "1 Sam",     singleChapter: false },
  "2 samuel":         { abbrev: "2 Sam",     singleChapter: false },
  "1 kings":          { abbrev: "1 Kings",   singleChapter: false },
  "2 kings":          { abbrev: "2 Kings",   singleChapter: false },
  "1 chronicles":     { abbrev: "1 Chron",   singleChapter: false },
  "2 chronicles":     { abbrev: "2 Chron",   singleChapter: false },
  "ezra":             { abbrev: "Ezr",       singleChapter: false },
  "nehemiah":         { abbrev: "Neh",       singleChapter: false },
  "tobit":            { abbrev: "Tob",       singleChapter: false },
  "judith":           { abbrev: "Jdt",       singleChapter: false },
  "esther":           { abbrev: "Esth",      singleChapter: false },
  "1 maccabees":      { abbrev: "1 Macc",    singleChapter: false },
  "2 maccabees":      { abbrev: "2 Macc",    singleChapter: false },
  "job":              { abbrev: "Job",        singleChapter: false },
  "psalm":            { abbrev: "Ps",         singleChapter: false },
  "psalms":           { abbrev: "Ps",         singleChapter: false },
  "proverbs":         { abbrev: "Prov",      singleChapter: false },
  "ecclesiastes":     { abbrev: "Eccles",    singleChapter: false },
  "song of solomon":  { abbrev: "Song",      singleChapter: false },
  "song of songs":    { abbrev: "Song",      singleChapter: false },
  "wisdom":           { abbrev: "Wis",       singleChapter: false },
  "sirach":           { abbrev: "Sir",       singleChapter: false },
  "wisdom of ben sira": { abbrev: "Sir",     singleChapter: false },
  "ecclesiasticus":   { abbrev: "Sir",       singleChapter: false },
  "isaiah":           { abbrev: "Isa",       singleChapter: false },
  "jeremiah":         { abbrev: "Jer",       singleChapter: false },
  "lamentations":     { abbrev: "Lam",       singleChapter: false },
  "baruch":           { abbrev: "Bar",       singleChapter: false },
  "ezekiel":          { abbrev: "Ezek",      singleChapter: false },
  "daniel":           { abbrev: "Dan",       singleChapter: false },
  "hosea":            { abbrev: "Hos",       singleChapter: false },
  "joel":             { abbrev: "Joel",      singleChapter: false },
  "amos":             { abbrev: "Am",        singleChapter: false },
  "obadiah":          { abbrev: "Obad",      singleChapter: true  },
  "jonah":            { abbrev: "Jonah",     singleChapter: false },
  "micah":            { abbrev: "Micah",     singleChapter: false },
  "nahum":            { abbrev: "Nah",       singleChapter: false },
  "habakkuk":         { abbrev: "Hab",       singleChapter: false },
  "zephaniah":        { abbrev: "Zeph",      singleChapter: false },
  "haggai":           { abbrev: "Hag",       singleChapter: false },
  "zechariah":        { abbrev: "Zech",      singleChapter: false },
  "malachi":          { abbrev: "Mal",       singleChapter: false },

  // --- New Testament ---
  "matthew":          { abbrev: "Matt",      singleChapter: false },
  "mark":             { abbrev: "Mark",      singleChapter: false },
  "luke":             { abbrev: "Luke",      singleChapter: false },
  "john":             { abbrev: "John",      singleChapter: false },
  "acts":             { abbrev: "Acts",      singleChapter: false },
  "romans":           { abbrev: "Rom",       singleChapter: false },
  "1 corinthians":    { abbrev: "1 Cor",     singleChapter: false },
  "2 corinthians":    { abbrev: "2 Cor",     singleChapter: false },
  "galatians":        { abbrev: "Gal",       singleChapter: false },
  "ephesians":        { abbrev: "Ephes",     singleChapter: false },
  "philippians":      { abbrev: "Phil",      singleChapter: false },
  "colossians":       { abbrev: "Col",       singleChapter: false },
  "1 thessalonians":  { abbrev: "1 Thess",   singleChapter: false },
  "2 thessalonians":  { abbrev: "2 Thess",   singleChapter: false },
  "1 timothy":        { abbrev: "1 Tim",     singleChapter: false },
  "2 timothy":        { abbrev: "2 Tim",     singleChapter: false },
  "titus":            { abbrev: "Titus",     singleChapter: false },
  "philemon":         { abbrev: "Philem",    singleChapter: true  },
  "hebrews":          { abbrev: "Heb",       singleChapter: false },
  "james":            { abbrev: "James",     singleChapter: false },
  "1 peter":          { abbrev: "1 Pet",     singleChapter: false },
  "2 peter":          { abbrev: "2 Pet",     singleChapter: false },
  "1 john":           { abbrev: "1 John",    singleChapter: false },
  "2 john":           { abbrev: "2 John",    singleChapter: true  },
  "3 john":           { abbrev: "3 John",    singleChapter: true  },
  "jude":             { abbrev: "Jude",      singleChapter: true  },
  "revelation":       { abbrev: "Rev",       singleChapter: false },
};

/**
 * Look up a book by its full name (case-insensitive).
 */
export function lookupBook(name: string): BookInfo | undefined {
  return BOOK_MAP[name.trim().toLowerCase()];
}
