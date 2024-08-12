Here's the updated README.md for your `Docbox` project, including the information about Shadcn components and Tailwind CSS:

---

# Docbox

**Docbox** is a file storage and management application built with Next.js 14, Firebase, and Clerk for authentication. This project demonstrates how to create an app similar to Dropbox, with integrated user authentication, file uploads, and storage using Firebase. The app leverages Shadcn UI components and Tailwind CSS for a modern and responsive user interface.

## Features

- **File Upload and Management**: Users can upload, rename, and delete files directly in the app.
- **Firebase Integration**: Utilizes Firebase Firestore for storing file metadata and Firebase Storage for storing file data.
- **Clerk Authentication**: Seamless integration with Clerk for user authentication, ensuring secure access to files.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS, optimized for both desktop and mobile devices.
- **Zustand State Management**: Lightweight state management using Zustand for managing application state, including modal visibility, file details, and user actions.
- **Shadcn Components**: Utilizes Shadcn UI components for a sleek and consistent user interface.

## Technologies Used

- **Next.js 14**: The latest version of Next.js with the App Router.
- **Firebase**: Used for both Firestore (database) and Firebase Storage.
- **Clerk**: Handles user authentication and session management.
- **Zustand**: Simple and scalable state management for React.
- **Shadcn UI Components**: For building a modern and cohesive user interface.
- **Tailwind CSS**: For utility-first styling and responsive design.
- **React Dropzone**: For file drag-and-drop functionality.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Firebase Project**: Set up a Firebase project and enable Firestore and Firebase Storage.
- **Clerk Account**: Set up a Clerk account to handle user authentication.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/docbox.git
   cd docbox
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy the `.env.example` file to `.env.local`.
   - Replace placeholder values with your actual API keys and configuration details:

     ```env
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
     CLERK_SECRET_KEY=your_clerk_secret_key

     NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
     NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECTID=your_firebase_project_id
     NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APPID=your_firebase_app_id
     ```

### Running the Development Server

Start the development server with the following command:

```bash
npm run dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

### Usage

1. **Authentication**: Sign up or log in through Clerk to access your files.
2. **File Management**: Upload files using the drag-and-drop interface. Once uploaded, files can be renamed or deleted.
3. **Dashboard**: View and manage all your uploaded files from the dashboard.

## Environment Variables

Ensure your `.env.local` file includes all necessary API keys and configuration settings:

- **Clerk API Keys**: For handling user authentication.
- **Firebase Configuration**: For connecting to Firebase Firestore and Firebase Storage.

### Example `.env.local` Configuration

```env
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

To dive deeper into the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Shadcn UI Documentation](https://shadcn.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Contributing

Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

---

This README now includes references to Shadcn components and Tailwind CSS, providing a full overview of the `Docbox` project.
