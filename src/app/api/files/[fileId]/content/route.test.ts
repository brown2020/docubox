import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/lib/server-auth", () => {
  class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
      super(message);
      this.name = "UnauthorizedError";
    }
  }
  return {
    UnauthorizedError,
    requireAuth: vi.fn(),
  };
});

vi.mock("@/lib/api-access", () => ({
  loadOwnedFileBytes: vi.fn(),
}));

import { loadOwnedFileBytes } from "@/lib/api-access";
import { requireAuth, UnauthorizedError } from "@/lib/server-auth";
import { GET } from "./route";

function request(range?: string) {
  return new NextRequest("https://docubox.example/api/files/file_1/content", {
    headers: range ? { range } : undefined,
  });
}

describe("GET /api/files/[fileId]/content", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects callers who are not signed in", async () => {
    vi.mocked(requireAuth).mockRejectedValue(new UnauthorizedError());
    const response = await GET(request(), { params: Promise.resolve({ fileId: "file_1" }) });
    expect(response.status).toBe(401);
    expect(loadOwnedFileBytes).not.toHaveBeenCalled();
  });

  it("returns the owned file bytes without using a storage URL", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: "user_1" });
    vi.mocked(loadOwnedFileBytes).mockResolvedValue({
      file: {
        id: "file_1",
        filename: "notes.html",
        downloadUrl: "https://firebasestorage.googleapis.com/v0/b/bucket/o/users%2Fuser_1%2Ffiles%2Fnotes.html?alt=media&token=secret",
        type: "text/html",
        deletedAt: null,
        ragieFileId: null,
        ragieUsesPlatformKey: null,
        shareToken: null,
      },
      buffer: Buffer.from("hello preview"),
    });

    const response = await GET(request(), { params: Promise.resolve({ fileId: "file_1" }) });
    expect(loadOwnedFileBytes).toHaveBeenCalledWith("user_1", "file_1");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("hello preview");
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("content-disposition")).not.toContain("secret");
  });

  it("returns 404 when the signed-in user does not own the file", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: "user_1" });
    vi.mocked(loadOwnedFileBytes).mockRejectedValue(new Error("File not found"));
    const response = await GET(request(), { params: Promise.resolve({ fileId: "other" }) });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Could not load file content." });
  });
});
