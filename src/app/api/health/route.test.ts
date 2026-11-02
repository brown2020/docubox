import { afterEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

const PUBLIC_KEYS = [
  "NEXT_PUBLIC_FIREBASE_APIKEY",
  "NEXT_PUBLIC_FIREBASE_AUTHDOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECTID",
  "NEXT_PUBLIC_FIREBASE_APPID",
] as const;

const previous = Object.fromEntries(
  PUBLIC_KEYS.map((key) => [key, process.env[key]])
);

afterEach(() => {
  for (const key of PUBLIC_KEYS) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("GET /api/health", () => {
  it("returns the docubox probe without exposing env values", async () => {
    for (const key of PUBLIC_KEYS) delete process.env[key];

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      service: "docubox",
      checks: { firebase_public: false },
    });
  });

  it("marks firebase_public when the client config names are present", async () => {
    process.env.NEXT_PUBLIC_FIREBASE_APIKEY = "present";
    process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN = "present";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECTID = "present";
    process.env.NEXT_PUBLIC_FIREBASE_APPID = "present";

    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.checks.firebase_public).toBe(true);
    expect(JSON.stringify(body)).not.toContain("present");
  });
});
