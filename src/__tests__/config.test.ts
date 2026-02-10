import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { loadConfig, formatObsidianLink } from '../config.js';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment after each test
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    test('should load default configuration', () => {
      delete process.env.BIBLE_VERSION;
      delete process.env.OBSIDIAN_FORMAT;
      delete process.env.INCLUDE_OBSIDIAN_LINKS;

      const config = loadConfig();

      expect(config.bibleVersion).toBe('NRSVCE');
      expect(config.obsidianFormat).toBe('[[{abbrev}-{chapter2}#v{verse}]]');
      expect(config.includeObsidianLinks).toBe(true);
    });

    test('should load custom Bible version', () => {
      process.env.BIBLE_VERSION = 'NRSVCE';

      const config = loadConfig();

      expect(config.bibleVersion).toBe('NRSVCE');
    });

    test('should load custom Obsidian format', () => {
      process.env.OBSIDIAN_FORMAT = '[[Bible/{abbrev}/{chapter}#v{verse}]]';

      const config = loadConfig();

      expect(config.obsidianFormat).toBe('[[Bible/{abbrev}/{chapter}#v{verse}]]');
    });

    test('should disable Obsidian links when set to false', () => {
      process.env.INCLUDE_OBSIDIAN_LINKS = 'false';

      const config = loadConfig();

      expect(config.includeObsidianLinks).toBe(false);
    });

    test('should enable Obsidian links for any non-false value', () => {
      process.env.INCLUDE_OBSIDIAN_LINKS = 'true';
      expect(loadConfig().includeObsidianLinks).toBe(true);

      process.env.INCLUDE_OBSIDIAN_LINKS = '1';
      expect(loadConfig().includeObsidianLinks).toBe(true);

      process.env.INCLUDE_OBSIDIAN_LINKS = 'yes';
      expect(loadConfig().includeObsidianLinks).toBe(true);
    });
  });

  describe('formatObsidianLink', () => {
    test('should format default template', () => {
      const result = formatObsidianLink('Matt', 5, 3, '[[{abbrev}-{chapter2}#v{verse}]]');
      expect(result).toBe('[[Matt-05#v3]]');
    });

    test('should format with zero-padded chapter', () => {
      expect(formatObsidianLink('Gen', 1, 1, '[[{abbrev}-{chapter2}#v{verse}]]'))
        .toBe('[[Gen-01#v1]]');
      expect(formatObsidianLink('Gen', 12, 1, '[[{abbrev}-{chapter2}#v{verse}]]'))
        .toBe('[[Gen-12#v1]]');
      expect(formatObsidianLink('Ps', 119, 1, '[[{abbrev}-{chapter2}#v{verse}]]'))
        .toBe('[[Ps-119#v1]]');
    });

    test('should format with unpadded chapter', () => {
      const result = formatObsidianLink('Matt', 5, 3, '[[{abbrev} {chapter}:{verse}]]');
      expect(result).toBe('[[Matt 5:3]]');
    });

    test('should format nested structure', () => {
      const result = formatObsidianLink('John', 3, 16, '[[Bible/{abbrev}/{chapter}#v{verse}]]');
      expect(result).toBe('[[Bible/John/3#v16]]');
    });

    test('should handle multiple placeholder replacements', () => {
      const result = formatObsidianLink(
        'Rom',
        8,
        28,
        '[[{abbrev}]] chapter {chapter} verse {verse} ({chapter2})'
      );
      expect(result).toBe('[[Rom]] chapter 8 verse 28 (08)');
    });

    test('should handle templates without all placeholders', () => {
      expect(formatObsidianLink('Matt', 5, 3, '[[{abbrev}]]'))
        .toBe('[[Matt]]');
      expect(formatObsidianLink('Matt', 5, 3, '[[Chapter {chapter}]]'))
        .toBe('[[Chapter 5]]');
    });
  });
});
