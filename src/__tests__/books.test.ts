import { describe, test, expect } from '@jest/globals';
import { lookupBook, BOOK_MAP } from '../books.js';

describe('books', () => {
  describe('lookupBook', () => {
    test('should find Old Testament books', () => {
      expect(lookupBook('Genesis')).toEqual({ abbrev: 'Gen', singleChapter: false });
      expect(lookupBook('Exodus')).toEqual({ abbrev: 'Exod', singleChapter: false });
      expect(lookupBook('Psalms')).toEqual({ abbrev: 'Ps', singleChapter: false });
    });

    test('should find New Testament books', () => {
      expect(lookupBook('Matthew')).toEqual({ abbrev: 'Matt', singleChapter: false });
      expect(lookupBook('Romans')).toEqual({ abbrev: 'Rom', singleChapter: false });
      expect(lookupBook('Revelation')).toEqual({ abbrev: 'Rev', singleChapter: false });
    });

    test('should find numbered books', () => {
      expect(lookupBook('1 Samuel')).toEqual({ abbrev: '1 Sam', singleChapter: false });
      expect(lookupBook('2 Kings')).toEqual({ abbrev: '2 Kings', singleChapter: false });
      expect(lookupBook('1 Corinthians')).toEqual({ abbrev: '1 Cor', singleChapter: false });
      expect(lookupBook('2 Peter')).toEqual({ abbrev: '2 Pet', singleChapter: false });
    });

    test('should identify single-chapter books', () => {
      expect(lookupBook('Obadiah')).toEqual({ abbrev: 'Obad', singleChapter: true });
      expect(lookupBook('Philemon')).toEqual({ abbrev: 'Philem', singleChapter: true });
      expect(lookupBook('2 John')).toEqual({ abbrev: '2 John', singleChapter: true });
      expect(lookupBook('3 John')).toEqual({ abbrev: '3 John', singleChapter: true });
      expect(lookupBook('Jude')).toEqual({ abbrev: 'Jude', singleChapter: true });
    });

    test('should be case-insensitive', () => {
      expect(lookupBook('MATTHEW')).toEqual({ abbrev: 'Matt', singleChapter: false });
      expect(lookupBook('matthew')).toEqual({ abbrev: 'Matt', singleChapter: false });
      expect(lookupBook('MaTtHeW')).toEqual({ abbrev: 'Matt', singleChapter: false });
    });

    test('should handle whitespace', () => {
      expect(lookupBook('  Genesis  ')).toEqual({ abbrev: 'Gen', singleChapter: false });
      expect(lookupBook(' 1 Samuel ')).toEqual({ abbrev: '1 Sam', singleChapter: false });
    });

    test('should return undefined for unknown books', () => {
      expect(lookupBook('Unknown Book')).toBeUndefined();
      expect(lookupBook('Maccabees')).toBeUndefined(); // Not in the current map
      expect(lookupBook('')).toBeUndefined();
    });

    test('should handle alternative book names', () => {
      expect(lookupBook('Psalm')).toEqual({ abbrev: 'Ps', singleChapter: false });
      expect(lookupBook('Psalms')).toEqual({ abbrev: 'Ps', singleChapter: false });
      expect(lookupBook('Song of Solomon')).toEqual({ abbrev: 'Song', singleChapter: false });
      expect(lookupBook('Song of Songs')).toEqual({ abbrev: 'Song', singleChapter: false });
    });

    test('should find deuterocanonical books', () => {
      expect(lookupBook('Tobit')).toEqual({ abbrev: 'Tob', singleChapter: false });
      expect(lookupBook('Judith')).toEqual({ abbrev: 'Jdt', singleChapter: false });
      expect(lookupBook('Wisdom')).toEqual({ abbrev: 'Wis', singleChapter: false });
      expect(lookupBook('Sirach')).toEqual({ abbrev: 'Sir', singleChapter: false });
      expect(lookupBook('Wisdom of Ben Sira')).toEqual({ abbrev: 'Sir', singleChapter: false });
      expect(lookupBook('Ecclesiasticus')).toEqual({ abbrev: 'Sir', singleChapter: false });
      expect(lookupBook('Baruch')).toEqual({ abbrev: 'Bar', singleChapter: false });
      expect(lookupBook('1 Maccabees')).toEqual({ abbrev: '1 Macc', singleChapter: false });
      expect(lookupBook('2 Maccabees')).toEqual({ abbrev: '2 Macc', singleChapter: false });
    });
  });

  describe('BOOK_MAP', () => {
    test('should contain all 73 Catholic Bible books plus alternative names', () => {
      const bookCount = Object.keys(BOOK_MAP).length;
      // 73 books + alternative names (Psalm/Psalms, Song of Solomon/Song of Songs,
      // Sirach/Wisdom of Ben Sira/Ecclesiasticus)
      expect(bookCount).toBeGreaterThanOrEqual(73);
    });

    test('should have exactly 5 single-chapter books', () => {
      const singleChapterBooks = Object.values(BOOK_MAP).filter(b => b.singleChapter);
      expect(singleChapterBooks).toHaveLength(5);
    });
  });
});
