/**
 * Shared utilities for Firebase Storage operations.
 * Consolidates file fetching logic used across the application.
 */

import { extractErrorMessage } from "./errors";
import { logger } from "./logger";

export interface FetchOptions {
  /** Return as Blob instead of ArrayBuffer */
  asBlob?: boolean;
  /** Context for logging */
  context?: string;
}

/**
 * Fetches a file from Firebase Storage and returns it as ArrayBuffer or Blob.
 * Used by parse.ts and ragieActions.ts for file processing.
 *
 * @param fileUrl - The Firebase Storage download URL
 * @param options - Optional configuration
 * @returns ArrayBuffer or Blob depending on options
 * @throws Error if fetch fails or file is empty
 */
export async function fetchFileFromStorage(
  fileUrl: string,
  options: FetchOptions = {}
): Promise<ArrayBuffer | Blob> {
  const { asBlob = false, context = "fetchFileFromStorage" } = options;

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

  if (asBlob) {
    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error(
        "The file appears to be empty. Please upload a valid file."
      );
    }

    logger.debug(context, {
      action: "fetchFileFromStorage",
      byteLength: blob.size,
      type: "blob",
    });

    return blob;
  }

  const buffer = await response.arrayBuffer();

  if (buffer.byteLength === 0) {
    throw new Error(
      "The file appears to be empty. Please upload a valid file."
    );
  }

  logger.debug(context, {
    action: "fetchFileFromStorage",
    byteLength: buffer.byteLength,
    type: "arrayBuffer",
  });

  return buffer;
}

/**
 * Fetches a file from storage and reads it as a stream into chunks.
 * Used for uploading to external services like Ragie.
 *
 * @param fileUrl - The Firebase Storage download URL
 * @param context - Logging context
 * @returns Object with blob and metadata
 */
export async function fetchFileAsBlob(
  fileUrl: string,
  context = "fetchFileAsBlob"
): Promise<{ blob: Blob; contentType: string }> {
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

  const fileStream = response.body;
  if (!fileStream) {
    throw new Error(
      "File stream is not available. The file may be empty or corrupted."
    );
  }

  // Read file into blob
  const reader = fileStream.getReader();
  const chunks: BlobPart[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalBytes += value.byteLength;
    }
  } catch (error) {
    throw new Error(`Error reading file: ${extractErrorMessage(error)}`);
  }

  if (totalBytes === 0) {
    throw new Error("Cannot process an empty file.");
  }

  const contentType =
    response.headers.get("content-type") || "application/octet-stream";

  logger.debug(context, {
    totalBytes,
    contentType,
  });

  const blob = new Blob(chunks, { type: contentType });

  return { blob, contentType };
}
