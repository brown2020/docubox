import { getPreviewType } from "@/utils/filePreview";

const SAFE_MEDIA_TYPES = new Set([
  "application/pdf",
  "audio/aac",
  "audio/flac",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "image/avif",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
  "image/x-icon",
  "video/mp4",
  "video/ogg",
  "video/quicktime",
  "video/webm",
]);

/**
 * Content type for a same-origin preview response.
 * Text, HTML, and unknown types are plain text so the browser does not
 * execute them if someone opens the preview URL directly.
 */
export function previewContentType(mimeType: string, filename: string): string {
  const mime = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  const normalized = mime === "image/jpg" ? "image/jpeg" : mime;
  if (
    normalized === "text/html" ||
    normalized === "application/xhtml+xml" ||
    normalized === "image/svg+xml"
  ) {
    const preview = getPreviewType(mimeType, filename);
    if (preview === "image" && normalized === "image/svg+xml") {
      return "image/svg+xml";
    }
    return "text/plain; charset=utf-8";
  }
  if (normalized.startsWith("text/") || normalized === "application/json" || normalized === "application/xml" || normalized === "application/javascript") {
    return "text/plain; charset=utf-8";
  }
  if (SAFE_MEDIA_TYPES.has(normalized)) return normalized;

  const preview = getPreviewType(mimeType, filename);
  if (preview === "pdf") return "application/pdf";
  if (preview === "text") return "text/plain; charset=utf-8";
  if (preview === "image") {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "svg") return "image/svg+xml";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "png" || ext === "gif" || ext === "webp" || ext === "bmp" || ext === "avif") {
      return `image/${ext}`;
    }
  }
  if (preview === "video") return "video/mp4";
  if (preview === "audio") return "audio/mpeg";
  return "application/octet-stream";
}

export function previewContentDisposition(filename: string): string {
  const cleaned = filename.replace(/[^\x20-\x7E]/g, "").replace(/["\\]/g, "").trim().slice(0, 180);
  const name = cleaned || "file";
  return `inline; filename="${name}"`;
}

export function sliceByteRange(
  bytes: Uint8Array,
  rangeHeader: string | null
): { status: 200 | 206; body: Uint8Array; contentRange?: string } {
  if (!rangeHeader) return { status: 200, body: bytes };
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match || bytes.length === 0) return { status: 200, body: bytes };

  const size = bytes.length;
  let start: number;
  let end: number;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return { status: 200, body: bytes };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= size) {
      return { status: 200, body: bytes };
    }
    end = Math.min(end, size - 1);
  }
  if (end < start) return { status: 200, body: bytes };
  return {
    status: 206,
    body: bytes.subarray(start, end + 1),
    contentRange: `bytes ${start}-${end}/${size}`,
  };
}
