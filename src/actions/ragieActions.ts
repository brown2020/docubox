"use server";

import {
  parseAPIErrorResponse,
  extractErrorMessage,
  APIError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { fetchFileAsBlob } from "@/lib/storage";
import { requireAuth } from "@/lib/server-auth";

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
 * Validates that the API key is present.
 */
function validateApiKey(apiKey: string | undefined, action: string): string {
  if (!apiKey) {
    logger.error("ragieActions", `Missing API key for ${action}`);
    throw new Error(
      `${SERVICE_NAME} key is required. Please add your API key in profile settings.`
    );
  }
  return apiKey;
}

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
  ragieApiKey: string
): Promise<{ ready: boolean; status: string }> {
  await requireAuth();
  const apiKey = validateApiKey(ragieApiKey, "checkDocumentReadiness");

  logger.debug("checkDocumentReadiness", { ragieFileId });

  const response = await ragieRequest(`/documents/${ragieFileId}`, apiKey);

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
  fileUrl: string,
  fileName: string,
  ragieApiKey: string
): Promise<RagieFileUploadResponse> {
  await requireAuth();
  const apiKey = validateApiKey(ragieApiKey, "uploadToRagie");

  if (!fileUrl) {
    throw new Error("File URL is required for upload.");
  }

  logger.debug("uploadToRagie", { fileId, fileName });

  // Fetch file from storage using shared utility
  const { blob: fileBlob } = await fetchFileAsBlob(fileUrl, "uploadToRagie");

  const formData = new FormData();
  formData.append("file", fileBlob, fileName);
  formData.append(
    "metadata",
    JSON.stringify({ title: fileName, scope: fileId })
  );

  // Upload to Ragie
  const response = await ragieRequest("/documents", apiKey, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorMessage = await parseAPIErrorResponse(response, SERVICE_NAME);
    logger.error("uploadToRagie", "Upload failed", { status: response.status });
    throw new APIError(SERVICE_NAME, response.status, errorMessage);
  }

  const result = await response.json();
  logger.debug("uploadToRagie", {
    documentId: result.id,
    status: result.status,
  });

  return result;
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
  ragieApiKey?: string
): Promise<RetrievalResponse> {
  await requireAuth();
  const apiKey = ragieApiKey || process.env.RAGIE_API_KEY;

  logger.debug("retrieveChunks", {
    query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
    fileId,
    hasApiKey: !!apiKey,
  });

  if (!apiKey) {
    throw new Error(
      `${SERVICE_NAME} key is required. Please add your API key in profile settings or set RAGIE_API_KEY in your environment.`
    );
  }

  const response = await ragieRequest("/retrievals", apiKey, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      filter: { scope: fileId },
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
}

/**
 * Deletes a file from Ragie.
 */
export async function deleteFileFromRagie(
  fileId: string,
  ragieApiKey?: string
) {
  await requireAuth();
  const apiKey = ragieApiKey || process.env.RAGIE_API_KEY;

  logger.debug("deleteFileFromRagie", { fileId, hasApiKey: !!apiKey });

  if (!apiKey) {
    throw new Error(
      `${SERVICE_NAME} key is required. Please add your API key in profile settings or set RAGIE_API_KEY in your environment.`
    );
  }

  const response = await ragieRequest(`/documents/${fileId}`, apiKey, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  logger.debug("deleteFileFromRagie", { status: response.status });

  if (!response.ok) {
    const errorMessage = await parseAPIErrorResponse(response, SERVICE_NAME);
    throw new APIError(SERVICE_NAME, response.status, errorMessage);
  }

  // Handle 204 No Content (common for DELETE operations)
  if (response.status === 204) {
    logger.debug("deleteFileFromRagie", { action: "success", noContent: true });
    return { success: true, fileId };
  }

  try {
    const data = await response.json();
    logger.debug("deleteFileFromRagie", { action: "success", data });
    return data;
  } catch {
    // Some DELETE endpoints return empty body on success
    return { success: true, fileId };
  }
}
