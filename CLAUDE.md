# CLAUDE.md — Docubox

> Last updated: 2026-02-06

## What Docubox Is

Docubox is an AI-powered document management web app. Users upload files, and Docubox parses them (via Unstructured API), generates summaries (via OpenAI), and enables RAG-based Q&A per document (via Ragie). It includes folder organization, drag-and-drop uploads, a credits system, and Stripe payments.

**Current state:** Functional MVP. Core upload → parse → summarize → Q&A loop works. Folder organization, trash/restore, table/grid views, search, and dark mode are implemented. Authentication migrated from Clerk to Firebase Auth. Landing page with pricing exists. Payment flow with Stripe works.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix UI |
| State | Zustand (7 stores) |
| Auth | Firebase Auth (email/password, Google OAuth, magic link) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| AI | Vercel AI SDK + OpenAI (gpt-4.1 default) |
| Document parsing | Unstructured API |
| RAG | Ragie API |
| Payments | Stripe |
| Deployment | Vercel |

---

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (--max-warnings=0)
```

---

## Project Structure

```
/src
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (providers, header, footer)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Tailwind v4 theme + animations
│   ├── api/auth/session/   # Session cookie API (POST/DELETE/GET)
│   ├── dashboard/          # Main file management view
│   ├── login/              # Login page
│   ├── loginfinish/        # Post-login redirect handler
│   ├── trash/              # Trash view
│   ├── profile/            # User profile (not a page - uses component)
│   ├── payment-attempt/    # Stripe checkout
│   ├── payment-success/    # Payment confirmation
│   ├── privacy/            # Privacy policy
│   └── terms/              # Terms of service
├── actions/                # Server Actions
│   ├── generateActions.ts  # RAG Q&A generation
│   ├── generateSummary.ts  # AI summarization
│   ├── getApiKeys.ts       # Server-side API key retrieval
│   ├── parse.ts            # Document parsing (Unstructured)
│   ├── paymentActions.ts   # Stripe payment intents
│   ├── ragieActions.ts     # Ragie upload/retrieve/delete
│   └── unstructuredActions.ts # Parsed data storage
├── components/
│   ├── auth/               # Auth provider, login form, user menu
│   ├── chat/               # Q&A chat UI, markdown rendering
│   ├── common/             # Shared: EmptyState, ErrorState, LoadingState, FileTypeIcon
│   ├── grid/               # Grid view (Card, GridView)
│   ├── landing/            # Landing: Hero, Features, HowItWorks, Pricing, FAQ, CTA
│   ├── providers/          # AuthProvider, ModalProvider
│   ├── table/              # Table view: DataTable, columns, cells, rows, DnD
│   ├── ui/                 # shadcn/ui primitives (button, dialog, input, etc.)
│   └── [root]              # Feature components (modals, dropzone, header, etc.)
├── constants/              # API config, credit costs, file extensions
├── firebase/               # Client SDK + Admin SDK setup
├── hooks/                  # 15 custom hooks
├── lib/                    # ai, errors, logger, server-auth, storage, utils
├── services/               # fileService (all file/folder CRUD)
├── types/                  # FileType, Chunk, Element, QARecord
├── utils/                  # Currency conversion, Firestore mapping, API/credit handling
└── zustand/                # 7 state stores + initializer
```

---

## Features (What Exists Today)

### Authentication
- Firebase Auth with Google OAuth, email/password, magic link
- Session cookies via `/api/auth/session` (POST creates, DELETE clears, GET verifies)
- Proxy middleware validates session cookies, redirects unauthenticated users
- Auth state synced to Zustand store and Firestore user document
- `AuthProvider` blocks rendering until auth is loaded

### File Management
- **Upload:** Drag-and-drop or file picker via `react-dropzone`. Max 20 MB per file. Progress tracking.
- **Folders:** Create, rename, navigate into/out of. Hierarchical structure via `folderId` field.
- **Rename:** Rename files and folders. Tags can be added during rename.
- **Delete:** Soft delete (sets `deletedAt` timestamp). Permanent delete removes from Storage + Firestore.
- **Restore:** Restore soft-deleted files from trash view.
- **Move:** Drag-and-drop files into folders (react-dnd).
- **Download:** Direct download via Firebase Storage URL.
- **Views:** Table view (TanStack Table) and grid view (card layout). Toggle between them.
- **Sort:** Sort by timestamp ascending/descending.
- **Search:** Client-side filename search (filters displayed files).
- **Trash:** Separate trash view at `/trash` showing soft-deleted files.

### AI Features
- **Document Parsing:** Unstructured API extracts text, tables, headers, metadata from uploaded files. Chunks are stored in Firebase Storage as JSON. Parsed data viewable in a modal with raw/readable/summary tabs.
- **AI Summarization:** OpenAI generates summaries from parsed data. Summaries are stored in Firestore and displayed in the parsed data modal.
- **RAG Q&A:** Files can be uploaded to Ragie for RAG indexing. Users ask questions and get AI-generated answers from document chunks. Q&A history stored per file. Chat UI with markdown rendering.

### Credits System
- Users start with 1,000 credits
- Credit costs: Parsing = 4, Summary = 4, Q&A = 8 (configurable via env vars)
- Users can bring their own API keys (OpenAI, Unstructured, Ragie) to bypass credits
- Toggle between credits and own keys in profile settings
- Credits deducted atomically via Firestore `increment()`

### Payments
- Stripe integration for purchasing credit packages
- Payment intent creation, checkout form, success confirmation
- Payment history stored in Firestore

### Profile
- Profile page with display name, email, credits balance
- API key management (add/update OpenAI, Unstructured, Ragie keys)
- Credits vs. own-keys toggle
- Link to payment page for buying credits

### UI/UX
- Dark/light/system theme via `next-themes`
- Responsive layout (desktop + mobile)
- Toast notifications for all async operations
- Error boundaries wrapping major sections
- Empty states for files, folders, search results
- Loading skeletons and spinners
- Modal system with lazy-loaded components and centralized state

### Landing Page
- Hero section with CTA
- Features grid (6 features)
- How it works (3 steps)
- Pricing (Free tier + Pay As You Go)
- FAQ accordion
- Footer CTA

---

## Firestore Schema

```
users/{userId}/                    # User document (auth state)
  ├── authEmail, authDisplayName, authPhotoUrl
  ├── authReady, firebaseUid
  └── lastSignIn

