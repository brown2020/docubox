import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { grantPackageCredits } from "@/lib/grant-credits";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * Stripe webhook. Grants the fixed credit package once per PaymentIntent.
 * Returns 503 when STRIPE_WEBHOOK_SECRET is unset so checkout still works
 * through the authenticated success-page confirmation.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = new Stripe(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
      body,
      signature,
      secret
    );
  } catch (error) {
    logger.error("stripe-webhook", "Signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;
    if (!userId) {
      logger.error("stripe-webhook", "PaymentIntent missing userId metadata", {
        id: paymentIntent.id,
      });
      return NextResponse.json({ received: true, granted: false });
    }

    try {
      await grantPackageCredits({
        callerUserId: userId,
        paymentIntentId: paymentIntent.id,
        metadataUserId: userId,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        created: paymentIntent.created,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Payment was not successful") {
        logger.error("stripe-webhook", "PaymentIntent did not qualify for credits", {
          id: paymentIntent.id,
        });
        return NextResponse.json({ received: true, granted: false });
      }
      logger.error("stripe-webhook", "Failed to grant credits", error);
      return NextResponse.json({ error: "Grant failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
