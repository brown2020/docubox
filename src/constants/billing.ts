/**
 * Credit ledger constants. Firestore rules hard-code the same numbers.
 * Keep `INITIAL_FREE_CREDITS` and the package amounts in sync with firestore.rules.
 */
export const INITIAL_FREE_CREDITS = 1000;

/** $99.99 package. 9999 cents + the historical +1 credit adjustment = 10,000 credits. */
export const CREDIT_PACKAGE_CENTS = 9999;
export const CREDIT_PACKAGE_CREDITS = 10_000;
