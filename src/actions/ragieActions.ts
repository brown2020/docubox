"use server";

import {
  parseAPIErrorResponse,
  extractErrorMessage,
  APIError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { fetchFileAsBlob } from "@/lib/storage";

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
 * Polls the Ragie API until a document is ready for querying.
 */
export async function checkDocumentReadiness(
  ragieFileId: string,
  ragieApiKey: string,
  interval = 3000,
  maxAttempts = 60
): Promise<boolean> {
  const apiKey = validateApiKey(ragieApiKey, "checkDocumentReadiness");

  logger.debug("checkDocumentReadiness", {
    ragieFileId,
    interval,
    maxAttempts,
  });

  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    const response = await ragieRequest(`/documents/${ragieFileId}`, apiKey);

    if (!response.ok) {
      const errorMessage = await parseAPIErrorResponse(response, SERVICE_NAME);
      logger.error("checkDocumentReadiness", "API error", {
        status: response.status,
        attempt: attempts,
      });
      throw new APIError(SERVICE_NAME, response.status, errorMessage);
    }

    const data = await response.json();
    logger.debug("checkDocumentReadiness", {
      status: data.status,
      attempt: attempts,
    });

    if (data.status === "ready") {
      logger.debug("checkDocumentReadiness", { action: "documentReady" });
      return true;
    }

    if (data.status === "failed" || data.status === "error") {
      throw new Error(
        `Document processing failed in Ragie: ${
          data.error || data.message || "Unknown error"
        }`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(
    "Timeout waiting for document to be processed by Ragie. Please try again or check your Ragie dashboard."
  );
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

/**
 * Retrieves relevant chunks from Ragie for a query.
 */
export async function retrieveChunks(
  query: string,
  fileId: string,
  ragieApiKey?: string
) {
  const apiKey = ragieApiKey || process.env.RAGIE_API_KEY || "";

  logger.debug("retrieveChunks", {
    query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
    fileId,
    hasApiKey: !!apiKey,
  });

  if (!apiKey) {
    return {
      error: true,
      status: 0,
      message: `${SERVICE_NAME} key is required. Please add your API key in profile settings or set RAGIE_API_KEY in your environment.`,
    } as const;
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
    return {
      error: true,
      status: response.status,
      message: errorMessage,
    } as const;
  }

  try {
    const data = await response.json();
    logger.debug("retrieveChunks", {
      chunkCount: data?.scored_chunks?.length || data?.chunks?.length || 0,
    });
    return data;
  } catch {
    return {
      error: true,
      status: response.status,
      message: "Failed to parse response from Ragie API.",
    } as const;
  }
}

/**
 * Deletes a file from Ragie.
 */
export async function deleteFileFromRagie(
  fileId: string,
  ragieApiKey?: string
) {
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
