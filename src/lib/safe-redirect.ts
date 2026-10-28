/**
 * Same-origin path suitable for post-login navigation.
 * Rejects protocol-relative URLs, backslashes, and path traversal.
 */
export function safeInternalPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048) return null;
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.includes("\\") || trimmed.includes("\0") || trimmed.includes("://")) {
    return null;
  }

  const hashIndex = trimmed.indexOf("#");
  const pathAndQuery = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex);
  const queryIndex = pathAndQuery.indexOf("?");
  const pathname = queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);

  if (!pathname.startsWith("/") || pathname.startsWith("//") || pathname.includes("..")) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(pathname);
    if (
      decoded.includes("\\") ||
      decoded.includes("..") ||
      decoded.startsWith("//") ||
      decoded.includes("://")
    ) {
      return null;
    }
  } catch {
    return null;
  }

  if (pathname === "/login" || pathname.startsWith("/login/")) return null;
  return pathAndQuery;
}
