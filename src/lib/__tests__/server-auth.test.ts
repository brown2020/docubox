import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("@/firebase/firebaseAdmin", () => ({
  adminAuth: {
    verifySessionCookie: vi.fn(),
    verifyIdToken: vi.fn(),
  },
  adminDb: {},
}));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { cookies, headers } from "next/headers";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { requireAuth, UnauthorizedError } from "@/lib/server-auth";

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue({ get: () => null } as never);
  });

  it("denies when no session cookie or bearer token is present", async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as never);
    await expect(requireAuth()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("denies when session cookie verification fails", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "stale-session" }),
    } as never);
    vi.mocked(adminAuth.verifySessionCookie).mockRejectedValue(
      new Error("invalid")
    );
    await expect(requireAuth()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("returns userId when session cookie is valid", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "good-session" }),
    } as never);
    vi.mocked(adminAuth.verifySessionCookie).mockResolvedValue({
      uid: "user_abc",
    } as never);
    await expect(requireAuth()).resolves.toEqual({ userId: "user_abc" });
  });
});
