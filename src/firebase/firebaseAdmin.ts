import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

/**
 * Initialize Firebase Admin lazily to avoid build-time errors
 * when environment variables are not available.
 */
function initializeAdmin() {
  if (getApps().length > 0) {
    return;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    console.warn("Firebase Admin: FIREBASE_PRIVATE_KEY not set, skipping initialization");
    return;
  }

  const adminCredentials = {
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    clientCertsUrl: process.env.FIREBASE_CLIENT_CERTS_URL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(adminCredentials),
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
