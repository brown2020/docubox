import { describe, expect, it } from "vitest";
import { isInvalidAdminCredential } from "@/lib/admin-credential-error";
import { readAdminCredential } from "@/lib/firebase-admin-credential";
import { sessionTokenKind } from "@/lib/session-token";

function jwt(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${body}.sig`;
}

describe("readAdminCredential", () => {
  it("trims wrapping quotes and escaped newlines", () => {
    const credential = readAdminCredential({
      FIREBASE_PROJECT_ID: " proj ",
      FIREBASE_CLIENT_EMAIL: '"svc@proj.iam.gserviceaccount.com"',
      FIREBASE_PRIVATE_KEY: '"-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n"',
    } as unknown as NodeJS.ProcessEnv);

    expect(credential).toEqual({
      projectId: "proj",
      clientEmail: "svc@proj.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
    });
  });

  it("uses the email inside a JSON service account", () => {
    const credential = readAdminCredential({
      FIREBASE_PROJECT_ID: "stale-project",
      FIREBASE_CLIENT_EMAIL: "stale@proj.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: JSON.stringify({
        project_id: "live-project",
        client_email: "live@live-project.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----\n",
      }),
    } as unknown as NodeJS.ProcessEnv);

    expect(credential?.projectId).toBe("live-project");
    expect(credential?.clientEmail).toBe("live@live-project.iam.gserviceaccount.com");
    expect(credential?.privateKey).toContain("BEGIN PRIVATE KEY");
  });
});

describe("sessionTokenKind", () => {
  it("distinguishes session cookies from ID tokens", () => {
    expect(
      sessionTokenKind(jwt({ iss: "https://session.firebase.google.com/proj" }))
    ).toBe("session");
    expect(sessionTokenKind(jwt({ iss: "https://securetoken.google.com/proj" }))).toBe("id");
    expect(sessionTokenKind("not-a-jwt")).toBe("unknown");
  });
});

describe("isInvalidAdminCredential", () => {
  it("matches the Google account-not-found failure", () => {
    const error = Object.assign(new Error("wrapped"), {
      cause: Object.assign(new Error("invalid_grant: Invalid grant: account not found"), {
        code: "app/invalid-credential",
      }),
    });
    expect(isInvalidAdminCredential(error)).toBe(true);
    expect(isInvalidAdminCredential(new Error("bad token"))).toBe(false);
  });
});
