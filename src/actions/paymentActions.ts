"use server";

import Stripe from "stripe";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export async function createPaymentIntent(amount: number) {
  // Verify authentication before processing payment
  await requireAuth();

  // Validate amount (must be positive integer in cents, max $9,999.99)
  if (!Number.isInteger(amount) || amount <= 0 || amount > 999999) {
    throw new Error("Invalid payment amount.");
  }

  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;

  try {
    if (!product) throw new Error("Stripe product name is not defined");

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { product },
      description: `Payment for product ${process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME}`,
    });

    return paymentIntent.client_secret;
  } catch (error) {
    logger.error("paymentActions", "Error creating payment intent", error);
    throw new Error("Failed to create payment intent");
  }
}

export async function validatePaymentIntent(paymentIntentId: string) {
  // Verify authentication before validating payment
  await requireAuth();

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Convert the Stripe object to a plain object
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        created: paymentIntent.created,
        status: paymentIntent.status,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
      };
    } else {
      throw new Error("Payment was not successful");
    }
  } catch (error) {
    logger.error("paymentActions", "Error validating payment intent", error);
    throw new Error("Failed to validate payment intent");
  }
}
