"use server";

import Stripe from "stripe";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";

// Validate Stripe key at startup
if (!process.env.STRIPE_SECRET_KEY) {
  logger.error("paymentActions", "STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function createPaymentIntent(amount: number) {
  // Verify authentication before processing payment
  await requireAuth();

  const product = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_NAME;

  try {
    if (!product) throw new Error("Stripe product name is not defined");

    const paymentIntent = await stripe.paymentIntents.create({
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
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Convert the Stripe object to a plain object
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        created: paymentIntent.created,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
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
