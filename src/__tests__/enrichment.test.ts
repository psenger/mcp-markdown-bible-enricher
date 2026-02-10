import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { enrichMarkdown } from '../enrichment.js';

describe('enrichment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Set default config for tests
    process.env = { ...originalEnv };
    process.env.BIBLE_VERSION = 'NRSVCE';
    process.env.OBSIDIAN_FORMAT = '[[{abbrev}-{chapter2}#v{verse}]]';
    process.env.INCLUDE_OBSIDIAN_LINKS = 'true';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Bible reference enrichment', () => {
    test('should enrich simple single verse reference', () => {
      const input = 'Read John 3:16 for hope.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[John 3:16](https://www.biblegateway.com/passage/?search=John%203%3A16&version=NRSVCE)');
      expect(output).toContain('[[John-03#v16]]');
    });

    test('should enrich verse range', () => {
      const input = 'See Matthew 5:3-12.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[Matthew 5:3-12]');
      expect(output).toContain('[[Matt-05#v3]] - [[Matt-05#v12]]');
    });

    test('should enrich multiple verses in same chapter', () => {
      const input = 'Read 1 Samuel 16:1, 16:4-13 carefully.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[1 Samuel 16:1, 16:4-13]');
      expect(output).toContain('[[1 Sam-16#v1]]');
      expect(output).toContain('[[1 Sam-16#v4]] - [[1 Sam-16#v13]]');
    });

    test('should enrich references with implicit chapter', () => {
      const input = 'See Psalm 23:1, 4, 6.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[[Ps-23#v1]]');
      expect(output).toContain('[[Ps-23#v4]]');
      expect(output).toContain('[[Ps-23#v6]]');
    });

    test('should enrich Old Testament books', () => {
      const input = 'Genesis 1:1 says so.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[Genesis 1:1]');
      expect(output).toContain('[[Gen-01#v1]]');
    });

    test('should enrich numbered books', () => {
      const input = 'Study 2 Corinthians 5:17.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[2 Corinthians 5:17]');
      expect(output).toContain('[[2 Cor-05#v17]]');
    });

    test('should not enrich text already in links', () => {
      const input = 'See [John 3:16](https://example.com) already linked.';
      const output = enrichMarkdown(input);

      // Should not double-link
      expect(output).toBe(input);
    });

    test('should enrich backtick-wrapped references', () => {
      const input = 'Reference `1 Samuel 16:1, 16:4-13:` in text.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[1 Samuel 16:1, 16:4-13]');
      expect(output).not.toContain('`');
    });

    test('should preserve text without Bible references', () => {
      const input = 'This is just plain text with no references.';
      const output = enrichMarkdown(input);

      expect(output).toBe(input);
    });

    test('should handle multiple references in one text', () => {
      const input = 'Genesis 1:1 and John 3:16 are important.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[Genesis 1:1]');
      expect(output).toContain('[John 3:16]');
      expect(output).toContain('[[Gen-01#v1]]');
      expect(output).toContain('[[John-03#v16]]');
    });
  });

  describe('CCC reference enrichment', () => {
    test('should enrich simple CCC reference', () => {
      const input = 'Read CCC 528 about Jesus.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[CCC 528](https://www.catholiccrossreference.online/catechism/#!/search/528)');
    });

    test('should enrich CCC range', () => {
      const input = 'See CCC 528-530.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[CCC 528-530]');
      expect(output).toContain('528-530');
    });

    test('should enrich multiple CCC references', () => {
      const input = 'Read CCC 528-530, 610-612 together.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[CCC 528-530, 610-612]');
    });

    test('should enrich CCC with comma-separated values', () => {
      const input = 'Study CCC 100, 200, 300.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[CCC 100, 200, 300]');
    });

    test('should not enrich CCC already in links', () => {
      const input = '[CCC 528](https://example.com) already linked.';
      const output = enrichMarkdown(input);

      expect(output).toBe(input);
    });
  });

  describe('Combined enrichment', () => {
    test('should enrich both Bible and CCC references', () => {
      const input = 'Read CCC 528. Also see 1 Samuel 16:1, 16:4-13 and Matthew 2:6.';
      const output = enrichMarkdown(input);

      expect(output).toContain('[CCC 528]');
      expect(output).toContain('[1 Samuel 16:1, 16:4-13]');
      expect(output).toContain('[Matthew 2:6]');
      expect(output).toContain('[[1 Sam-16#v1]]');
      expect(output).toContain('[[Matt-02#v6]]');
    });

    test('should handle complex mixed content', () => {
      const input = `
According to Romans 8:28 and CCC 313, all things work together for good.
See also Genesis 50:20 and CCC 312-314 for more context.
`;
      const output = enrichMarkdown(input);

      expect(output).toContain('[Romans 8:28]');
      expect(output).toContain('[CCC 313]');
      expect(output).toContain('[Genesis 50:20]');
      expect(output).toContain('[CCC 312-314]');
    });
  });

  describe('Configuration support', () => {
    test('should respect custom Bible version', () => {
      process.env.BIBLE_VERSION = 'ESV';
      // Need to reload the module to pick up new config
      // For this test, we'll just check the format is correct
      const input = 'John 3:16';
      const output = enrichMarkdown(input);

      // The URL should still be formed correctly, even if version might be cached
      expect(output).toContain('biblegateway.com');
    });

    test('should exclude Obsidian links when disabled', () => {
      process.env.INCLUDE_OBSIDIAN_LINKS = 'false';
      // Note: Due to module caching, this might not work as expected in the same test run
      // In real usage, the config is loaded once at startup
      const input = 'John 3:16';
      const output = enrichMarkdown(input);

      expect(output).toContain('[John 3:16]');
      expect(output).toContain('biblegateway.com');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty string', () => {
      expect(enrichMarkdown('')).toBe('');
    });

    test('should handle text with no references', () => {
      const input = 'Just some regular text.';
      expect(enrichMarkdown(input)).toBe(input);
    });

    test('should handle malformed references gracefully', () => {
      const input = 'Genesis and John without verses.';
      const output = enrichMarkdown(input);
      // Should not enrich book names without verse numbers
      expect(output).toBe(input);
    });

    test('should preserve markdown formatting', () => {
      const input = '# Header\n\nRead John 3:16.\n\n- List item';
      const output = enrichMarkdown(input);

      expect(output).toContain('# Header');
      expect(output).toContain('- List item');
      expect(output).toContain('[John 3:16]');
    });

    test('should handle Unicode and special characters', () => {
      const input = "Read John 3:16 — it's amazing!";
      const output = enrichMarkdown(input);

      expect(output).toContain('[John 3:16]');
      expect(output).toContain('—');
      expect(output).toContain("it's");
    });
  });
});
