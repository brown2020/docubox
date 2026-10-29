import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertSupportedParseFile,
  parseDocumentWithTransform,
  resolveTransformBaseUrl,
  TRANSFORM_DEFAULT_BASE,
} from "@/lib/unstructured-transform";

const API_KEY = "test-unstructured-key";

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

const completedElements = {
  id: "job-200",
  status: "completed",
  markdown: null,
  elements: [
    {
      element_id: "title-1",
      type: "Title",
      text: "Invoice",
      metadata: { page_number: 1 },
    },
    {
      element_id: "body-1",
      type: "NarrativeText",
      text: "Amount due",
      metadata: { page_number: 1 },
    },
  ],
};

async function parseWith(fetchImpl: typeof fetch) {
  return parseDocumentWithTransform({
    apiKey: API_KEY,
    baseUrl: TRANSFORM_DEFAULT_BASE,
    fileName: "invoice.pdf",
    bytes: new Uint8Array([1, 2, 3]),
    fetchImpl,
    sleep: async () => {},
    now: () => 0,
    overallTimeoutMs: 10_000,
  });
}

describe("resolveTransformBaseUrl", () => {
  it("uses the Transform base when the URL is unset or still the old partition API", () => {
    expect(resolveTransformBaseUrl(undefined)).toBe(TRANSFORM_DEFAULT_BASE);
    expect(resolveTransformBaseUrl("")).toBe(TRANSFORM_DEFAULT_BASE);
    expect(resolveTransformBaseUrl("https://api.unstructuredapp.io/general/v0/general")).toBe(
      TRANSFORM_DEFAULT_BASE
    );
    expect(resolveTransformBaseUrl("https://transform.example/api/v2/")).toBe(
      "https://transform.example/api/v2"
    );
  });
});

describe("parseDocumentWithTransform", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps a 200 elements response into chunks", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, completedElements));
    const chunks = await parseWith(fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${TRANSFORM_DEFAULT_BASE}/parse`);
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["unstructured-api-key"]).toBe(API_KEY);
    expect(headers.Prefer).toBe("wait=60");
    const form = init.body as FormData;
    expect(form.get("output")).toBe("elements");
    expect(form.get("input")).toBeTruthy();

    expect(chunks).toHaveLength(1);
    expect(chunks[0].content.map((element) => element.text)).toEqual(["Invoice", "Amount due"]);
    expect(chunks[0].content[0]).toMatchObject({
      type: "Title",
      element_id: "title-1",
      metadata: { filename: "invoice.pdf", page_number: 1, filetype: "pdf" },
    });
  });

  it("polls a 202 job and reads elements from the completed result", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse(
          202,
          { id: "job-202", status: "queued", poll_url: "/api/v2/jobs/job-202" },
          { location: "/api/v2/jobs/job-202" }
        )
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          id: "job-202",
          status: "completed",
          result: completedElements,
        })
      );

    const chunks = await parseWith(fetchImpl);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const poll = fetchImpl.mock.calls[1] as unknown as [string, RequestInit];
    expect(poll[0]).toBe("https://transform.unstructured.io/api/v2/jobs/job-202");
    expect((poll[1].headers as Record<string, string>)["unstructured-api-key"]).toBe(API_KEY);
    expect(chunks[0].content[1].text).toBe("Amount due");
  });

  it("returns a friendly message for 401 without including the key", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(401, { detail: `invalid key ${API_KEY}` })
    );
    await expect(parseWith(fetchImpl)).rejects.toThrow(/authentication failed/i);
    await expect(parseWith(fetchImpl)).rejects.not.toThrow(API_KEY);
  });

  it("returns a friendly message when the account is out of credits", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(402, { message: "insufficient credits for this account" })
    );
    await expect(parseWith(fetchImpl)).rejects.toThrow(/out of credits or quota/i);
  });

  it("returns a friendly message for unsupported types", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(415, { detail: "unsupported media type" }));
    await expect(parseWith(fetchImpl)).rejects.toThrow(/not supported for parsing/i);
    expect(() => assertSupportedParseFile("notes.txt")).toThrow(/not supported for parsing/i);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
