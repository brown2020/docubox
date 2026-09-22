# Repository Guidance

## Project Shape

Docubox is a Next.js 16 App Router application for document storage, AI parsing,
summaries, and per-document Q&A. The app uses TypeScript, React 19, Tailwind CSS
v4, Firebase Auth/Firestore/Storage, Firebase Admin server utilities, Stripe,
the Vercel AI SDK/OpenAI, Unstructured, Ragie, Zustand, Radix UI, and
TanStack Table.

## Commands

- `npm run dev` starts the local development server.
- `npm run build` runs the production Next.js build.
- `npm run start` starts a built app.
- `npm run lint` runs ESLint with `--max-warnings=0`.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm test` runs Vitest (`src/**/*.test.ts`).

Use `npm` and keep `package-lock.json` authoritative. Local quality gates are
lint, typecheck, test, and build. GitHub Actions workflow `.github/workflows/ci.yml`
runs the same gates on `dev`/`main` and smokes `GET /api/health`.

## Architecture Notes

- `src/app/` contains App Router pages, layouts, and the session API route.
- `src/proxy.ts` protects authenticated routes with Firebase session cookies.
- `src/actions/` contains server actions. Server-side actions should call
  `requireAuth()` or `requireAuthWithClaims()` from `src/lib/server-auth.ts`
  before reading or mutating per-user data.
- `src/firebase/` owns Firebase client and admin initialization.
- `src/services/fileService.ts` centralizes file, folder, share-link, parsed
  data, summary, and storage operations.
- `src/zustand/` holds client state stores. `useModalStore` is the modal source
  of truth; `useFileSelectionStore` is reserved for bulk file selection.
- `src/hooks/useFilesList.ts` owns file list filtering, search, storage totals,
  folder-size calculation, and client-side sort behavior.
- `src/components/table/`, `src/components/grid/`, and root feature components
  own the dashboard file-management UI.

## Safety Rules

- Work on `dev` for codebase-improvement work unless the user explicitly names
  another branch.
- Do not commit local secrets. `service_key.json`, `.env`, and `.env*.local`
  are ignored and should stay local.
- Keep server-only Firebase Admin and secret-bearing code out of client
  components.
- Preserve the per-user Firestore data model unless a product workflow
  explicitly approves collaboration or shared ownership changes.
- Prefer small, verifiable changes. Run `npm run lint` before pushing when
  source or docs/report files change.
- Do not treat `spec.md` roadmap items as newly approved work during codebase
  cleanup. Update current-state and validation notes only unless the user gives
  product direction.

## Current Validation Notes

- Quality gates: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- CI: `.github/workflows/ci.yml` (lint/typecheck/test/build + `/api/health` smoke).
- Auth is Firebase Auth with Clerk-compatible client adapters; server actions use `requireAuth()` / session cookies.
- Several older `spec.md`/`CLAUDE.md` rough-edge items are already implemented
  or mitigated in code, including share links, previews, breadcrumbs, storage
  usage, broader search, sort options, compact upload controls, delete-modal
  close behavior, persistent parsed chunk paths, and a redirecting legacy
  `loginfinish` route.
