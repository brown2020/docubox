"use server";

import { Element, Chunk } from "@/types/types";
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared/index.js";
import { extractErrorMessage, getHttpErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";

const SERVICE_NAME = "Unstructured API";

/**
 * Fetches a file from Firebase Storage and returns it as an ArrayBuffer.
 */
async function fetchFileFromStorage(fileUrl: string): Promise<ArrayBuffer> {
  let response: Response;

  try {
    response = await fetch(fileUrl);
  } catch (error) {
    throw new Error(
      `Network error while fetching file: ${extractErrorMessage(error)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch file from storage: ${response.status} ${response.statusText}`
    );
  }

  const buffer = await response.arrayBuffer();

  if (buffer.byteLength === 0) {
    throw new Error(
      "The file appears to be empty. Please upload a valid file."
    );
  }

  logger.debug("parseFile", {
    action: "fetchFileFromStorage",
    byteLength: buffer.byteLength,
  });

  return buffer;
}

/**
 * Parses the Unstructured API response into an array of Elements.
 */
function parseResponseToElements(response: unknown): Element[] {
  if (typeof response === "string") {
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) return parsed;
      if (parsed?.elements && Array.isArray(parsed.elements))
        return parsed.elements;
    } catch {
      logger.warn("parseFile", "Could not parse response as JSON string");
    }
    return [];
  }

  if (response && typeof response === "object") {
    const obj = response as Record<string, unknown>;

    // Check for error response
    if (obj.statusCode && obj.statusCode !== 200) {
      const errorDetail =
        obj.body || obj.message || obj.detail || "Unknown API error";
      throw new Error(
        `${SERVICE_NAME} error (${obj.statusCode}): ${errorDetail}`
      );
    }

    if (Array.isArray(obj.elements)) return obj.elements as Element[];
    if (Array.isArray(response)) return response as Element[];
  }

  return [];
}

/**
 * Organizes elements into chunks based on headings.
 */
function chunkElements(elements: Element[]): Chunk[] {
  const chunks: Chunk[] = [];
  let currentChunk: Element[] = [];
  let currentHeading: string | null = null;

  for (const element of elements) {
    if (element.type === "Heading") {
      if (currentChunk.length > 0) {
        chunks.push({ heading: currentHeading, content: currentChunk });
      }
      currentChunk = [];
      currentHeading = element.text || null;
    } else {
      currentChunk.push(element);
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({ heading: currentHeading, content: currentChunk });
  }

  return chunks;
}

/**
 * Creates the Unstructured client with authentication.
 */
function createUnstructuredClient(
  apiKey: string,
  apiURL: string
): UnstructuredClient {
  return new UnstructuredClient({
    security: { apiKeyAuth: apiKey },
    serverURL: apiURL,
  });
}

/**
 * Maps common error patterns to user-friendly messages.
 */
function mapErrorToUserFriendly(errorMsg: string): string {
  const lowerMsg = errorMsg.toLowerCase();

  if (lowerMsg.includes("401") || lowerMsg.includes("unauthorized")) {
    return `${SERVICE_NAME} authentication failed. Please verify your API key is correct.`;
  }
  if (lowerMsg.includes("403") || lowerMsg.includes("forbidden")) {
    return `${SERVICE_NAME} access denied. Your API key may not have the required permissions.`;
  }
  if (lowerMsg.includes("402") || lowerMsg.includes("payment")) {
    return `${SERVICE_NAME} payment required. Please check your account billing status.`;
  }
  if (lowerMsg.includes("429") || lowerMsg.includes("rate limit")) {
    return `${SERVICE_NAME} rate limit exceeded. Please wait a moment and try again.`;
  }
  if (lowerMsg.includes("500") || lowerMsg.includes("internal server")) {
    return `${SERVICE_NAME} server error. The service may be temporarily unavailable.`;
  }

  return errorMsg;
}

/**
 * Parses a file using the Unstructured API.
 *
 * @param fileUrl - URL of the file in Firebase Storage
 * @param fileName - Name of the file
 * @param apiKey - Unstructured API key
 * @param isHighRes - Whether to use high-resolution parsing strategy
 * @returns Array of parsed chunks
 */
export async function parseFile(
  fileUrl: string,
  fileName: string,
  apiKey: string,
  isHighRes = false
): Promise<Chunk[]> {
  // Validate inputs
  if (!apiKey) {
    throw new Error(
      "Unstructured API key is required. Please add your API key in profile settings."
    );
  }

  const apiURL = process.env.UNSTRUCTURED_API_URL;
  if (!apiURL) {
    throw new Error(
      "Unstructured API URL is not configured. Please set UNSTRUCTURED_API_URL in your environment."
    );
  }

  logger.debug("parseFile", { fileName, isHighRes, apiURL });

  // Fetch file from storage
  const fileBuffer = await fetchFileFromStorage(fileUrl);

  // Create client and parse
  const client = createUnstructuredClient(apiKey, apiURL);

  try {
    logger.debug("parseFile", { action: "sendingToAPI" });

    const response = await client.general.partition({
      partitionParameters: {
        files: {
          content: fileBuffer,
          fileName,
        },
        strategy: isHighRes ? Strategy.HiRes : Strategy.Auto,
        splitPdfPage: true,
        splitPdfAllowFailed: true,
        splitPdfConcurrencyLevel: 10,
      },
    });

    const elements = parseResponseToElements(response);

    if (elements.length === 0) {
      throw new Error(
        "No content could be extracted from the file. The file may be empty or in an unsupported format."
      );
    }

    const chunks = chunkElements(elements);

    logger.debug("parseFile", {
      action: "success",
      elementCount: elements.length,
      chunkCount: chunks.length,
    });

    return chunks;
  } catch (error) {
    // Re-throw our custom errors as-is
    if (error instanceof Error) {
      if (
        error.message.startsWith(SERVICE_NAME) ||
        error.message.startsWith("No content") ||
        error.message.startsWith("Failed to parse")
      ) {
        throw error;
      }
    }

    const errorMsg = extractErrorMessage(error);
    logger.error("parseFile", "Unexpected error during parsing", {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(
      `Error processing file: ${mapErrorToUserFriendly(errorMsg)}`
    );
  }
}
