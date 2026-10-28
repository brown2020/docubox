import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/firebase/firebaseAdmin", () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
    createSessionCookie: vi.fn(),
    verifySessionCookie: vi.fn(),
    revokeRefreshTokens: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "session-cookie" }) })),
}));

import { adminAuth } from "@/firebase/firebaseAdmin";
import { DELETE, POST } from "@/app/api/auth/session/route";

function sessionRequest(origin: string) {
  return new NextRequest("https://docubox.ai/api/auth/session", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({ idToken: "token" }),
  });
}

describe("session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects cross-site session creation", async () => {
    const response = await POST(sessionRequest("https://evil.example"));
    expect(response.status).toBe(403);
    expect(adminAuth.verifyIdToken).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body).toEqual({ error: "Failed to create session" });
  });

  it("returns a generic error when token verification fails", async () => {
    process.env.FIREBASE_PRIVATE_KEY = "test-not-a-real-key";
    vi.mocked(adminAuth.verifyIdToken).mockRejectedValue(
      Object.assign(new Error("Firebase ID token has incorrect audience (aud)"), {
        code: "auth/argument-error",
      })
    );
    const response = await POST(sessionRequest("https://docubox.ai"));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Failed to create session" });
    delete process.env.FIREBASE_PRIVATE_KEY;
  });

  it("clears the cookie without revoking every device", async () => {
    const response = await DELETE();
    expect(response.status).toBe(200);
    expect(adminAuth.revokeRefreshTokens).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie") ?? "").toContain("__session=");
  });
});
