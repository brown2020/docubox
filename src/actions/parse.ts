"use server";

import { Chunk } from "@/types/types";
import { logger } from "@/lib/logger";
import { loadOwnedFileBytes, withApiCredential } from "@/lib/api-access";
import { requireAuth } from "@/lib/server-auth";
import {
  assertSupportedParseFile,
  parseDocumentWithTransform,
  resolveTransformBaseUrl,
} from "@/lib/unstructured-transform";
import type { ApiRequest } from "@/types/api-request";

export type ParseFileResult =
  | { ok: true; chunks: Chunk[] }
  | { ok: false; message: string };

/**
 * Parses a file the caller owns with the Unstructured Transform API.
 * Bytes are read with the Admin SDK from that user's storage object.
 * Expected failures are returned so production does not redact them as a 500.
 */
export async function parseFile(
  fileId: string,
  auth: ApiRequest,
  isHighRes = false
): Promise<ParseFileResult> {
  try {
    const { userId } = await requireAuth();
    const { file, buffer } = await loadOwnedFileBytes(userId, fileId);
    const fileName = assertSupportedParseFile(file.filename, file.type);
    const baseUrl = resolveTransformBaseUrl(process.env.UNSTRUCTURED_API_URL);

    logger.debug("parseFile", { fileName, isHighRes, baseUrl });

    const chunks = await withApiCredential(userId, "unstructured", auth, async (apiKey) =>
      parseDocumentWithTransform({
        apiKey,
        baseUrl,
        fileName,
        mimeType: file.type,
        bytes: new Uint8Array(buffer),
        isHighRes,
      })
    );
    return { ok: true, chunks };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unstructured API could not parse this file. Please try again.";
    logger.error("parseFile", "Parse failed", { name: error instanceof Error ? error.name : "unknown" });
    return { ok: false, message };
  }
}
