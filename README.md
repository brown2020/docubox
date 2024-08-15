# Docbox

Docbox is a modern file storage and management application built with [Next.js 14](https://nextjs.org/), [Firebase](https://firebase.google.com/), and [Clerk](https://clerk.dev/) for authentication. Inspired by a tutorial from Sonny Sangha, this project emulates the core functionalities of Dropbox, enabling users to upload, manage, and store files securely. It features a responsive and intuitive interface powered by [Shadcn UI](https://shadcn.dev/) components and [Tailwind CSS](https://tailwindcss.com/).

## Features

- **File Management:** Upload, rename, and delete files seamlessly.
- **Firebase Integration:** Utilizes [Firebase Firestore](https://firebase.google.com/docs/firestore) for metadata and [Firebase Storage](https://firebase.google.com/docs/storage) for files.
- **User Authentication:** Secure login and session management with [Clerk](https://clerk.dev/).
- **Responsive Design:** [Tailwind CSS](https://tailwindcss.com/) ensures an adaptable layout for all devices.
- **State Management:** Lightweight state management using [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction).
- **Drag-and-Drop:** Simplified file uploads with [React Dropzone](https://react-dropzone.js.org/).

## Technologies Used

- **[Next.js 14](https://nextjs.org/):** Cutting-edge web framework with App Router support.
- **[Firebase](https://firebase.google.com/):** Firestore and Storage for backend services.
- **[Clerk](https://clerk.dev/):** Authentication and session management.
- **[Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction):** Efficient state management for React applications.
- **[Shadcn UI](https://shadcn.dev/):** Modern, cohesive UI elements.
- **[Tailwind CSS](https://tailwindcss.com/):** Utility-first styling for a responsive design.
- **[React Dropzone](https://react-dropzone.js.org/):** Simplifies drag-and-drop file uploads.
- **[Radix UI](https://www.radix-ui.com/):** Accessible UI components for React (used via `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`).
- **[Lucide React](https://lucide.dev/):** Beautiful & consistent icons for React.
- **[React File Icon](https://www.npmjs.com/package/react-file-icon):** File type icons for React.
- **[React Hot Toast](https://react-hot-toast.com/):** Toast notifications for React.
- **[Tailwind Merge](https://github.com/dcastil/tailwind-merge):** Utility to merge Tailwind CSS classes.
- **[Class Variance Authority](https://github.com/joe-bell/cva):** Utility for variant-driven component styling.
- **[Pretty Bytes](https://www.npmjs.com/package/pretty-bytes):** Convert bytes to a human readable string.
- **[TanStack React Table](https://tanstack.com/table/v8/docs/guide/introduction):** Headless UI for building tables and data grids.

## Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/):** Install the latest version.
- **[Firebase Project](https://firebase.google.com/):** Set up Firebase with Firestore and Storage enabled.
- **[Clerk Account](https://clerk.dev/):** Create an account on Clerk for authentication.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/docbox.git
   cd docbox
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

This project is licensed under the MIT License.
