"use server";

import Stripe from "stripe";
import { CREDIT_PACKAGE_CENTS, CREDIT_PACKAGE_CREDITS } from "@/constants/billing";
import { grantPackageCredits } from "@/lib/grant-credits";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";

function createStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function createPaymentIntent() {
  const { userId } = await requireAuth();
  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;
  if (!product) throw new Error("Stripe product name is not defined");

  try {
    const paymentIntent = await createStripeClient().paymentIntents.create({
      amount: CREDIT_PACKAGE_CENTS,
      currency: "usd",
      metadata: {
        product,
        userId,
        credits: String(CREDIT_PACKAGE_CREDITS),
      },
      description: `Payment for product ${product}`,
    });

    return paymentIntent.client_secret;
  } catch (error) {
    logger.error("paymentActions", "Error creating payment intent", error);
    throw new Error("Failed to create payment intent");
  }
}

export async function validatePaymentIntent(paymentIntentId: string) {
  const { userId } = await requireAuth();

  try {
    const paymentIntent =
      await createStripeClient().paymentIntents.retrieve(paymentIntentId);
    const grant = await grantPackageCredits({
      callerUserId: userId,
      paymentIntentId: paymentIntent.id,
      metadataUserId: paymentIntent.metadata.userId,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      created: paymentIntent.created,
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      created: paymentIntent.created,
      status: paymentIntent.status,
      currency: paymentIntent.currency,
      description: paymentIntent.description,
      credits: CREDIT_PACKAGE_CREDITS,
      alreadyProcessed: !grant.granted,
    };
  } catch (error) {
    logger.error("paymentActions", "Error validating payment intent", error);
    if (error instanceof Error && error.message === "Payment was not successful") {
      throw error;
    }
    throw new Error("Failed to validate payment intent");
  }
}
