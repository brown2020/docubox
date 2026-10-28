"use server";

import {
  parseAPIErrorResponse,
  extractErrorMessage,
  APIError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import {
  loadOwnedFileBytes,
  requireOwnedFile,
  withApiCredential,
  withRagieFileCredential,
} from "@/lib/api-access";
import { requireAuth } from "@/lib/server-auth";
import type { ApiRequest } from "@/types/api-request";

const BASE_URL = "https://api.ragie.ai";
const SERVICE_NAME = "Ragie API";

type Metadata = {
  [key: string]: string | number | boolean | string[];
};

type RagieFileUploadResponse = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  name: string;
  metadata: Metadata;
  chunk_count: number;
  external_id: string;
  partition: string;
};

/**
 * Makes an authenticated request to the Ragie API.
 */
async function ragieRequest(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    authorization: `Bearer ${apiKey}`,
    accept: "application/json",
    ...options.headers,
  };

  try {
    return await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      `Network error while contacting ${SERVICE_NAME}: ${extractErrorMessage(
        error
      )}`
    );
  }
}

/**
 * Checks the readiness status of a document in Ragie.
 * Returns the current status. Polling should be done client-side.
 */
export async function checkDocumentReadiness(
  ragieFileId: string,
  fileId: string,
  auth: ApiRequest
): Promise<{ ready: boolean; status: string }> {
  const { userId } = await requireAuth();
  const file = await requireOwnedFile(userId, fileId);
  if (!file.ragieFileId || file.ragieFileId !== ragieFileId) {
    throw new Error("File not found");
  }

  logger.debug("checkDocumentReadiness", { ragieFileId });

  const response = await withRagieFileCredential(
    userId,
    file,
    auth,
    (apiKey) => ragieRequest(`/documents/${ragieFileId}`, apiKey),
    { bill: false }
  );

  if (!response.ok) {
    const errorMessage = await parseAPIErrorResponse(response, SERVICE_NAME);
    logger.error("checkDocumentReadiness", "API error", {
      status: response.status,
    });
    throw new APIError(SERVICE_NAME, response.status, errorMessage);
  }

  const data = await response.json();
  logger.debug("checkDocumentReadiness", { status: data.status });

  if (data.status === "failed" || data.status === "error") {
    throw new Error(
      `Document processing failed in Ragie: ${
        data.error || data.message || "Unknown error"
      }`
    );
  }

  return { ready: data.status === "ready", status: data.status };
}

/**
 * Uploads a file to Ragie for processing.
 */
export async function uploadToRagie(
  fileId: string,
  auth: ApiRequest
): Promise<RagieFileUploadResponse> {
  const { userId } = await requireAuth();
  const { file, buffer } = await loadOwnedFileBytes(userId, fileId);
  const fileName = file.filename;
  const usePlatformKey = auth.useCredits === true;

  logger.debug("uploadToRagie", { fileId, fileName });

  const uploaded = await withApiCredential(
    userId,
    "ragie",
    auth,
    async (apiKey) => {
      const fileBlob = new Blob([new Uint8Array(buffer)]);
      const formData = new FormData();
      formData.append("file", fileBlob, fileName);
      formData.append(
        "metadata",
        JSON.stringify({ title: fileName, scope: fileId })
      );

      const response = await ragieRequest("/documents", apiKey, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorMessage = await parseAPIErrorResponse(response, SERVICE_NAME);
        logger.error("uploadToRagie", "Upload failed", { status: response.status });
        throw new APIError(SERVICE_NAME, response.status, errorMessage);
      }
      return (await response.json()) as RagieFileUploadResponse;
    }
  );
  logger.debug("uploadToRagie", {
    documentId: uploaded.id,
    status: uploaded.status,
  });

  await adminDb.doc(`users/${userId}/files/${fileId}`).update({
    isUploadedToRagie: true,
    ragieFileId: uploaded.id,
    ragieUsesPlatformKey: usePlatformKey,
    ragieIndexedAt: FieldValue.serverTimestamp(),
  });

  return uploaded;
}

interface ScoredChunk {
  text: string;
  score: number;
}

interface RetrievalResponse {
  scored_chunks: ScoredChunk[];
}

/**
 * Retrieves relevant chunks from Ragie for a query.
 * Throws on error for consistent error handling.
 */
export async function retrieveChunks(
  query: string,
  fileId: string,
  auth: ApiRequest
): Promise<RetrievalResponse> {
  const { userId } = await requireAuth();
  const file = await requireOwnedFile(userId, fileId);

  logger.debug("retrieveChunks", {
    query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
    fileId,
  });

  return withRagieFileCredential(userId, file, auth, async (apiKey) => {
    const response = await ragieRequest("/retrievals", apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        filter: { scope: file.id },
      }),
    });

    logger.debug("retrieveChunks", { status: response.status });

    if (!response.ok) {
      const errorMessage = await parseAPIErrorResponse(response, SERVICE_NAME);
      throw new APIError(SERVICE_NAME, response.status, errorMessage);
    }

    try {
      const data = await response.json();
      logger.debug("retrieveChunks", {
        chunkCount: data?.scored_chunks?.length || 0,
      });
      return data as RetrievalResponse;
    } catch {
      throw new Error("Failed to parse response from Ragie API.");
    }
  });
}

/**
 * Deletes a file from Ragie.
 */
export async function deleteFileFromRagie(
  ragieFileId: string,
  fileId: string,
  auth: ApiRequest
) {
  const { userId } = await requireAuth();
  const file = await requireOwnedFile(userId, fileId);
  if (!file.ragieFileId || file.ragieFileId !== ragieFileId) {
    throw new Error("File not found");
  }

  logger.debug("deleteFileFromRagie", { ragieFileId, fileId });

  const response = await withRagieFileCredential(
    userId,
    file,
    auth,
    (apiKey) =>
      ragieRequest(`/documents/${ragieFileId}`, apiKey, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }),
    { bill: false }
  );

  logger.debug("deleteFileFromRagie", { status: response.status });

  if (!response.ok) {
    const errorMessage = await parseAPIErrorResponse(response, SERVICE_NAME);
    throw new APIError(SERVICE_NAME, response.status, errorMessage);
  }

  // Handle 204 No Content (common for DELETE operations)
  if (response.status === 204) {
    logger.debug("deleteFileFromRagie", { action: "success", noContent: true });
    return { success: true, fileId: ragieFileId };
  }

  try {
    const data = await response.json();
    logger.debug("deleteFileFromRagie", { action: "success", data });
    return data;
  } catch {
    // Some DELETE endpoints return empty body on success
    return { success: true, fileId: ragieFileId };
  }
}
