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

  it("denies unauthenticated callers before creating a Stripe intent", async () => {
    vi.mocked(requireAuth).mockRejectedValue(new UnauthorizedError());
    await expect(createPaymentIntent()).rejects.toThrow(/Unauthorized/);
  });

  it("does not create an intent when the product name is missing", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: "user_1" });
    const previous = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
    delete process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
    await expect(createPaymentIntent()).rejects.toThrow(/product name/i);
    if (previous === undefined) delete process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
    else process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME = previous;
  });
});
