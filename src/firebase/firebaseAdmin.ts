import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

/**
 * Initialize Firebase Admin lazily to avoid build-time errors
 * when environment variables are not available.
 *
 * Only 3 credentials are required:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_PRIVATE_KEY
 * - FIREBASE_CLIENT_EMAIL
 */
function initializeAdmin() {
  if (getApps().length > 0) {
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn(
      "Firebase Admin: Missing required credentials. Need FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL"
    );
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      clientEmail,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  });
}

// Lazy getters to ensure initialization happens when needed
function getAdminBucket() {
  initializeAdmin();
  return admin.storage().bucket();
}

function getAdminDb() {
  initializeAdmin();
  return admin.firestore();
}

function getAdminAuth() {
  initializeAdmin();
  return admin.auth();
}

// Export lazy getters
const adminBucket = {
  get file() {
    return getAdminBucket().file.bind(getAdminBucket());
  },
  get upload() {
    return getAdminBucket().upload.bind(getAdminBucket());
  },
  get delete() {
    return getAdminBucket().delete.bind(getAdminBucket());
  },
};

const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get: (_, prop) => {
    const db = getAdminDb();
    const value = db[prop as keyof admin.firestore.Firestore];
    return typeof value === "function" ? value.bind(db) : value;
  },
});

const adminAuth = new Proxy({} as admin.auth.Auth, {
  get: (_, prop) => {
    const auth = getAdminAuth();
    const value = auth[prop as keyof admin.auth.Auth];
    return typeof value === "function" ? value.bind(auth) : value;
  },
});

export { adminBucket, adminDb, adminAuth, admin };
