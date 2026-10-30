import { NextRequest, NextResponse } from "next/server";
import { loadOwnedFileBytes } from "@/lib/api-access";
import { logger } from "@/lib/logger";
import {
  previewContentDisposition,
  previewContentType,
  sliceByteRange,
} from "@/lib/preview-content";
import { requireAuth, UnauthorizedError } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/**
 * Same-origin file bytes for the preview modal.
 * The browser must not fetch Firebase Storage directly: the bucket does not
 * send CORS headers for the preview origin. Ownership is the signed-in user's
 * Firestore file record, and the bytes come from that record's storage object.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { fileId } = await context.params;
    const { file, buffer } = await loadOwnedFileBytes(userId, fileId);
    const bytes = new Uint8Array(buffer);
    const ranged = sliceByteRange(bytes, request.headers.get("range"));
    const headers = new Headers({
      "Content-Type": previewContentType(file.type, file.filename),
      "Content-Disposition": previewContentDisposition(file.filename),
      "Content-Length": String(ranged.body.byteLength),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'; script-src 'none'",
    });
    if (ranged.contentRange) headers.set("Content-Range", ranged.contentRange);
    const body = new ArrayBuffer(ranged.body.byteLength);
    new Uint8Array(body).set(ranged.body);
    return new Response(body, { status: ranged.status, headers });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "";
    const status = message === "File not found" ? 404 : message.includes("too large") ? 413 : 400;
    logger.error("file-content", "Preview content request failed", { status });
    return NextResponse.json({ error: "Could not load file content." }, { status });
  }
}
