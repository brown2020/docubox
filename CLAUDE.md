# CLAUDE.md - Docubox

## Project Overview

Docubox is a document management application with AI-powered parsing, summarization, and RAG-based Q&A capabilities. Built with Next.js 16, Firebase, and the Vercel AI SDK.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui + Radix UI
- **State**: Zustand
- **Auth**: Clerk (primary) + Firebase Auth (synced)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI**: Vercel AI SDK + OpenAI (gpt-4.1 default)
- **Document Parsing**: Unstructured API
- **RAG**: Ragie API
- **Payments**: Stripe

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (--max-warnings=0)
```

## Project Structure

```
/src
├── app/              # Next.js App Router pages
├── actions/          # Server Actions (mutations, AI ops)
├── components/       # React components
│   ├── ui/           # shadcn/ui primitives
│   ├── table/        # DataTable (TanStack)
│   ├── grid/         # GridView layout
│   ├── chat/         # QA/chat components
│   ├── common/       # Shared components
│   └── providers/    # Context providers
├── firebase/         # Firebase client & admin setup
├── hooks/            # Custom React hooks
├── lib/              # Utilities (ai, errors, logger)
├── services/         # Business logic (fileService)
├── types/            # TypeScript definitions
├── utils/            # Helper functions
├── zustand/          # State stores
└── constants/        # Configuration constants
```

## Architecture Patterns

### Server Actions
Located in `/src/actions/`. Use `"use server"` directive. Handle auth, API calls, and Firestore updates.

### Service Layer
`fileService` in `/src/services/fileService.ts` provides CRUD operations for files and folders.

### State Management (Zustand)
- `useAuthStore` - Clerk + Firebase auth state
- `useProfileStore` - User profile, API keys, credits
- `useModalStore` - Global modal state
- `useUploadStore` - File upload progress
- `useFileSelectionStore` - Selected file + parsed data
- `useNavigationStore` - Folder navigation, breadcrumbs

### Real-time Data
Uses `react-firebase-hooks` for Firestore subscriptions with real-time updates.

## Key Files

- `src/services/fileService.ts` - All file/folder CRUD operations
- `src/actions/parse.ts` - Document parsing via Unstructured
- `src/actions/generateSummary.ts` - AI summarization
- `src/actions/generateActions.ts` - RAG-based Q&A
- `src/lib/ai.ts` - OpenAI client setup
- `src/hooks/useFilesList.ts` - Firestore queries with filtering
- `src/zustand/*.ts` - State stores

## Firestore Schema

```
users/{userId}/
  profile/
    userData/           # Profile, API keys, credits
  files/
    {fileId}/           # File metadata & content
      - docId, filename, type, size
      - downloadUrl, timestamp, folderId
      - deletedAt (soft delete)
      - unstructuredFile (parsed chunks)
      - summary, chunkCount
      - isUploadedToRagie, ragieFileId
      - qaRecords (Q&A history)
```

## Type Guards

Use type guards from `/src/types/filetype.ts`:
```typescript
isFolder(file)    // Check if folder
isParsed(file)    // Has parsed content
isDeleted(file)   // Soft deleted
isRAGReady(file)  // Uploaded to Ragie
```

## Environment Variables

### Required
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
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

### Optional (defaults in parentheses)
```
NEXT_PUBLIC_CREDITS_PER_OPEN_AI (4)
NEXT_PUBLIC_CREDITS_PER_UNSTRUCTURED (4)
NEXT_PUBLIC_CREDITS_PER_RAGIE (8)
```

## Code Style

- Use path alias `@/*` for imports from `src/`
- Components use functional style with hooks
- Prefer server actions over API routes
- Use optimistic updates in stores, revert on error
- Dynamic imports for modals (code splitting)
- Error handling via `APIError` class and `logger`

## Auth Flow

1. Clerk handles sign-in (OAuth, email)
2. `useFirebaseAuthSync` hook syncs Clerk to Firebase Auth
3. Custom token obtained from Clerk JWT
4. Firebase signs in with custom token
5. Zustand stores cache auth state

## File Upload Flow

1. `Dropzone.tsx` handles drag-drop
2. `fileService.createFileEntry()` creates Firestore doc + uploads to Storage
3. `useUploadStore` tracks progress
4. `FileUploadModal` monitors completion
5. `parseFile()` calls Unstructured API
6. `updateParsedData()` saves chunks to Firestore

## Credits System

Users can use their own API keys OR platform credits:
- OpenAI: 4 credits
- Unstructured: 4 credits
- Ragie: 8 credits
- Default allocation: 1000 credits per user
