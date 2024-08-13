````markdown
# Docbox

Docbox is a modern file storage and management application built with Next.js 14, Firebase, and Clerk for authentication. The project emulates the core functionalities of Dropbox, enabling users to upload, manage, and store files securely. It features a responsive and intuitive interface powered by Shadcn UI components and Tailwind CSS.

## Features

- **File Management:** Upload, rename, and delete files seamlessly.
- **Firebase Integration:** Utilizes Firebase Firestore for metadata and Firebase Storage for files.
- **User Authentication:** Secure login and session management with Clerk.
- **Responsive Design:** Tailwind CSS ensures an adaptable layout for all devices.
- **State Management:** Lightweight state management using Zustand.
- **Drag-and-Drop:** Simplified file uploads with React Dropzone.

## Technologies Used

- **Next.js 14:** Cutting-edge web framework with App Router support.
- **Firebase:** Firestore and Storage for backend services.
- **Clerk:** Authentication and session management.
- **Zustand:** Efficient state management for React applications.
- **Shadcn UI Components:** Modern, cohesive UI elements.
- **Tailwind CSS:** Utility-first styling for a responsive design.
- **React Dropzone:** Simplifies drag-and-drop file uploads.

## Getting Started

### Prerequisites

- **Node.js**: Install the latest version.
- **Firebase Project**: Set up Firebase with Firestore and Storage enabled.
- **Clerk Account**: Create an account on Clerk for authentication.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/docbox.git
   cd docbox
   ```
````

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

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your suggestions or improvements.

## License

This project is licensed under the MIT License.

```

```
