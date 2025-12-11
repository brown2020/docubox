/**
 * Centralized error handling utilities.
 * Provides consistent error extraction and API error parsing across the application.
 */

/**
 * Extracts a user-friendly error message from various error types.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === "string") return errorObj.message;
    if (typeof errorObj.error === "string") return errorObj.error;
    if (typeof errorObj.detail === "string") return errorObj.detail;
    if (Array.isArray(errorObj.detail)) {
      return JSON.stringify(errorObj.detail);
    }
  }
  return "Unknown error occurred";
}

/**
 * Common HTTP status code error messages.
 */
const HTTP_ERROR_MESSAGES: Record<number, (serviceName: string) => string> = {
  400: (name) => `Invalid request to ${name}. Please check your input.`,
  401: (name) => `${name} authentication failed. Please check your API key.`,
  402: (name) => `${name} payment required. Please check your account billing.`,
  403: (name) => `${name} access denied. Your API key may lack permissions.`,
  404: (name) => `${name} resource not found.`,
  413: (name) => `File too large for ${name}. Please try a smaller file.`,
  429: (name) => `${name} rate limit exceeded. Please wait and try again.`,
  500: (name) => `${name} server error. Please try again later.`,
  502: (name) => `${name} server error. Please try again later.`,
  503: (name) => `${name} service unavailable. Please try again later.`,
  504: (name) => `${name} timeout. Please try again later.`,
};

/**
 * Gets a user-friendly error message for an HTTP status code.
 */
export function getHttpErrorMessage(
  status: number,
  serviceName: string,
  fallbackMessage?: string
): string {
  const messageGenerator = HTTP_ERROR_MESSAGES[status];
  if (messageGenerator) {
    return messageGenerator(serviceName);
  }
  return fallbackMessage || `${serviceName} error (${status})`;
}

/**
 * Parses an API error response and returns a user-friendly message.
 */
export async function parseAPIErrorResponse(
  response: Response,
  serviceName: string
): Promise<string> {
  const status = response.status;
  let errorBody: Record<string, unknown> | null = null;

  try {
    const text = await response.text();
    if (text) {
      errorBody = JSON.parse(text);
    }
  } catch {
    // Response body might not be JSON
  }

  const errorMessage =
    (errorBody?.error as string) ||
    (errorBody?.message as string) ||
    (typeof errorBody?.detail === "string" ? errorBody.detail : null) ||
    (Array.isArray(errorBody?.detail)
      ? (errorBody.detail[0] as { msg?: string })?.msg
      : null) ||
    response.statusText ||
    "Unknown error";

  return getHttpErrorMessage(
    status,
    serviceName,
    `${serviceName} error (${status}): ${errorMessage}`
  );
}

/**
 * Creates a standardized API error with consistent formatting.
 */
export class APIError extends Error {
  constructor(
    public readonly serviceName: string,
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }

  static fromResponse(
    serviceName: string,
    statusCode: number,
    message: string
  ): APIError {
    const friendlyMessage = getHttpErrorMessage(
      statusCode,
      serviceName,
      message
    );
    return new APIError(serviceName, statusCode, friendlyMessage);
  }
}
