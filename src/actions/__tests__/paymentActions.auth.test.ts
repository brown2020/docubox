import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server-auth", () => ({
  requireAuth: vi.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message = "Unauthorized: Please sign in to continue.") {
      super(message);
      this.name = "UnauthorizedError";
    }
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { requireAuth, UnauthorizedError } from "@/lib/server-auth";
import { createPaymentIntent } from "@/actions/paymentActions";

describe("createPaymentIntent auth + validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("denies unauthenticated callers", async () => {
    vi.mocked(requireAuth).mockRejectedValue(new UnauthorizedError());
    await expect(createPaymentIntent(1000)).rejects.toThrow(/Unauthorized/);
  });

  it("rejects non-positive amounts before calling Stripe", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: "user_1" });
    await expect(createPaymentIntent(0)).rejects.toThrow(/Invalid payment amount/);
    await expect(createPaymentIntent(-5)).rejects.toThrow(/Invalid payment amount/);
  });
});
