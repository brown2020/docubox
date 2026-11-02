# Roadmap

Product priorities stay in [spec.md](./spec.md). This file only records the
setup baseline after dependency upgrades.

## Setup baseline (2026-11-02)

- Node.js 24 (`engines`: `>=24`). CI uses Node 24.
- Next.js 16.4, React 19.3, Tailwind CSS 4, ESLint 10.
- TanStack Table 9 (`useTable` plus explicit visibility and selection features).
- Firebase 13 and firebase-admin 14. `require("firebase-admin/auth")` loads.
- Vercel AI SDK 7 and `@ai-sdk/openai` 4. Model ids are unchanged:
  `gpt-4.1` (default), `gpt-4o`, `gpt-4o-mini`.
- Vitest 5 and Vite 8.
- Typecheck runs the TypeScript 7.0 compiler via `@typescript/native`.
  The `typescript` package stays at 6.0.3 because TypeScript 7.0 has no
  programmatic API, and `typescript-eslint` / `eslint-config-next` cannot load it.

## Security overrides

Kept or bumped only to a patched release:

- `@grpc/grpc-js` 1.14.7
- `@modelcontextprotocol/sdk` 1.32.2
- `katex` 0.19.1
- `jwks-rsa` → `jose` 5.10.0 (jose 6 is ESM-only and breaks firebase-admin `require()`)
- `minimatch` 11.0.4
- `glob` 14.0.3

`npm audit` reports 0 vulnerabilities on this lockfile.
