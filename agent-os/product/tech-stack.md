# Tech Stack

## Runtime

- **TypeScript** — strict mode, ES Modules (`"type": "module"` in package.json)
- **Node.js** — target ES2022; `.js` extensions required in imports for Node16 module resolution

## MCP Layer

- **@modelcontextprotocol/sdk** — MCP server with stdio transport; registers tools and prompts

## Testing

- **Jest** with `--experimental-vm-modules` for ES Module support
- Tests live in `src/__tests__/`; run with `npm test`

## Build & Tooling

- **tsx** — watch mode for development (`npm run dev`)
- **ESLint** — linting (`npm run lint`)
- **Prettier** — formatting (`npm run format`)
- Compiled output: `src/` → `dist/`

## Frontend

N/A — server-side only; no UI.

## Database

N/A — stateless; no persistence layer.

## External APIs

- **Bible Gateway** (`biblegateway.com`) — linked but not called at runtime; URLs are constructed deterministically
- **Catholic Cross Reference** (`catholiccrossreference.online`) — same; URL construction only