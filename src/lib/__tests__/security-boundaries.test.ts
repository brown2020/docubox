import { describe, expect, it } from "vitest";
import { INITIAL_FREE_CREDITS } from "@/constants/billing";
import { clientProfileWriteAllowed } from "@/lib/profile-credits";
import { paymentGrantDecision } from "@/lib/payment-grant";
import { safeInternalPath } from "@/lib/safe-redirect";
import { isTrustedSessionOrigin } from "@/lib/session-origin";
import {
  assertOwnedObjectPath,
  ownedStorageObjectFromDownloadUrl,
} from "@/lib/storage-path";
import { ragieKeyMode, selectApiKey } from "@/types/api-request";

describe("clientProfileWriteAllowed", () => {
  it("allows the free starter balance only on create", () => {
    expect(
      clientProfileWriteAllowed({
        isCreate: true,
        docId: "userData",
        credits: INITIAL_FREE_CREDITS,
      })
    ).toBe(true);
    expect(
      clientProfileWriteAllowed({
        isCreate: true,
        docId: "userData",
        credits: INITIAL_FREE_CREDITS + 1,
      })
    ).toBe(false);
  });

  it("rejects client credit changes after create", () => {
    expect(
      clientProfileWriteAllowed({
        isCreate: false,
        docId: "userData",
        credits: 1000,
        previousCredits: 1000,
      })
    ).toBe(true);
    expect(
      clientProfileWriteAllowed({
        isCreate: false,
        docId: "userData",
        credits: 1_000_000,
        previousCredits: 1000,
      })
    ).toBe(false);
    expect(
      clientProfileWriteAllowed({
        isCreate: false,
        docId: "other",
        credits: 1000,
        previousCredits: 1000,
      })
    ).toBe(false);
  });
});

describe("selectApiKey", () => {
  it("does not return the caller key when credits are requested", () => {
    const selected = selectApiKey({
      useCredits: true,
      userApiKey: "user-secret",
      platformKey: "platform-secret",
    });
    expect(selected).toEqual({ source: "platform", apiKey: "platform-secret" });
  });

  it("does not fall back to the platform key for bring-your-own-key calls", () => {
    const selected = selectApiKey({
      useCredits: false,
      userApiKey: "user-secret",
      platformKey: "platform-secret",
    });
    expect(selected.source).toBe("user");
    expect(selected.apiKey).toBe("user-secret");
  });

  it("refuses a platform call when the server key is missing", () => {
    expect(() =>
      selectApiKey({ useCredits: true, userApiKey: "user-secret", platformKey: "" })
    ).toThrow(/not configured/);
  });
});

describe("ragieKeyMode", () => {
  it("keeps user-indexed files off the platform key", () => {
    expect(ragieKeyMode(false, true)).toBe("user");
    expect(ragieKeyMode(true, false)).toBe("platform");
    expect(ragieKeyMode(null, false)).toBe("user");
    expect(ragieKeyMode(undefined, true)).toBe("platform");
  });
});

describe("paymentGrantDecision", () => {
  it("grants only the fixed package to the payment owner", () => {
    expect(
      paymentGrantDecision({
        callerUserId: "user_1",
        metadataUserId: "user_1",
        amount: 9999,
        status: "succeeded",
      }).ok
    ).toBe(true);
    expect(
      paymentGrantDecision({
        callerUserId: "user_2",
        metadataUserId: "user_1",
        amount: 9999,
        status: "succeeded",
      }).ok
    ).toBe(false);
    expect(
      paymentGrantDecision({
        callerUserId: "user_1",
        metadataUserId: "user_1",
        amount: 100,
        status: "succeeded",
      }).ok
    ).toBe(false);
    expect(
      paymentGrantDecision({
        callerUserId: "user_1",
        metadataUserId: "user_1",
        amount: 9999,
        status: "processing",
      }).ok
    ).toBe(false);
  });
});

describe("owned storage paths", () => {
  it("accepts the caller's firebase storage object and rejects others", () => {
    const previousBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET;
    delete process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET;
    const url =
      "https://firebasestorage.googleapis.com/v0/b/bucket/o/users%2Fuser_1%2Ffiles%2Fdoc_a?alt=media&token=t";
    expect(ownedStorageObjectFromDownloadUrl(url, "user_1").path).toBe(
      "users/user_1/files/doc_a"
    );
    expect(() => ownedStorageObjectFromDownloadUrl(url, "user_2")).toThrow(/Invalid storage/);
    expect(() =>
      ownedStorageObjectFromDownloadUrl("http://169.254.169.254/latest/meta-data", "user_1")
    ).toThrow(/Invalid storage/);
    expect(() =>
      assertOwnedObjectPath("users/user_1/../user_2/files/secret", "user_1")
    ).toThrow(/Invalid storage/);
    expect(
      assertOwnedObjectPath(
        "users/user_1/unstructured/doc/chunk_0",
        "user_1",
        "users/user_1/unstructured/"
      )
    ).toBe("users/user_1/unstructured/doc/chunk_0");
    expect(() =>
      assertOwnedObjectPath("users/user_1/files/doc", "user_1", "users/user_1/unstructured/")
    ).toThrow(/Invalid storage/);
    if (previousBucket === undefined) {
      delete process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET;
    } else {
      process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET = previousBucket;
    }
  });
});

describe("safeInternalPath", () => {
  it("allows same-origin paths and rejects open redirects", () => {
    expect(safeInternalPath("/trash")).toBe("/trash");
    expect(safeInternalPath("/dashboard?folder=1")).toBe("/dashboard?folder=1");
    expect(safeInternalPath("https://evil.example")).toBeNull();
    expect(safeInternalPath("//evil.example")).toBeNull();
    expect(safeInternalPath("/\\evil.example")).toBeNull();
    expect(safeInternalPath("/login")).toBeNull();
    expect(safeInternalPath("/files/../../admin")).toBeNull();
  });
});

describe("isTrustedSessionOrigin", () => {
  it("requires an origin host that matches the request host", () => {
    expect(isTrustedSessionOrigin("https://docubox.ai", "docubox.ai")).toBe(true);
    expect(isTrustedSessionOrigin("https://evil.example", "docubox.ai")).toBe(false);
    expect(isTrustedSessionOrigin(null, "docubox.ai")).toBe(false);
  });
});
