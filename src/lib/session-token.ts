export type SessionTokenKind = "session" | "id" | "unknown";

/** Classifies a Firebase cookie without trusting it. Signature checks happen later. */
export function sessionTokenKind(token: string): SessionTokenKind {
  const payload = token.split(".");
  if (payload.length !== 3 || !payload[1]) return "unknown";
  try {
    const json = JSON.parse(Buffer.from(payload[1], "base64url").toString("utf8")) as {
      iss?: unknown;
    };
    if (typeof json.iss !== "string") return "unknown";
    if (json.iss.startsWith("https://session.firebase.google.com/")) return "session";
    if (json.iss.startsWith("https://securetoken.google.com/")) return "id";
    return "unknown";
  } catch {
    return "unknown";
  }
}
