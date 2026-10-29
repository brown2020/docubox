"use server";

import { Chunk } from "@/types/types";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { loadOwnedFileBytes, withApiCredential } from "@/lib/api-access";
import { requireAuth } from "@/lib/server-auth";
import {
  assertSupportedParseFile,
  parseDocumentWithTransform,
  resolveTransformBaseUrl,
} from "@/lib/unstructured-transform";
import type { ApiRequest } from "@/types/api-request";

/**
 * Parses a file the caller owns with the Unstructured Transform API.
 * Bytes are read with the Admin SDK from that user's storage object.
 */
export async function parseFile(
  fileId: string,
  auth: ApiRequest,
  isHighRes = false
): Promise<Chunk[]> {
  const { userId } = await requireAuth();
  const { file, buffer } = await loadOwnedFileBytes(userId, fileId);
  const fileName = assertSupportedParseFile(file.filename);
  const baseUrl = resolveTransformBaseUrl(process.env.UNSTRUCTURED_API_URL);

  logger.debug("parseFile", { fileName, isHighRes, baseUrl });

  return withApiCredential(userId, "unstructured", auth, async (apiKey) => {
    try {
      return await parseDocumentWithTransform({
        apiKey,
        baseUrl,
        fileName,
        bytes: new Uint8Array(buffer),
        isHighRes,
      });
    } catch (error) {
      if (error instanceof APIError || error instanceof Error) {
        throw error;
      }
      logger.error("parseFile", "Unexpected error during parsing");
      throw new Error("Unstructured API could not parse this file. Please try again.");
    }
  });
}
