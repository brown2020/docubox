import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lightweight readiness probe for CI / ops smoke checks.
 * Reports public Firebase client env presence without exposing values.
 */
export async function GET() {
  const firebasePublic = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_APIKEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECTID &&
      process.env.NEXT_PUBLIC_FIREBASE_APPID
  );

  return NextResponse.json({
    ok: true,
    service: "docubox",
    checks: {
      firebase_public: firebasePublic,
    },
  });
}
