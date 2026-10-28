export type AdminCredential = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function unwrap(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let cleaned = value.trim().replace(/^\uFEFF/, "");
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned || undefined;
}

/**
 * Reads the Admin SDK service account from env.
 * Accepts a PEM private key or a full service-account JSON string in
 * FIREBASE_PRIVATE_KEY. When the value is JSON, its client_email is used
 * because that email must match the key.
 */
export function readAdminCredential(
  env: NodeJS.ProcessEnv = process.env
): AdminCredential | null {
  const rawKey = unwrap(env.FIREBASE_PRIVATE_KEY);
  const projectId = unwrap(env.FIREBASE_PROJECT_ID);
  const clientEmail = unwrap(env.FIREBASE_CLIENT_EMAIL);
  if (!rawKey || !projectId || !clientEmail) return null;

  if (rawKey.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawKey) as {
        project_id?: unknown;
        client_email?: unknown;
        private_key?: unknown;
      };
      if (typeof parsed.private_key === "string" && typeof parsed.client_email === "string") {
        const email = unwrap(parsed.client_email);
        const key = unwrap(parsed.private_key);
        const project =
          typeof parsed.project_id === "string" ? unwrap(parsed.project_id) : projectId;
        if (email && key && project) {
          return { projectId: project, clientEmail: email, privateKey: key.replace(/\\n/g, "\n") };
        }
      }
    } catch {
      // Not JSON; treat the value as a PEM key below.
    }
  }

  return {
    projectId,
    clientEmail,
    privateKey: rawKey.replace(/\\n/g, "\n"),
  };
}
