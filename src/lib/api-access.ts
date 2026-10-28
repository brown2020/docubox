import { adminBucket, adminDb } from "@/firebase/firebaseAdmin";
import {
  getAPIDisplayName,
  getEnvVarName,
  type APIType,
} from "@/constants/apiConfig";
import { getCreditCost } from "@/constants/credits";
import { logger } from "@/lib/logger";
import {
  assertOwnedObjectPath,
  firebaseDownloadUrl,
  ownedStorageObjectFromDownloadUrl,
} from "@/lib/storage-path";
import {
  isApiRequest,
  ragieKeyMode,
  selectApiKey,
  type ApiKeySource,
  type ApiRequest,
} from "@/types/api-request";
import { randomUUID } from "node:crypto";

const MAX_OBJECT_BYTES = 50 * 1024 * 1024;

export type OwnedFile = {
  id: string;
  filename: string;
  downloadUrl: string;
  type: string;
  deletedAt: unknown;
  ragieFileId: string | null;
  ragieUsesPlatformKey: boolean | null;
  shareToken: string | null;
};

function readFile(id: string, data: Record<string, unknown>): OwnedFile {
  return {
    id,
    filename: typeof data.filename === "string" && data.filename ? data.filename : "file",
    downloadUrl: typeof data.downloadUrl === "string" ? data.downloadUrl : "",
    type: typeof data.type === "string" ? data.type : "",
    deletedAt: data.deletedAt ?? null,
    ragieFileId: typeof data.ragieFileId === "string" ? data.ragieFileId : null,
    ragieUsesPlatformKey:
      typeof data.ragieUsesPlatformKey === "boolean" ? data.ragieUsesPlatformKey : null,
    shareToken: typeof data.shareToken === "string" ? data.shareToken : null,
  };
}

export function assertFileId(fileId: string): string {
  if (!fileId || fileId.length > 128 || /[/\\.]/.test(fileId)) {
    throw new Error("Invalid file");
  }
  return fileId;
}

export async function requireOwnedFile(userId: string, fileId: string): Promise<OwnedFile> {
  const id = assertFileId(fileId);
  const snap = await adminDb.doc(`users/${userId}/files/${id}`).get();
  if (!snap.exists) throw new Error("File not found");
  const data = snap.data();
  if (!data) throw new Error("File not found");
  return readFile(id, data as Record<string, unknown>);
}

export async function loadOwnedFileBytes(userId: string, fileId: string): Promise<{
  file: OwnedFile;
  buffer: Buffer;
}> {
  const file = await requireOwnedFile(userId, fileId);
  if (!file.downloadUrl) {
    throw new Error("File URL is required for upload.");
  }

  const object = ownedStorageObjectFromDownloadUrl(file.downloadUrl, userId);
  const bucketFile = adminBucket.file(object.path);
  const [metadata] = await bucketFile.getMetadata();
  const size = Number(metadata.size ?? 0);
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error("The file appears to be empty. Please upload a valid file.");
  }
  if (size > MAX_OBJECT_BYTES) {
    throw new Error("File is too large to process.");
  }

  const [buffer] = await bucketFile.download();
  return { file, buffer };
}

/**
 * Downloads parsed-chunk JSON only from the caller's unstructured prefix.
 * Storage paths and legacy signed URLs are both resolved through the Admin SDK.
 */
export async function downloadOwnedUnstructuredJson(userId: string, ref: string): Promise<unknown> {
  const path = ref.startsWith("https://") || ref.startsWith("http://")
    ? ownedStorageObjectFromDownloadUrl(ref, userId).path
    : assertOwnedObjectPath(ref, userId);
  const ownedPath = assertOwnedObjectPath(path, userId, `users/${userId}/unstructured/`);
  const [contents] = await adminBucket.file(ownedPath).download();
  return JSON.parse(contents.toString("utf-8")) as unknown;
}

export async function rotateOwnedDownloadUrl(
  userId: string,
  downloadUrl: string
): Promise<string> {
  const object = ownedStorageObjectFromDownloadUrl(downloadUrl, userId);
  const bucketFile = adminBucket.file(object.path);
  const token = randomUUID();
  const [metadata] = await bucketFile.getMetadata();
  const existing =
    metadata.metadata && typeof metadata.metadata === "object" ? metadata.metadata : {};
  await bucketFile.setMetadata({
    metadata: {
      ...existing,
      firebaseStorageDownloadTokens: token,
    },
  });
  return firebaseDownloadUrl(object.bucket, object.path, token);
}

function assertRequest(auth: unknown): ApiRequest {
  if (!isApiRequest(auth)) {
    throw new Error("Invalid API request");
  }
  return auth;
}

async function debitCredits(userId: string, amount: number): Promise<void> {
  const ref = adminDb.doc(`users/${userId}/profile/userData`);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const credits = snap.exists ? snap.get("credits") : 0;
    if (typeof credits !== "number" || credits < amount) {
      throw new Error(
        `Insufficient credits. You need ${amount} credits but only have ${typeof credits === "number" ? credits : 0}.`
      );
    }
    tx.update(ref, { credits: credits - amount });
  });
}

async function refundCredits(userId: string, amount: number): Promise<void> {
  const ref = adminDb.doc(`users/${userId}/profile/userData`);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current =
      snap.exists && typeof snap.get("credits") === "number" ? snap.get("credits") : 0;
    if (snap.exists) {
      tx.update(ref, { credits: current + amount });
      return;
    }
    tx.set(ref, { credits: current + amount, email: "", useCredits: true }, { merge: true });
  });
}

/**
 * Runs `run` with either the platform key or the caller's own key.
 * Platform keys stay on the server. Credits are debited before the call and
 * refunded if it throws. `userApiKey` is ignored whenever the source is platform.
 */
export async function withApiCredential<T>(
  userId: string,
  apiType: APIType,
  auth: unknown,
  run: (apiKey: string) => Promise<T>,
  options?: { bill?: boolean; force?: ApiKeySource }
): Promise<T> {
  const request = assertRequest(auth);
  const selected = selectApiKey({
    useCredits: request.useCredits,
    userApiKey: request.userApiKey,
    platformKey: process.env[getEnvVarName(apiType)],
    force: options?.force,
  });

  if (selected.source !== "platform" || options?.bill === false) {
    return run(selected.apiKey);
  }

  const cost = getCreditCost(apiType);
  if (!Number.isInteger(cost) || cost <= 0) {
    throw new Error(`Credit cost for ${getAPIDisplayName(apiType)} is not configured.`);
  }

  await debitCredits(userId, cost);
  try {
    return await run(selected.apiKey);
  } catch (error) {
    try {
      await refundCredits(userId, cost);
    } catch (refundError) {
      logger.error("api-access", "Failed to refund credits", refundError);
    }
    throw error;
  }
}

/** Uses the Ragie key that indexed this file, not whichever key the browser prefers. */
export async function withRagieFileCredential<T>(
  userId: string,
  file: { ragieUsesPlatformKey: boolean | null },
  auth: unknown,
  run: (apiKey: string) => Promise<T>,
  options?: { bill?: boolean }
): Promise<T> {
  const request = assertRequest(auth);
  const force = ragieKeyMode(file.ragieUsesPlatformKey, request.useCredits);
  return withApiCredential(userId, "ragie", request, run, {
    bill: options?.bill,
    force,
  });
}