users/{userId}/profile/userData/   # Profile document
  ├── email, contactEmail, displayName, photoUrl
  ├── emailVerified
  ├── credits (number)
  ├── useCredits (boolean)
  ├── openai_api_key, unstructured_api_key, ragie_api_key
  └── (all strings, defaults to "")

users/{userId}/files/{fileId}/     # File/folder document
  ├── docId (string)               # Same as document ID
  ├── filename (string)
  ├── fullName (string)            # Original upload name
  ├── type (string)                # MIME type or "folder"
  ├── size (number)                # Bytes
  ├── downloadUrl (string | null)  # Firebase Storage URL
  ├── timestamp (Timestamp)
  ├── folderId (string | null)     # Parent folder ID
  ├── deletedAt (Timestamp | null) # Soft delete marker
  ├── tags (string[])
  ├── unstructuredFile (string[])  # Parsed chunk URLs
  ├── summary (string | null)      # AI summary
  ├── chunkCount (number)
  ├── isUploadedToRagie (boolean)
  ├── ragieFileId (string | null)
  └── qaRecords (QARecord[])       # {id, question, answer}

users/{userId}/payments/{paymentId}/ # Payment document
  ├── id, amount, status, createdAt
  └── (from Stripe payment intent)
```

---

## Auth Flow

1. User signs in via Firebase Auth (Google, email/password, or magic link)
2. `onAuthStateChanged` fires → `createSessionCookie()` POSTs to `/api/auth/session`
3. Session cookie (`__session`) set on response, verified by proxy middleware
4. `useFirebaseAuthSync` syncs auth state to Zustand (`useAuthStore`) and Firestore
5. `useInitializeStores` triggers `fetchProfile()` when `uid` + `authReady` are truthy
6. Proxy middleware validates session cookie via Firebase Admin SDK, clears stale cookies

---

## File Upload + Parse Flow

1. `Dropzone.tsx` accepts file drop → validates size (20 MB max)
2. `fileService.createFileEntry()` creates Firestore doc + starts Firebase Storage upload
3. `useUploadStore` tracks progress → `FileUploadModal` shows status
4. After upload completes, `fileService.completeFileUpload()` updates Firestore with download URL
5. User clicks "Parse" → `parseFile()` server action calls Unstructured API
6. Parsed chunks uploaded to Firebase Storage via `uploadUnstructuredFile()` (Admin SDK)
7. Chunk URLs saved to Firestore document
8. User can view parsed data, generate summary, or start Q&A

---

## Q&A Flow

1. User opens Q&A modal for a parsed file
2. If not yet in Ragie, file is uploaded via `uploadToRagie()` → polls for readiness
3. User types question → `retrieveChunks()` gets relevant chunks from Ragie
4. Chunks passed to `generateWithChunks()` → OpenAI generates answer
5. Q&A pair saved to file's `qaRecords` array in Firestore
6. Answer rendered with markdown + syntax highlighting

---

## Server Actions (All require auth via `requireAuth()`)

| Action | What it does |
|--------|-------------|
| `parseFile` | Sends file to Unstructured API, returns parsed chunks |
| `generateSummary` | Generates AI summary from parsed text (parallel chunk processing) |
| `generateWithChunks` | RAG Q&A: generates answer from retrieved chunks |
| `getApiKey` | Returns server-side API key for a service |
| `uploadToRagie` | Uploads file to Ragie for RAG indexing |
| `retrieveChunks` | Retrieves relevant chunks from Ragie for a query |
| `checkDocumentReadiness` | Checks if Ragie document is ready |
| `deleteFileFromRagie` | Removes file from Ragie |
| `uploadUnstructuredFile` | Stores parsed chunks in Firebase Storage (Admin SDK) |
| `downloadUnstructuredFile` | Downloads parsed chunk data |
| `createPaymentIntent` | Creates Stripe payment intent |
| `validatePaymentIntent` | Validates payment succeeded |

---

## Zustand Stores

| Store | Purpose |
|-------|---------|
| `useAuthStore` | User auth state (uid, email, displayName, etc.) |
| `useProfileStore` | Profile data, API keys, credits, CRUD operations |
| `useModalStore` | Which modal is open + modal-specific data |
| `useUploadStore` | File upload progress tracking |
| `useFileSelectionStore` | Currently selected file metadata |
| `useNavigationStore` | Current folder ID (synced with URL) |
| `usePaymentsStore` | Payment history and operations |

---

## Environment Variables

### Required
```
NEXT_PUBLIC_FIREBASE_APIKEY
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN
NEXT_PUBLIC_FIREBASE_PROJECTID
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID
NEXT_PUBLIC_FIREBASE_APPID
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
OPENAI_API_KEY
UNSTRUCTURED_API_KEY
UNSTRUCTURED_API_URL
RAGIE_API_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PRODUCT_NAME
```

### Optional (defaults)
```
NEXT_PUBLIC_CREDITS_PER_OPEN_AI    (4)
NEXT_PUBLIC_CREDITS_PER_UNSTRUCTURED (4)
NEXT_PUBLIC_CREDITS_PER_RAGIE      (8)
```

---

## Known Limitations & Rough Edges

### Missing table-stakes features
- **No file sharing** — no way to share files via link or with other users
- **No file preview** — must download files to view them (only parsed text is viewable in-app)
- **No version history** — files can't be reverted to previous versions
- **No storage quota display** — users can't see how much storage they're using
- **No bulk operations** — can't select multiple files for delete/move/download
- **No breadcrumb navigation** — folder path not shown; only back button available

### UX gaps
- **Search is filename-only** — doesn't search file contents despite having parsed text
- **No drag-and-drop for folder moves on mobile** — DnD only works on desktop
- **File type icons are basic** — uses `react-file-icon` which looks dated
- **No file size display in grid view** — only table view shows file size
- **Tags exist but aren't searchable or filterable** — can add tags but can't use them
- **No sorting options beyond timestamp** — can't sort by name, size, type
- **Parsed data URLs expire after 24 hours** — signed URLs for parsed chunks have short TTL

### Technical debt
- `CLAUDE.md` still references Clerk (auth was migrated to Firebase)
- `loginfinish` page is a dead route (from Clerk era, not used in Firebase auth flow)
- `useFileSelectionStore` duplicates data already available in `useModalStore`
- Some components have `"use client"` that could be server components
- `DeleteModal` doesn't call `close()` after successful deletion (modal stays open)
- Profile page route exists but is just a layout wrapper around `ProfileComponent`
- `ShowParsedDataModal` has a stale closure for `unstructuredFileData` in summary callback

### Architecture notes
- All file data is per-user (no sharing model exists)
- Real-time updates via `react-firebase-hooks` (Firestore subscriptions)
- Modals use lazy imports for code splitting
- No API routes besides `/api/auth/session` — everything else is server actions
- Proxy middleware runs on all routes via Next.js 16 `proxy.ts` convention

---

## Code Style

- Path alias `@/*` for imports from `src/`
- Functional components with hooks (no classes)
- Server actions over API routes
- Optimistic updates in stores with revert on error
- Dynamic imports for modals (code splitting)
- Error handling via `APIError` class and `logger` utility
- Type guards for file type checks (`isFolder`, `isParsed`, `isDeleted`, `isRAGReady`)
