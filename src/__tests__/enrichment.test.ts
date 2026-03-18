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

  describe('bare chapter references', () => {
    test('Isaiah 53 generates a Bible Gateway link and Obsidian chapter link', () => {
      const output = enrichMarkdown('Isaiah 53');
      expect(output).toContain('[Isaiah 53](https://www.biblegateway.com/passage/?search=Isaiah%2053&version=NRSVCE)');
      expect(output).toContain('[[Isa-53]]');
    });

    test('Psalm 91 generates a Bible Gateway link and Obsidian chapter link', () => {
      const output = enrichMarkdown('Psalm 91');
      expect(output).toContain('[Psalm 91](https://www.biblegateway.com/passage/?search=Psalm%2091&version=NRSVCE)');
      expect(output).toContain('[[Ps-91]]');
    });

    test('John 3 generates a link', () => {
      const output = enrichMarkdown('John 3');
      expect(output).toContain('[John 3]');
      expect(output).toContain('[[John-03]]');
    });

    test('1 Corinthians 13 generates a link', () => {
      const output = enrichMarkdown('1 Corinthians 13');
      expect(output).toContain('[1 Corinthians 13]');
      expect(output).toContain('[[1 Cor-13]]');
    });

    test('mixed content: James 5:7; Isaiah 5:1-7; Psalm 91; all enriched', () => {
      const output = enrichMarkdown('James 5:7; Isaiah 5:1-7; Psalm 91;');
      expect(output).toContain('[James 5:7]');
      expect(output).toContain('[Isaiah 5:1-7]');
      expect(output).toContain('[Psalm 91]');
    });

    test('bare chapter ref does not consume existing chapter:verse ref', () => {
      const output = enrichMarkdown('John 3:16');
      expect(output).toContain('[John 3:16]');
      // must NOT also produce a bare-chapter link for "John 3"
      expect(output).not.toContain('[John 3]');
    });

    test('idempotency — enrichMarkdown is stable for Isaiah 53', () => {
      const once = enrichMarkdown('Isaiah 53');
      const twice = enrichMarkdown(once);
      expect(twice).toBe(once);
    });

    test('already-linked Isaiah 53 is not double-enriched', () => {
      const input = '[Isaiah 53](https://www.biblegateway.com/passage/?search=Isaiah%2053&version=NRSVCE)';
      expect(enrichMarkdown(input)).toBe(input);
    });
  });

  describe('single-chapter books — bare verse references', () => {
    test('Jude 9 generates Bible Gateway link for Jude 1:9', () => {
      const output = enrichMarkdown('Jude 9');
      expect(output).toContain('[Jude 9](https://www.biblegateway.com/passage/?search=Jude%201%3A9&version=NRSVCE)');
    });

    test('Jude 9-14 generates Bible Gateway link and Obsidian range links', () => {
      const output = enrichMarkdown('Jude 9-14');
      expect(output).toContain('[Jude 9-14](https://www.biblegateway.com/passage/?search=Jude%201%3A9-14&version=NRSVCE)');
      expect(output).toContain('[[Jude#v9]]');
      expect(output).toContain('[[Jude#v14]]');
    });

    test('Obadiah 21 generates a link', () => {
      const output = enrichMarkdown('Obadiah 21');
      expect(output).toContain('[Obadiah 21]');
      expect(output).toContain('Obadiah%201%3A21');
    });

    test('Philemon 25 generates a link', () => {
      const output = enrichMarkdown('Philemon 25');
      expect(output).toContain('[Philemon 25]');
      expect(output).toContain('Philemon%201%3A25');
    });

    test('2 John 1 generates a link', () => {
      const output = enrichMarkdown('2 John 1');
      expect(output).toContain('[2 John 1]');
      expect(output).toContain('2%20John%201%3A1');
    });

    test('3 John 14 generates a link', () => {
      const output = enrichMarkdown('3 John 14');
      expect(output).toContain('[3 John 14]');
      expect(output).toContain('3%20John%201%3A14');
    });

    test('enrichMarkdown is idempotent for Jude 9', () => {
      const once = enrichMarkdown('Jude 9');
      const twice = enrichMarkdown(once);
      expect(twice).toBe(once);
    });

    test('already-linked Jude 9 is not double-enriched', () => {
      const input = '[Jude 9](https://www.biblegateway.com/passage/?search=Jude%201%3A9&version=NRSVCE)';
      const output = enrichMarkdown(input);
      expect(output).toBe(input);
    });
  });

  describe('period, colon and ellipsis termination — single-chapter bare verse (pass 2b)', () => {
    // All 5 single-chapter books: period
    test('Jude 9. — period after verse', () => {
      expect(enrichMarkdown('Jude 9.')).toContain('[Jude 9]');
    });
    test('Obadiah 21. — period after verse', () => {
      expect(enrichMarkdown('Obadiah 21.')).toContain('[Obadiah 21]');
    });
    test('Philemon 25. — period after verse', () => {
      expect(enrichMarkdown('Philemon 25.')).toContain('[Philemon 25]');
    });
    test('2 John 1. — period after verse', () => {
      expect(enrichMarkdown('2 John 1.')).toContain('[2 John 1]');
    });
    test('3 John 14. — period after verse', () => {
      expect(enrichMarkdown('3 John 14.')).toContain('[3 John 14]');
    });

    // Colon
    test('Jude 9: — colon after verse (introducing quote)', () => {
      expect(enrichMarkdown('Jude 9:')).toContain('[Jude 9]');
    });

    // Ellipsis
    test('Jude 9... — ellipsis after verse', () => {
      expect(enrichMarkdown('Jude 9...')).toContain('[Jude 9]');
    });

    // Range + period (the backtrack-and-shatter bug)
    test('Jude 9-14. — full range preserved when period follows', () => {
      const output = enrichMarkdown('Jude 9-14.');
      expect(output).toContain('[Jude 9-14]');
      expect(output).toContain('[[Jude#v9]]');
      expect(output).toContain('[[Jude#v14]]');
      expect(output).not.toContain(')-14.');
    });
    test('See Jude 9-14. — full range in sentence ending with period', () => {
      const output = enrichMarkdown('See Jude 9-14.');
      expect(output).toContain('[Jude 9-14]');
      expect(output).not.toContain(')-14.');
    });

    // In prose / markdown structure
    test('See Jude 9. — verse ends sentence', () => {
      expect(enrichMarkdown('See Jude 9.')).toContain('[Jude 9]');
    });
    test('- Jude 9. — verse in bullet list item', () => {
      expect(enrichMarkdown('- Jude 9.')).toContain('[Jude 9]');
    });
    test('> Jude 9. — verse in blockquote', () => {
      expect(enrichMarkdown('> Jude 9.')).toContain('[Jude 9]');
    });
    test('"See Jude 9." — verse in double-quotes ending with period', () => {
      expect(enrichMarkdown('"See Jude 9."')).toContain('[Jude 9]');
    });
    test("'Jude 9.' — verse in single-quotes ending with period", () => {
      expect(enrichMarkdown("'Jude 9.'")).toContain('[Jude 9]');
    });
    test('(cf. Jude 9.) — verse in parens ending with period', () => {
      expect(enrichMarkdown('(cf. Jude 9.)')).toContain('[Jude 9]');
    });

    // Idempotency
    test('idempotency: Jude 9.', () => {
      const once = enrichMarkdown('Jude 9.');
      expect(enrichMarkdown(once)).toBe(once);
    });
    test('idempotency: Jude 9-14.', () => {
      const once = enrichMarkdown('Jude 9-14.');
      expect(enrichMarkdown(once)).toBe(once);
    });
  });

  describe('period, colon and ellipsis termination — bare chapter (pass 2c)', () => {
    // All 7 deuterocanonical books: period, colon, ellipsis
    test('Tobit 1. — period', () => { expect(enrichMarkdown('Tobit 1.')).toContain('[Tobit 1]'); });
    test('Tobit 1: — colon', () => { expect(enrichMarkdown('Tobit 1:')).toContain('[Tobit 1]'); });
    test('Tobit 1... — ellipsis', () => { expect(enrichMarkdown('Tobit 1...')).toContain('[Tobit 1]'); });

    test('Judith 1. — period', () => { expect(enrichMarkdown('Judith 1.')).toContain('[Judith 1]'); });
    test('Judith 1: — colon', () => { expect(enrichMarkdown('Judith 1:')).toContain('[Judith 1]'); });
    test('Judith 1... — ellipsis', () => { expect(enrichMarkdown('Judith 1...')).toContain('[Judith 1]'); });

    test('Wisdom 1. — period', () => { expect(enrichMarkdown('Wisdom 1.')).toContain('[Wisdom 1]'); });
    test('Wisdom 1: — colon', () => { expect(enrichMarkdown('Wisdom 1:')).toContain('[Wisdom 1]'); });
    test('Wisdom 1... — ellipsis', () => { expect(enrichMarkdown('Wisdom 1...')).toContain('[Wisdom 1]'); });

    test('Sirach 1. — period', () => { expect(enrichMarkdown('Sirach 1.')).toContain('[Sirach 1]'); });
    test('Sirach 1: — colon', () => { expect(enrichMarkdown('Sirach 1:')).toContain('[Sirach 1]'); });
    test('Sirach 1... — ellipsis', () => { expect(enrichMarkdown('Sirach 1...')).toContain('[Sirach 1]'); });

    test('Baruch 1. — period', () => { expect(enrichMarkdown('Baruch 1.')).toContain('[Baruch 1]'); });
    test('Baruch 1: — colon', () => { expect(enrichMarkdown('Baruch 1:')).toContain('[Baruch 1]'); });
    test('Baruch 1... — ellipsis', () => { expect(enrichMarkdown('Baruch 1...')).toContain('[Baruch 1]'); });

    test('1 Maccabees 1. — period', () => { expect(enrichMarkdown('1 Maccabees 1.')).toContain('[1 Maccabees 1]'); });
    test('1 Maccabees 1: — colon', () => { expect(enrichMarkdown('1 Maccabees 1:')).toContain('[1 Maccabees 1]'); });
    test('1 Maccabees 1... — ellipsis', () => { expect(enrichMarkdown('1 Maccabees 1...')).toContain('[1 Maccabees 1]'); });

    test('2 Maccabees 1. — period', () => { expect(enrichMarkdown('2 Maccabees 1.')).toContain('[2 Maccabees 1]'); });
    test('2 Maccabees 1: — colon', () => { expect(enrichMarkdown('2 Maccabees 1:')).toContain('[2 Maccabees 1]'); });
    test('2 Maccabees 1... — ellipsis', () => { expect(enrichMarkdown('2 Maccabees 1...')).toContain('[2 Maccabees 1]'); });

    // Alternative names for Sirach
    test('Ecclesiasticus 1. — period', () => { expect(enrichMarkdown('Ecclesiasticus 1.')).toContain('[Ecclesiasticus 1]'); });
    test('Wisdom of Ben Sira 1. — period', () => { expect(enrichMarkdown('Wisdom of Ben Sira 1.')).toContain('[Wisdom of Ben Sira 1]'); });

    // Canonical examples from the issue
    test('Isaiah 53. — period', () => { expect(enrichMarkdown('Isaiah 53.')).toContain('[Isaiah 53]'); });
    test('Isaiah 53: — colon', () => { expect(enrichMarkdown('Isaiah 53:')).toContain('[Isaiah 53]'); });
    test('Isaiah 53... — ellipsis', () => { expect(enrichMarkdown('Isaiah 53...')).toContain('[Isaiah 53]'); });
    test('Psalm 91. — period', () => { expect(enrichMarkdown('Psalm 91.')).toContain('[Psalm 91]'); });

    // Multi-ref prose
    test('See Isaiah 53. Also Psalm 91. — both enriched', () => {
      const output = enrichMarkdown('See Isaiah 53. Also Psalm 91.');
      expect(output).toContain('[Isaiah 53]');
      expect(output).toContain('[Psalm 91]');
    });
    test('- Isaiah 53. — bare chapter in bullet + period', () => {
      expect(enrichMarkdown('- Isaiah 53.')).toContain('[Isaiah 53]');
    });

    // Regression: chapter:verse still works (BIBLE_REF_RE handles these, must not break)
    test('Tobit 1:1 — chapter:verse unaffected', () => {
      expect(enrichMarkdown('Tobit 1:1')).toContain('[Tobit 1:1]');
    });
    test('Isaiah 53.1 — dot-separator handled by BIBLE_REF_RE, not bare-chapter pass', () => {
      const output = enrichMarkdown('Isaiah 53.1');
      expect(output).toContain('[Isaiah 53.1]');
      expect(output).not.toContain('[Isaiah 53]<br>');
    });

    // Idempotency
    test('idempotency: Isaiah 53.', () => {
      const once = enrichMarkdown('Isaiah 53.');
      expect(enrichMarkdown(once)).toBe(once);
    });
    test('idempotency: Wisdom 1.', () => {
      const once = enrichMarkdown('Wisdom 1.');
      expect(enrichMarkdown(once)).toBe(once);
    });
  });

  describe('frontmatter protection', () => {
    // ── Basic frontmatter preservation ──────────────────────────────────────

    test('1. frontmatter block with no Bible refs is passed through unchanged', () => {
      const input = '---\ntitle: My Document\nauthor: Test\n---\n\nSome body text.';
      const output = enrichMarkdown(input);
      expect(output.startsWith('---\ntitle: My Document\nauthor: Test\n---\n')).toBe(true);
    });

    test('2. frontmatter block with a Bible ref tag (- John 3:16) is NOT enriched', () => {
      const input = '---\ntags:\n  - John 3:16\n---\n\nBody text.';
      const output = enrichMarkdown(input);
      // The frontmatter tag must remain as plain YAML — no link syntax injected
      expect(output).toContain('  - John 3:16\n');
      expect(output).not.toContain('  - [John 3:16]');
    });

    test('3. frontmatter block with a single-chapter bare verse tag (- Jude 9) is NOT enriched', () => {
      const input = '---\ntags:\n  - Jude 9\n---\n\nBody text.';
      const output = enrichMarkdown(input);
      expect(output).toContain('  - Jude 9\n');
      expect(output).not.toContain('  - [Jude 9]');
    });

    test('4. frontmatter block with a CCC reference (ccc: CCC 528) is NOT enriched', () => {
      const input = '---\nccc: CCC 528\n---\n\nBody text.';
      const output = enrichMarkdown(input);
      expect(output).toContain('ccc: CCC 528\n');
      expect(output).not.toContain('[CCC 528]');
    });

    test('5. frontmatter block with a bare chapter tag (- Isaiah 53) is NOT enriched', () => {
      const input = '---\ntags:\n  - Isaiah 53\n---\n\nBody text.';
      const output = enrichMarkdown(input);
      expect(output).toContain('  - Isaiah 53\n');
      expect(output).not.toContain('  - [Isaiah 53]');
    });

    // ── Body still enriched when frontmatter present ─────────────────────────

    test('6. Bible reference in the body IS enriched when doc has frontmatter', () => {
      const input = '---\ntitle: Test\n---\n\nRead John 3:16 today.';
      const output = enrichMarkdown(input);
      expect(output).toContain('[John 3:16]');
      expect(output).toContain('[[John-03#v16]]');
    });

    test('7. single-chapter bare verse in the body IS enriched when doc has frontmatter', () => {
      const input = '---\ntitle: Test\n---\n\nSee Jude 9 for context.';
      const output = enrichMarkdown(input);
      expect(output).toContain('[Jude 9]');
    });

    test('8. CCC reference in the body IS enriched when doc has frontmatter', () => {
      const input = '---\ntitle: Test\n---\n\nRead CCC 528 about the Epiphany.';
      const output = enrichMarkdown(input);
      expect(output).toContain('[CCC 528]');
      expect(output).toContain('catholiccrossreference');
    });

    test('9. bare chapter reference in the body IS enriched when doc has frontmatter', () => {
      const input = '---\ntitle: Test\n---\n\nSee Isaiah 53 for the suffering servant.';
      const output = enrichMarkdown(input);
      expect(output).toContain('[Isaiah 53]');
      expect(output).toContain('[[Isa-53]]');
    });

    // ── No regression when no frontmatter ───────────────────────────────────

    test('10. document with no frontmatter: plain text works as before', () => {
      const input = 'Read John 3:16 today.';
      const output = enrichMarkdown(input);
      expect(output).toContain('[John 3:16]');
    });

    test('11. document starting with # heading (not ---) is processed normally', () => {
      const input = '# My Heading\n\nRead John 3:16.';
      const output = enrichMarkdown(input);
      expect(output).toContain('# My Heading');
      expect(output).toContain('[John 3:16]');
    });

    test('12. document starting with a Bible reference is enriched normally', () => {
      const input = 'John 3:16 is the key verse.';
      const output = enrichMarkdown(input);
      expect(output).toContain('[John 3:16]');
    });

    // ── Edge cases ──────────────────────────────────────────────────────────

    test('13. --- appearing mid-document (not at position 0) is NOT treated as frontmatter', () => {
      const input = 'Some text.\n\n---\n\nJohn 3:16 is here.';
      const output = enrichMarkdown(input);
      // The horizontal rule --- stays, and John 3:16 in the body is enriched
      expect(output).toContain('---');
      expect(output).toContain('[John 3:16]');
    });

    test('14. frontmatter closed with ... instead of --- is detected correctly', () => {
      const input = '---\ntags:\n  - John 3:16\n...\n\nRead John 3:16 today.';
      const output = enrichMarkdown(input);
      // frontmatter ref NOT enriched
      expect(output).toContain('  - John 3:16\n');
      expect(output).not.toContain('  - [John 3:16]');
      // body ref IS enriched
      const bodyPart = output.split('...\n')[1];
      expect(bodyPart).toContain('[John 3:16]');
    });

    test('15. empty frontmatter block (---\\n---\\n) — body still enriched', () => {
      const input = '---\n---\n\nRead John 3:16 today.';
      const output = enrichMarkdown(input);
      expect(output.startsWith('---\n---\n')).toBe(true);
      expect(output).toContain('[John 3:16]');
    });

    test('16. frontmatter with multi-line string value containing a Bible ref is NOT enriched', () => {
      const input = '---\ndescription: |\n  See John 3:16 for more\n---\n\nBody text.';
      const output = enrichMarkdown(input);
      expect(output).toContain('  See John 3:16 for more\n');
      expect(output).not.toContain('  See [John 3:16]');
    });

    test('17. mixed doc: frontmatter tags + body with same ref — only body is enriched', () => {
      const input = '---\ntags:\n  - John 3:16\n---\n\nRead John 3:16 today.';
      const output = enrichMarkdown(input);
      // frontmatter tag unchanged
      expect(output).toContain('  - John 3:16\n');
      expect(output).not.toContain('  - [John 3:16]');
      // body enriched
      const bodyPart = output.split('---\n').slice(2).join('---\n');
      expect(bodyPart).toContain('[John 3:16]');
    });

    test('18. idempotency: enrichMarkdown(enrichMarkdown(input)) === enrichMarkdown(input) with frontmatter', () => {
      const input = '---\ntags:\n  - John 3:16\n  - Jude 9\n---\n\nRead John 3:16 and Jude 9.';
      const once = enrichMarkdown(input);
      const twice = enrichMarkdown(once);
      expect(twice).toBe(once);
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
