import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import { logger } from "@/lib/logger";

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
    logger.warn(
      "firebaseAdmin",
      "Missing required credentials. Need FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL"
    );
    return;
  }

  initializeApp({
    credential: cert({
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
  return getStorage().bucket();
}

function getAdminDb() {
  initializeAdmin();
  return getFirestore();
}

function getAdminAuth() {
  initializeAdmin();
  return getAuth();
}

// Export lazy getters
const adminBucket = {
  get file() {
    const bucket = getAdminBucket();
    return bucket.file.bind(bucket);
  },
  get upload() {
    const bucket = getAdminBucket();
    return bucket.upload.bind(bucket);
  },
  get delete() {
    const bucket = getAdminBucket();
    return bucket.delete.bind(bucket);
  },
};

const adminDb = new Proxy({} as Firestore, {
  get: (_, prop) => {
    const db = getAdminDb();
    const value = db[prop as keyof Firestore];
    return typeof value === "function" ? value.bind(db) : value;
  },
});

const adminAuth = new Proxy({} as Auth, {
  get: (_, prop) => {
    const auth = getAdminAuth();
    const value = auth[prop as keyof Auth];
    return typeof value === "function" ? value.bind(auth) : value;
  },
});

export { adminBucket, adminDb, adminAuth };
