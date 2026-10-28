const FIREBASE_STORAGE_HOST = "firebasestorage.googleapis.com";
const GCS_HOST = "storage.googleapis.com";

export type OwnedStorageObject = {
  bucket: string;
  path: string;
};

function normalizeObjectPath(objectPath: string): string {
  if (objectPath.includes("\\") || objectPath.includes("\0")) {
    throw new Error("Invalid storage path");
  }

  const parts: string[] = [];
  for (const segment of objectPath.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      throw new Error("Invalid storage path");
    }
    parts.push(segment);
  }

  if (parts.length === 0) {
    throw new Error("Invalid storage path");
  }

  return parts.join("/");
}

export function assertOwnedObjectPath(
  objectPath: string,
  userId: string,
  requiredPrefix?: string
): string {
  if (!userId || userId.includes("/") || userId.includes("..") || userId.includes("\\")) {
    throw new Error("Invalid storage path");
  }

  const normalized = normalizeObjectPath(objectPath);
  const prefix = requiredPrefix ?? `users/${userId}/`;
  if (!normalized.startsWith(prefix)) {
    throw new Error("Invalid storage path");
  }

  return normalized;
}

/**
 * Resolves a Firebase/GCS download URL to an object owned by `userId`.
 * Rejects any other host so server actions cannot be used as a generic fetch proxy.
 */
export function ownedStorageObjectFromDownloadUrl(
  downloadUrl: string,
  userId: string
): OwnedStorageObject {
  let url: URL;
  try {
    url = new URL(downloadUrl);
  } catch {
    throw new Error("Invalid storage URL");
  }

  if (url.protocol !== "https:") {
    throw new Error("Invalid storage URL");
  }

  let bucket = "";
  let objectPath = "";

  if (url.hostname === FIREBASE_STORAGE_HOST) {
    const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
    if (!match) throw new Error("Invalid storage URL");
    bucket = decodeURIComponent(match[1]);
    objectPath = decodeURIComponent(match[2]);
  } else if (url.hostname === GCS_HOST) {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) throw new Error("Invalid storage URL");
    bucket = decodeURIComponent(segments[0]);
    objectPath = decodeURIComponent(segments.slice(1).join("/"));
  } else {
    throw new Error("Invalid storage URL");
  }

  const expectedBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET;
  if (expectedBucket && bucket !== expectedBucket) {
    throw new Error("Invalid storage URL");
  }

  return {
    bucket,
    path: assertOwnedObjectPath(objectPath, userId),
  };
}

export function safeFileSegment(name: string): string {
  const base = name.split("/").pop()?.split("\\").pop()?.trim() ?? "";
  if (!base || base === "." || base === ".." || base.includes("\0")) {
    throw new Error("Invalid file name");
  }
  return base;
}

export function firebaseDownloadUrl(bucket: string, objectPath: string, token: string): string {
  return `https://${FIREBASE_STORAGE_HOST}/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`;
}
