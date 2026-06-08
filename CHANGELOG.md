# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.6] - 2026-06-08

### Changed
- Update README.md
- Update dependencies: hono 4.12.18 → 4.12.23, qs 6.15.0 → 6.15.2

## [0.2.5] - 2026-05-20

### Fixed
- Enrich Bible references inside parentheses

## [0.2.4] - 2026-05-20

### Added
- Agentic scaffolding, CHANGELOG.md, CONTRIBUTING.md, SECURITY.md, GitHub issue/PR templates, and four Claude skills (changelog, start-a-release, complete-a-release, start-work-on-an-issue)

### Security
- Bumped fast-uri 3.1.0 → 3.1.2 to patch CVE-2026-6321 (path traversal via percent-encoded dot segments, GHSA-q3j6-qgpj-74h6) and CVE-2026-6322 (host confusion via percent-encoded authority delimiters, GHSA-v39h-62p7-jpjc)

## [0.2.3] - 2026-03-19

### Added
- YAML frontmatter protection — `enrichMarkdown()` now strips the frontmatter block before processing and reattaches it unchanged, preventing enrichment of metadata fields

## [0.2.2] - 2026-03-18

### Changed
- Updated README with Obsidian integration guide, corrected `claude mcp add` command syntax, and removed stale limitations

## [0.2.1] - 2026-03-18

### Fixed
- Over-broad lookahead `(?![:.\d])` in passes 2b and 2c replaced with `(?!\d)` — references followed by periods, colons, or ellipses are now correctly enriched (issue #11)

## [0.2.0] - 2026-03-18

### Added
- Bare verse references for single-chapter books: `Jude 9`, `Obadiah 21`, `Philemon 25`, `2 John 1`, `3 John 14`
- Bare chapter references: `Psalm 91`, `Isaiah 53`, `1 Corinthians 13`

## [0.1.0] - 2026-03-18

### Security
- Bumped minimatch 3.1.2 → 3.1.5 / 9.0.5 → 9.0.9 (ReDoS fix)
- Bumped `@hono/node-server` 1.19.9 → 1.19.11 (auth bypass fix, GHSA-wc8c-qw6v-h7f6)
- Bumped `ajv` 6.12.6 → 6.14.0 (CVE-2025 `$data` regex exploit)
- Bumped `hono` 4.11.9 → 4.12.8 (ReDoS and prototype pollution)
- Bumped `express-rate-limit` 8.2.1 → 8.3.1 (security hardening)

## [0.0.2] - 2026-03-18

### Added
- `agent-os/` directory with machine-readable standards and configuration for agentic workflows

## [0.0.1] - 2026-02-10

### Added
- Initial release: MCP server with `bible_enrich_markdown` and `bible_enrich_file` tools
- Bible Gateway link generation for all 73 Catholic Bible books (including 7 deuterocanonical books: Tobit, Judith, Wisdom, Sirach, Baruch, 1-2 Maccabees)
- Obsidian wiki-link generation with configurable format template
- Catechism of the Catholic Church (CCC) reference linking via Catholic Cross Reference
- Environment variable configuration: `BIBLE_VERSION`, `OBSIDIAN_FORMAT`, `INCLUDE_OBSIDIAN_LINKS`

[Unreleased]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.2.6...HEAD
[0.2.6]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/psenger/mcp-markdown-bible-enricher/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/psenger/mcp-markdown-bible-enricher/commits/v0.0.1