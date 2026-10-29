import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { Chunk, Element, ElementType } from "@/types/types";

const SERVICE_NAME = "Unstructured API";

export const TRANSFORM_DEFAULT_BASE = "https://transform.unstructured.io/api/v2";

export const SUPPORTED_PARSE_EXTENSIONS = [
  ".bmp",
  ".docx",
  ".heic",
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".pptx",
  ".tiff",
] as const;

const ELEMENT_TYPES = new Set<ElementType>([
  "Title",
  "NarrativeText",
  "EmailAddress",
  "UncategorizedText",
  "PageNumber",
  "Image",
  "Heading",
  "Header",
  "Table",
  "Footer",
]);

const OVERALL_TIMEOUT_MS = 4 * 60 * 1000;
const INITIAL_WAIT_MS = 70_000;
const POLL_REQUEST_MS = 30_000;

export function unsupportedParseMessage(): string {
  return `This file type is not supported for parsing. Supported types: ${SUPPORTED_PARSE_EXTENSIONS.join(", ")}.`;
}

/**
 * Old partition URLs (…/general/v0/…) reject current Transform keys.
 * An unset URL, or any URL that still points at that API, uses the Transform base.
 */
export function resolveTransformBaseUrl(configured: string | undefined | null): string {
  const value = configured?.trim() ?? "";
  if (!value || value.includes("general/v0")) return TRANSFORM_DEFAULT_BASE;
  return value.replace(/\/+$/, "");
}

export function assertSupportedParseFile(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop()?.trim() || fileName.trim();
  const dot = base.lastIndexOf(".");
  const extension = dot >= 0 ? base.slice(dot).toLowerCase() : "";
  if (!SUPPORTED_PARSE_EXTENSIONS.includes(extension as (typeof SUPPORTED_PARSE_EXTENSIONS)[number])) {
    throw new Error(unsupportedParseMessage());
  }
  return base;
}

function filetypeFromName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

function asElementType(value: unknown): ElementType {
  if (typeof value === "string" && ELEMENT_TYPES.has(value as ElementType)) {
    return value as ElementType;
  }
  if (value === "ListItem") return "NarrativeText";
  return "UncategorizedText";
}

function mapElements(
  rawElements: unknown,
  fileName: string
): Element[] {
  if (!Array.isArray(rawElements)) return [];
  const filetype = filetypeFromName(fileName);
  const elements: Element[] = [];
  for (const item of rawElements) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const text = typeof record.text === "string" ? record.text : "";
    if (!text.trim()) continue;
    const metadata =
      record.metadata && typeof record.metadata === "object"
        ? (record.metadata as Record<string, unknown>)
        : {};
    const page = metadata.page_number;
    elements.push({
      type: asElementType(record.type),
      element_id:
        typeof record.element_id === "string" && record.element_id
          ? record.element_id
          : `element-${elements.length + 1}`,
      text,
      metadata: {
        filetype,
        languages: Array.isArray(metadata.languages)
          ? metadata.languages.filter((language): language is string => typeof language === "string")
          : [],
        page_number: typeof page === "number" && Number.isFinite(page) ? page : 1,
        filename: fileName,
        ...(typeof metadata.parent_id === "string" ? { parent_id: metadata.parent_id } : {}),
      },
    });
  }
  return elements;
}

/** Completed Parse bodies put elements at the top level. Job retrieval wraps them in `result`. */
export function elementsFromTransformBody(body: unknown, fileName: string): Element[] {
  if (!body || typeof body !== "object") return [];
  const record = body as Record<string, unknown>;
  const document =
    record.result && typeof record.result === "object"
      ? (record.result as Record<string, unknown>)
      : record;

  const fromElements = mapElements(document.elements, fileName);
  if (fromElements.length > 0) return fromElements;

  if (typeof document.markdown === "string" && document.markdown.trim()) {
    return [
      {
        type: "NarrativeText",
        element_id: typeof record.id === "string" ? record.id : "markdown",
        text: document.markdown,
        metadata: {
          filetype: filetypeFromName(fileName),
          languages: [],
          page_number: 1,
          filename: fileName,
        },
      },
    ];
  }

  return [];
}

