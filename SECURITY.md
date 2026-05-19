# Security Policy

## Supported Versions

Only the latest release receives security fixes.

| Version | Supported |
|---|---|
| Latest release | ✓ |
| Older releases | ✗ |

## Reporting a Vulnerability

**Do not** open a public GitHub issue for security vulnerabilities.

Use GitHub's private vulnerability reporting: go to the [Security tab](https://github.com/psenger/mcp-markdown-bible-enricher/security) and click **Report a vulnerability**. This keeps the details private until a fix is available.

Include:

- A clear description of the vulnerability and its potential impact
- Steps to reproduce, including any crafted input that triggers the issue
- The server version you tested (`version` field in `package.json`)
- Your Node.js version (`node --version`)

**Expected response time:** acknowledgement within 5 business days; resolution or status update within 30 days, depending on complexity.

## Scope

This server runs locally over stdio. It processes Markdown text, generates URL strings, and reads/writes local files on behalf of the MCP client. It does not authenticate users, open network listeners, or transmit file content to external services.

**In scope:**

- **ReDoS** — crafted input that causes catastrophic backtracking in the enrichment regex passes
- **Path traversal** — `bible_enrich_file` writing outside directories the caller intends
- **Dependency CVEs** — known vulnerabilities in direct runtime dependencies (`package.json` `dependencies`)

**Out of scope:**

- Content or availability of third-party services (Bible Gateway, Catholic Cross Reference)
- Security of MCP clients (Claude Desktop, Claude Code, Cursor) — report those upstream
- Vulnerabilities in dev-only dependencies (`devDependencies`) that cannot be triggered at runtime
- General bugs without a security impact — [open a bug report](https://github.com/psenger/mcp-markdown-bible-enricher/issues/new?template=bug_report.md) instead

## Disclosure Policy

Once a fix is ready and released:

1. A patch release is cut and tagged
2. The vulnerability is documented in `CHANGELOG.md` under **Security**
3. A GitHub Security Advisory is published referencing the fixed version