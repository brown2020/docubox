# Docubox

Docubox is a modern file storage and management application built with [Next.js](https://nextjs.org/) (v16), [Firebase](https://firebase.google.com/), and [Clerk](https://clerk.dev/) for authentication. It emulates core Dropbox-style workflows (upload, organize, rename, delete) with a responsive UI powered by [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) (v4).

## Features

- **File Management:** Upload, rename, and delete files seamlessly.
- **Firebase Integration:** Utilizes [Firebase Firestore](https://firebase.google.com/docs/firestore) for metadata and [Firebase Storage](https://firebase.google.com/docs/storage) for files.
- **User Authentication:** Secure login and session management with [Clerk](https://clerk.dev/).
- **Responsive Design:** [Tailwind CSS](https://tailwindcss.com/) ensures an adaptable layout for all devices.
- **State Management:** Lightweight state management using [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction).
- **Drag-and-Drop:** Simplified file uploads with [React Dropzone](https://react-dropzone.js.org/).

## Technologies Used

- **[Next.js](https://nextjs.org/) (v16.0.3)**: App Router, React Server Components.
- **[React](https://react.dev/) (v19.0.0)** / **React DOM (v19.0.0)**: UI runtime.
- **[Tailwind CSS](https://tailwindcss.com/) (v4.0.8)** + **[tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate) (v1.0.7)**: Styling & animation utilities.
- **[shadcn/ui](https://ui.shadcn.com/)** + **[Radix UI](https://www.radix-ui.com/)**: Accessible primitives (Dialog, Dropdown, Tabs, Tooltip, Avatar, Progress).
- **[Firebase](https://firebase.google.com/) (v12.2.1)** + **firebase-admin (v13.0.1)**: Firestore + Storage + server-side admin.
- **[Clerk](https://clerk.dev/) (v6.0.2)**: Authentication and session management.
- **[Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (v5.0.1)**: Client-side state.
- **[TanStack React Table](https://tanstack.com/table/v8) (v8.20.5)**: Data tables.
- **[Stripe](https://stripe.com/) (stripe v20.0.0, @stripe/stripe-js v8.5.2, @stripe/react-stripe-js v5.4.0)**: Payments.
- **[Vercel AI SDK](https://sdk.vercel.ai/docs) (ai v6.0.3, @ai-sdk/openai v3.0.1, @ai-sdk/rsc v2.0.3)**: AI integrations/streaming.
- **[React Dropzone](https://react-dropzone.js.org/) (v14.2.3)**: Drag-and-drop file uploads.
- **[Lucide React](https://lucide.dev/) (v0.562.0)**: Icons.
- **[react-hot-toast](https://react-hot-toast.com/) (v2.4.1)**: Toast notifications.
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge) (v3.0.2)** + **[class-variance-authority](https://github.com/joe-bell/cva) (v0.7.0)** + **clsx (v2.1.1)**: Styling helpers.
- **[pretty-bytes](https://www.npmjs.com/package/pretty-bytes) (v7.0.1)**: Human-readable file sizes.

## Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/):** v18+ (required by dependencies in `package-lock.json`).
- **[Firebase Project](https://firebase.google.com/):** Set up Firebase with Firestore and Storage enabled.
- **[Clerk Account](https://clerk.dev/):** Create an account on Clerk for authentication.

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

   - Copy `.env.example` to `.env.local`.
   - Replace placeholders with your Firebase and Clerk API keys.

### Running the Development Server

Start the server:

```bash
npm run dev
```

Visit the app at `http://localhost:3000`.

### Usage

1. **Sign Up/Login:** Authenticate through Clerk.
2. **Manage Files:** Upload, rename, and delete files via the dashboard.

## Environment Variables

Set up your `.env.local` file with the following keys:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_firebase_app_id
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Zustand Documentation](https://docs.pmnd.rs)
- [Shadcn UI Documentation](https://shadcn.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Lucide React Documentation](https://lucide.dev/docs/lucide-react)
- [React Dropzone Documentation](https://react-dropzone.js.org/)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your suggestions or improvements.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See [`LICENSE.md`](LICENSE.md).