function chunkElements(elements: Element[]): Chunk[] {
  const chunks: Chunk[] = [];
  let currentChunk: Element[] = [];
  let currentHeading: string | null = null;

  for (const element of elements) {
    if (element.type === "Heading") {
      if (currentChunk.length > 0) {
        chunks.push({ heading: currentHeading, content: currentChunk });
      }
      currentChunk = [];
      currentHeading = element.text || null;
    } else {
      currentChunk.push(element);
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({ heading: currentHeading, content: currentChunk });
  }

  return chunks;
}

function sanitize(text: string, apiKey: string): string {
  if (!apiKey) return text;
  return text.split(apiKey).join("[redacted]");
}

function isQuotaText(text: string): boolean {
  return /credit|quota|billing|payment required|insufficient/i.test(text);
}

async function readBodyText(response: Response, apiKey: string): Promise<string> {
  try {
    return sanitize(await response.text(), apiKey);
  } catch {
    return "";
  }
}

function friendlyStatusMessage(status: number, bodyText: string): string {
  if (status === 401 || status === 403) {
    return "Unstructured API authentication failed. Check the API key in your profile, or ask an admin to update the platform key.";
  }
  if (status === 402 || isQuotaText(bodyText)) {
    return "Unstructured API is out of credits or quota. Add credits to the Unstructured account, or add your own API key in profile settings.";
  }
  if (status === 415) return unsupportedParseMessage();
  if (status === 429) {
    return "Unstructured API rate limit exceeded. Please wait and try again.";
  }
  if (status === 410) {
    return "The parse result expired. Please parse the file again.";
  }
  if (status >= 500) {
    return "Unstructured API is unavailable. Please try again later.";
  }
  return "Unstructured API could not parse this file. Please try again.";
}

function throwForStatus(status: number, bodyText: string): never {
  throw new APIError(SERVICE_NAME, status, friendlyStatusMessage(status, bodyText));
}

function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name;
  return name === "TimeoutError" || name === "AbortError";
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function jobStatus(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const status = (body as { status?: unknown }).status;
  return typeof status === "string" ? status : null;
}

function isPending(status: string | null): boolean {
  return status === "queued" || status === "processing" || status === "pending";
}

function resolvePollUrl(baseUrl: string, location: string | null, body: unknown): string {
  let reference = location?.trim() || "";
  if (!reference && body && typeof body === "object") {
    const record = body as { poll_url?: unknown; id?: unknown };
    if (typeof record.poll_url === "string" && record.poll_url.trim()) {
      reference = record.poll_url.trim();
    } else if (typeof record.id === "string" && record.id.trim()) {
      reference = `/api/v2/jobs/${record.id.trim()}`;
    }
  }
  if (!reference) {
    throw new APIError(
      SERVICE_NAME,
      202,
      "Unstructured API accepted the file but did not return a job to check. Please try again."
    );
  }

  const absolute = /^https?:\/\//i.test(reference)
    ? reference
    : new URL(reference, new URL(baseUrl).origin).toString();

  if (new URL(absolute).origin !== new URL(baseUrl).origin) {
    throw new APIError(
      SERVICE_NAME,
      502,
      "Unstructured API returned an unexpected job location. Please try again."
    );
  }
  return absolute;
}

function timeoutError(): APIError {
  return new APIError(
    SERVICE_NAME,
    504,
    "Unstructured API timed out before the document finished parsing. Please try again."
  );
}

export async function parseDocumentWithTransform(options: {
  apiKey: string;
  baseUrl: string;
  fileName: string;
  bytes: Uint8Array;
  isHighRes?: boolean;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  overallTimeoutMs?: number;
}): Promise<Chunk[]> {
  const fileName = assertSupportedParseFile(options.fileName);
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  const now = options.now ?? Date.now;
  const deadline = now() + (options.overallTimeoutMs ?? OVERALL_TIMEOUT_MS);
  const headers = { "unstructured-api-key": options.apiKey, Prefer: "wait=60" };

  const remaining = () => {
    const left = deadline - now();
    if (left <= 0) throw timeoutError();
    return left;
  };

  const form = new FormData();
  const copy = new ArrayBuffer(options.bytes.byteLength);
  new Uint8Array(copy).set(options.bytes);
  form.append("input", new Blob([copy]), fileName);
  form.append("output", "elements");
  if (options.isHighRes) form.append("profile", "best");

  const request = async (url: string, init: RequestInit, budgetMs: number): Promise<Response> => {
    const left = remaining();
    try {
      return await fetchImpl(url, {
        ...init,
        signal: AbortSignal.timeout(Math.min(budgetMs, left)),
      });
    } catch (error) {
      if (isTimeoutError(error)) throw timeoutError();
      logger.error("parseFile", "Network error contacting Unstructured API", { name: (error as { name?: string })?.name });
      throw new APIError(
        SERVICE_NAME,
        503,
        "Network error while contacting Unstructured API. Please try again."
      );
    }
  };

  const first = await request(
    `${options.baseUrl.replace(/\/+$/, "")}/parse`,
    { method: "POST", headers, body: form },
    INITIAL_WAIT_MS
  );
  const firstText = await readBodyText(first, options.apiKey);
  if (first.status !== 200 && first.status !== 202) {
    logger.error("parseFile", "Transform parse failed", { status: first.status });
    throwForStatus(first.status, firstText);
  }

  let body = parseJson(firstText);
  let pollUrl: string | null =
    first.status === 202 ? resolvePollUrl(options.baseUrl, first.headers.get("location"), body) : null;

  let delay = 1000;
  while (first.status === 202 || (pollUrl && isPending(jobStatus(body)))) {
    await sleep(Math.min(delay, remaining()));
    const polled = await request(
      pollUrl as string,
      { method: "GET", headers: { "unstructured-api-key": options.apiKey } },
      POLL_REQUEST_MS
    );
    const polledText = await readBodyText(polled, options.apiKey);
    if (!polled.ok && polled.status !== 202) {
      logger.error("parseFile", "Transform job poll failed", { status: polled.status });
      throwForStatus(polled.status, polledText);
    }
    body = parseJson(polledText);
    const status = jobStatus(body);
    if (polled.status === 202 || isPending(status)) {
      delay = Math.min(delay * 2, 8000);
      const nextLocation = polled.headers.get("location");
      if (nextLocation) pollUrl = resolvePollUrl(options.baseUrl, nextLocation, body);
      continue;
    }
    if (status === "failed" || status === "cancelled") {
      const errorText =
        body && typeof body === "object"
          ? sanitize(JSON.stringify((body as { error?: unknown }).error ?? ""), options.apiKey)
          : "";
      if (isQuotaText(errorText)) throwForStatus(402, errorText);
      throw new APIError(
        SERVICE_NAME,
        502,
        status === "cancelled"
          ? "Unstructured API cancelled this parse. Please try again."
          : "Unstructured API could not parse this file. Please try again."
      );
    }
    break;
  }

  const elements = elementsFromTransformBody(body, fileName);
  if (elements.length === 0) {
    throw new APIError(
      SERVICE_NAME,
      422,
      "No content could be extracted from the file. The file may be empty or in an unsupported format."
    );
  }

  return chunkElements(elements);
}
