# Docubox

AI-assisted document management: upload files, parse with Unstructured, summarize with OpenAI, ask RAG questions via Ragie, organize folders, share links, and optionally buy credits with Stripe. Live site: [https://docubox.ai](https://docubox.ai)

## Features

Verified from the current codebase:

- **Upload & organize** — drag-and-drop uploads, folders, rename, trash, breadcrumbs, grid/table views, DnD
- **File preview** — in-browser preview for images, PDFs, text/code, video, and audio
- **AI parsing** — Unstructured API extraction; parsed chunks stored in Firebase Storage
- **AI summaries** — OpenAI via Vercel AI SDK
- **RAG Q&A** — chat against document context with Ragie
- **Share links** — public `/share/[token]` pages for download without auth
- **Storage usage** — file count and byte totals
- **Search / sort** — filename, summary, tags; sort by time, name, size, type
- **Auth** — Firebase Auth (login, signup, forgot password, session cookie API)
- **Credits / BYOK** — Stripe credit purchases or bring-your-own API keys on the profile
- **Theming** — dark/light via `@wrksz/themes`
- **Health check** — `GET /api/health`

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, Server Actions) |
| UI | React 19, Tailwind CSS 4, Radix UI, Lucide, CVA, TanStack Table |
| Language | TypeScript 6 |
| AI | Vercel AI SDK 6, `@ai-sdk/openai`, Unstructured client, Ragie API |
| Backend | Firebase 12 + firebase-admin 13 |
| Payments | Stripe |
| State | Zustand 5 |
| Markdown | react-markdown, remark-gfm, remark-math, syntax highlighter |
| Upload UX | react-dropzone, react-dnd |
| Tests | Vitest 3 |
| Node | `>=22` (`engines`) |

`.npmrc` sets `legacy-peer-deps=true`.

## Project structure

```
docubox/
├── src/
│   ├── app/           # Routes: dashboard, auth, share, payments, trash, legal
│   ├── components/    # Table/grid, chat, auth, landing, UI primitives
│   ├── actions/       # Server Actions (parse, payment, …)
│   ├── services/      # File and domain services
│   ├── firebase/      # Client + Admin
│   ├── hooks/, lib/, zustand/, utils/, constants/, types/
├── .env.example
├── firestore.rules
├── storage.rules
└── .github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Firebase project (Auth, Firestore, Storage)
- Unstructured API access
- OpenAI API key
- Ragie API key
- Stripe (optional)

### Install

```bash
git clone https://github.com/brown2020/docubox.git
cd docubox
git checkout dev
npm install
cp .env.example .env.local
# fill in values — never commit secrets
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name | Purpose | Where to get it |
|------|---------|-----------------|
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Firebase web API key | Firebase Console → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Auth domain | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Project ID | Same |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Storage bucket | Same |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Messaging sender ID | Same |
| `NEXT_PUBLIC_FIREBASE_APPID` | App ID | Same |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Analytics ID | Optional |
| `FIREBASE_PROJECT_ID` | Admin SDK project ID | Service account JSON |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK client email | Same |
| `FIREBASE_PRIVATE_KEY` | Admin SDK private key (`\n` escaped) | Same |
| `UNSTRUCTURED_API_KEY` | Unstructured API key (also overridable per profile) | [unstructured.io](https://unstructured.io) |
| `UNSTRUCTURED_API_URL` | Unstructured API base URL | Unstructured docs / dashboard |
| `OPENAI_API_KEY` | OpenAI API key (also BYOK on profile) | [platform.openai.com](https://platform.openai.com) |
| `RAGIE_API_KEY` | Ragie API key (also BYOK on profile) | [ragie.ai](https://ragie.ai) |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key | Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` | Product name for credit checkout | Stripe product config |

See `.env.example`. Server Actions body size limit is 4mb (`next.config.js`).

## Firebase

- Rules: `firestore.rules`, `storage.rules`
- Session cookies use the Admin SDK trio above

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint (`--max-warnings=0`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |

## Testing and CI

Vitest covers server-auth, Firebase auth errors, and payment action auth.

GitHub Actions (`.github/workflows/ci.yml`) on `dev` / `main` and PRs: `npm ci` → lint → typecheck → test → build → smoke `GET /api/health` against `next start`. Node 22. Required secrets: the six `NEXT_PUBLIC_FIREBASE_*` client vars used at build time.

## Deployment

Deploy as a Next.js app (e.g. Vercel) to [https://docubox.ai](https://docubox.ai). Set all env vars in the host. Deploy Firestore/Storage rules when they change.

## Contributing

- `main` — production
- `dev` — integration

See [AGENTS.md](./AGENTS.md) and [spec.md](./spec.md).

## License

[GNU Affero General Public License v3](./LICENSE.md) (AGPL-3.0).
