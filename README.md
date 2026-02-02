# Docubox

Docubox is a modern document management application with AI-powered parsing, summarization, and RAG-based Q&A capabilities. Built with [Next.js](https://nextjs.org/) 16, [Firebase](https://firebase.google.com/), and the [Vercel AI SDK](https://sdk.vercel.ai/).

## Features

- **AI Document Parsing:** Extract text, tables, headers, and metadata from documents using the [Unstructured API](https://unstructured.io/).
- **AI Summaries:** Generate concise summaries powered by GPT-4.1 to understand documents at a glance.
- **RAG-Powered Q&A:** Ask questions about your documents and get accurate, context-aware answers using [Ragie](https://ragie.ai/).
- **File Management:** Upload, rename, delete, and organize files into folders with drag-and-drop support.
- **Secure Storage:** Documents stored securely with [Firebase Storage](https://firebase.google.com/docs/storage) and metadata in [Firestore](https://firebase.google.com/docs/firestore).
- **Flexible Pricing:** Pay-as-you-go credits or bring your own API keys to use AI features for free.
- **Dark Mode:** Full dark mode support with system preference detection.

## How It Works

1. **Upload** - Drag and drop documents (PDF, DOCX, TXT, and more) into Docubox.
2. **Parse & Analyze** - AI extracts text, identifies structure, and generates a summary of key points.
3. **Chat & Explore** - Ask questions about your documents and get instant, accurate answers backed by RAG technology.

## Tech Stack

### Core Framework

- **[Next.js](https://nextjs.org/)** `16.0.3` - App Router with React Server Components
- **[React](https://react.dev/)** `19.0.0` - UI runtime
- **[TypeScript](https://www.typescriptlang.org/)** `5.6.2` - Type safety

### Styling

- **[Tailwind CSS](https://tailwindcss.com/)** `4.0.8` - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Accessible UI components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible primitives
- **[Lucide React](https://lucide.dev/)** `0.563.0` - Icons
- **[tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate)** `1.0.7` - Animation utilities
- **[next-themes](https://github.com/pacocoursey/next-themes)** `0.4.3` - Theme management

### Backend & Data

- **[Firebase](https://firebase.google.com/)** `12.2.1` - Client SDK for Firestore & Storage
- **[firebase-admin](https://firebase.google.com/docs/admin/setup)** `13.0.1` - Server-side admin SDK
- **[react-firebase-hooks](https://github.com/CSFrequency/react-firebase-hooks)** `5.1.1` - React hooks for Firebase

### AI & Document Processing

- **[Vercel AI SDK](https://sdk.vercel.ai/)** `6.0.3` - AI integrations and streaming
- **[@ai-sdk/openai](https://www.npmjs.com/package/@ai-sdk/openai)** `3.0.1` - OpenAI provider
- **[unstructured-client](https://www.npmjs.com/package/unstructured-client)** `0.30.1` - Document parsing
- **Ragie API** - RAG retrieval for Q&A

### Payments

- **[Stripe](https://stripe.com/)** `20.0.0` - Payment processing
- **[@stripe/stripe-js](https://www.npmjs.com/package/@stripe/stripe-js)** `8.5.2` - Stripe.js loader
- **[@stripe/react-stripe-js](https://www.npmjs.com/package/@stripe/react-stripe-js)** `5.4.0` - React components

### State Management

- **[Zustand](https://docs.pmnd.rs/zustand)** `5.0.1` - Lightweight state management

### UI Components & Utilities

- **[@tanstack/react-table](https://tanstack.com/table)** `8.20.5` - Data tables
- **[react-dropzone](https://react-dropzone.js.org/)** `14.2.3` - Drag-and-drop file uploads
- **[react-dnd](https://react-dnd.github.io/react-dnd/)** `16.0.1` - Drag and drop for file organization
- **[react-markdown](https://github.com/remarkjs/react-markdown)** `10.0.0` - Markdown rendering
- **[react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** `16.1.0` - Code highlighting
- **[react-hot-toast](https://react-hot-toast.com/)** `2.4.1` - Toast notifications
- **[react-file-icon](https://www.npmjs.com/package/react-file-icon)** `1.5.0` - File type icons
- **[pretty-bytes](https://www.npmjs.com/package/pretty-bytes)** `7.0.1` - Human-readable file sizes
- **[remark-gfm](https://github.com/remarkjs/remark-gfm)** `4.0.0` - GitHub Flavored Markdown
- **[remark-math](https://github.com/remarkjs/remark-math)** `6.0.0` - Math notation support

## Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** v18+ (required by dependencies)
- **[Firebase Project](https://firebase.google.com/)** with Firestore and Storage enabled
- **API Keys** for AI features (see below)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/brown2020/docubox.git
   cd docubox
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy `.env.example` to `.env.local` and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

### Running the Development Server

```bash
npm run dev
```

Visit the app at `http://localhost:3000`.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint with zero warnings policy
```

## Environment Variables

### Firebase Client Config (Required)

```bash
NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_firebase_app_id
```

### Firebase Admin Config (Required for server-side auth)

Get these from Firebase Console > Project Settings > Service Accounts > Generate New Private Key:

```bash
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
```

### Third-Party APIs (Required for AI features)

```bash
UNSTRUCTURED_API_KEY=your_unstructured_api_key
UNSTRUCTURED_API_URL=your_unstructured_api_url
OPENAI_API_KEY=your_openai_api_key
RAGIE_API_KEY=your_ragie_api_key
```

### Stripe (Optional, for payments)

```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PRODUCT_NAME=your_stripe_product_name
```

## Pricing & Credits

Docubox uses a **pay-as-you-go** credit system:

| Operation        | Credit Cost |
| ---------------- | ----------- |
| Document Parsing | 4 credits   |
| AI Summary       | 4 credits   |
| Q&A Query        | 8 credits   |

- **Free tier:** New accounts start with 1,000 free credits
- **Buy credits:** Purchase credit packages when you need more
- **Bring your own keys:** Configure your own OpenAI, Unstructured, and Ragie API keys in your profile to use AI features without spending credits

## Supported File Types

- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- PowerPoint (`.ppt`, `.pptx`)
- Excel (`.xls`, `.xlsx`)
- Text files (`.txt`)
- Markdown (`.md`)
- Images (`.jpg`, `.jpeg`, `.png`, `.gif`)
- Email (`.msg`, `.eml`)
- Archives (`.zip`, `.rar`)

## Project Structure

```
/src
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (auth session)
│   ├── dashboard/         # Main file management view
│   ├── login/             # Authentication pages
│   ├── profile/           # User profile & API keys
│   ├── trash/             # Deleted files
│   └── payment-*/         # Payment flow pages
├── actions/               # Server Actions
│   ├── parse.ts           # Document parsing (Unstructured)
│   ├── generateSummary.ts # AI summaries (OpenAI)
│   ├── generateActions.ts # RAG response generation
│   ├── ragieActions.ts    # Ragie API operations
│   └── paymentActions.ts  # Stripe operations
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── auth/              # Firebase auth components
│   ├── table/             # DataTable (TanStack)
│   ├── grid/              # GridView layout
│   ├── chat/              # Q&A components
│   ├── landing/           # Landing page sections
│   └── common/            # Shared components
├── firebase/              # Firebase client & admin setup
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (ai, errors, logger)
├── services/              # Business logic (fileService)
├── types/                 # TypeScript definitions
├── utils/                 # Helper functions
└── zustand/               # State stores
```

## Architecture

### Authentication

Docubox uses Firebase Authentication with:

- Google OAuth sign-in
- Email/password authentication
- Magic link (passwordless) sign-in
- Session cookies for server-side auth

### State Management (Zustand)

- `useAuthStore` - Firebase auth state
- `useProfileStore` - User profile, API keys, credits
- `useModalStore` - Global modal state
- `useUploadStore` - File upload progress
- `useFileSelectionStore` - Selected file + parsed data
- `useNavigationStore` - Folder navigation, breadcrumbs

### File Operations

The `fileService` in `/src/services/fileService.ts` provides:

- File upload with progress tracking
- Soft delete (trash) and permanent delete
- Folder creation and recursive deletion
- Parsed data and summary storage
- Ragie integration status

### AI Pipeline

1. **Parse** - Unstructured API extracts text and structure
2. **Summarize** - OpenAI generates concise summaries
3. **Index** - Ragie stores document for retrieval
4. **Query** - RAG retrieves relevant chunks for Q&A

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Unstructured Documentation](https://docs.unstructured.io/)
- [Ragie Documentation](https://docs.ragie.ai/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your suggestions or improvements.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See [`LICENSE.md`](LICENSE.md).
