/**
 * File preview type detection utility.
 * Determines how a file should be previewed based on its MIME type and filename extension.
 */

export type PreviewType = "image" | "pdf" | "text" | "video" | "audio" | "unsupported";

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "avif",
]);

const TEXT_EXTENSIONS = new Set([
  "txt", "csv", "json", "md", "xml", "html", "htm", "css", "js", "jsx",
  "ts", "tsx", "py", "rb", "go", "rs", "java", "c", "cpp", "h", "hpp",
  "sh", "bash", "zsh", "yaml", "yml", "toml", "ini", "cfg", "conf",
  "env", "log", "sql", "graphql", "prisma", "dockerfile",
]);

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov"]);

const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "aac", "flac", "m4a", "wma"]);

/**
 * Extracts the file extension from a filename (lowercase, no dot).
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) return "";
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Determines the preview type for a file based on its MIME type and filename.
 */
export function getPreviewType(mimeType: string, filename: string): PreviewType {
  const mime = mimeType.toLowerCase();
  const ext = getExtension(filename);

  // Check MIME type first (most reliable)
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("text/")) return "text";
  if (mime === "application/json") return "text";
  if (mime === "application/xml") return "text";
  if (mime === "application/javascript") return "text";

  // Fall back to extension
  if (ext === "pdf") return "pdf";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (TEXT_EXTENSIONS.has(ext)) return "text";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";

  return "unsupported";
}

/**
 * Maps file extension to a language identifier for syntax highlighting.
 */
export function getLanguageFromFilename(filename: string): string | undefined {
  const ext = getExtension(filename);
  const map: Record<string, string> = {
    js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
    py: "python", rb: "ruby", go: "go", rs: "rust", java: "java",
    c: "c", cpp: "cpp", h: "c", hpp: "cpp",
    html: "html", htm: "html", css: "css", xml: "xml",
    json: "json", yaml: "yaml", yml: "yaml", toml: "toml",
    sql: "sql", sh: "bash", bash: "bash", zsh: "bash",
    md: "markdown", csv: "plaintext", txt: "plaintext",
    dockerfile: "dockerfile", graphql: "graphql", prisma: "prisma",
  };
  return map[ext];
}

/**
 * Checks if a file type can be previewed.
 */
export function isPreviewable(mimeType: string, filename: string): boolean {
  return getPreviewType(mimeType, filename) !== "unsupported";
}
