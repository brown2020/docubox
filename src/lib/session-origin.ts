/**
 * Login CSRF guard: the browser must send an Origin that matches this host.
 * Cross-site form posts send the attacker's origin (or none).
 */
export function isTrustedSessionOrigin(
  originHeader: string | null,
  expectedHost: string
): boolean {
  if (!originHeader || !expectedHost) return false;
  try {
    const origin = new URL(originHeader);
    return origin.host === expectedHost;
  } catch {
    return false;
  }
}
