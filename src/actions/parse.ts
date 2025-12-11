"use server";
import { Element, Chunk } from "@/types/types";
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared/index.js";

/**
 * Extracts a user-friendly error message from various error types
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    // Check common error response formats
    if (typeof errorObj.message === "string") return errorObj.message;
    if (typeof errorObj.error === "string") return errorObj.error;
    if (typeof errorObj.detail === "string") return errorObj.detail;
    if (
      errorObj.detail &&
      typeof errorObj.detail === "object" &&
      Array.isArray(errorObj.detail)
    ) {
      return JSON.stringify(errorObj.detail);
    }
  }
  return "Unknown error occurred";
}

export async function parseFile(
  fileUrl: string,
  fileName: string,
  apiKey: string,
  isHighRes: boolean = false
): Promise<Chunk[]> {
  // Validate inputs
  if (!apiKey) {
    console.error("[parseFile] Missing Unstructured API key");
    throw new Error(
      "Unstructured API key is required. Please add your API key in profile settings."
    );
  }

  const apiURL = process.env.UNSTRUCTURED_API_URL;
  if (!apiURL) {
    console.error(
      "[parseFile] Missing UNSTRUCTURED_API_URL environment variable"
    );
    throw new Error(
      "Unstructured API URL is not configured. Please set UNSTRUCTURED_API_URL in your environment."
    );
  }

  console.log("[parseFile] Starting file parsing:", {
    fileName,
    isHighRes,
    apiURL,
    hasApiKey: !!apiKey,
  });

  // Fetch file from Firebase Storage
  let fileResponse: Response;
  try {
    fileResponse = await fetch(fileUrl);
  } catch (fetchError) {
    console.error("[parseFile] Network error fetching file:", fetchError);
    throw new Error(
      `Network error while fetching file from storage: ${extractErrorMessage(
        fetchError
      )}`
    );
  }

  if (!fileResponse.ok) {
    console.error("[parseFile] Failed to fetch file from Firebase Storage:", {
      status: fileResponse.status,
      statusText: fileResponse.statusText,
    });
    throw new Error(
      `Failed to fetch the file from Firebase Storage: ${fileResponse.status} ${fileResponse.statusText}`
    );
  }

  // Convert the response to a Buffer
  const fileBuffer = await fileResponse.arrayBuffer();
  console.log("[parseFile] File fetched successfully:", {
    byteLength: fileBuffer.byteLength,
    contentType: fileResponse.headers.get("content-type"),
  });

  if (fileBuffer.byteLength === 0) {
    console.error("[parseFile] File is empty");
    throw new Error(
      "The file appears to be empty. Please upload a valid file."
    );
  }

  const client = new UnstructuredClient({
    security: {
      apiKeyAuth: apiKey,
    },
    serverURL: apiURL,
  });

  try {
    console.log("[parseFile] Sending file to Unstructured API...");

    const response = await client.general.partition({
      partitionParameters: {
        files: {
          content: fileBuffer,
          fileName: fileName,
        },
        strategy: isHighRes ? Strategy.HiRes : Strategy.Auto,
        splitPdfPage: true,
        splitPdfAllowFailed: true,
        splitPdfConcurrencyLevel: 10,
      },
    });

    console.log("[parseFile] Unstructured API response received:", {
      responseType: typeof response,
      hasElements:
        response && typeof response === "object" && "elements" in response,
    });

    // Handle different possible response formats
    let elements: Element[] = [];

    if (typeof response === "string") {
      // Try to parse if it's a JSON string
      try {
        const parsed = JSON.parse(response);
        if (parsed && parsed.elements && Array.isArray(parsed.elements)) {
          elements = parsed.elements;
        } else if (Array.isArray(parsed)) {
          elements = parsed;
        }
      } catch (parseError) {
        console.error(
          "[parseFile] Could not parse response as JSON string:",
          parseError
        );
        console.error(
          "[parseFile] Raw response (first 500 chars):",
          response.substring(0, 500)
        );
      }
    } else if (response && typeof response === "object") {
      const responseObj = response as unknown as Record<string, unknown>;

      // Check for error response
      if (responseObj.statusCode && responseObj.statusCode !== 200) {
        const errorDetail =
          responseObj.body ||
          responseObj.message ||
          responseObj.detail ||
          "Unknown API error";
        console.error("[parseFile] Unstructured API returned error status:", {
          statusCode: responseObj.statusCode,
          body: responseObj.body,
          message: responseObj.message,
        });
        throw new Error(
          `Unstructured API error (${responseObj.statusCode}): ${errorDetail}`
        );
      }

      // Check if it has elements property
      if (responseObj.elements && Array.isArray(responseObj.elements)) {
        elements = responseObj.elements as Element[];
      } else if (Array.isArray(response)) {
        elements = response as Element[];
      }
    }

    console.log("[parseFile] Parsed elements count:", elements.length);

    // Check if we have elements after all the checks
    if (elements.length > 0) {
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

      console.log("[parseFile] Successfully parsed file into chunks:", {
        chunkCount: chunks.length,
      });

      return chunks;
    } else {
      // No elements - try to get more error details
      let errorMessage = "No content could be extracted from the file";
      let errorDetails: Record<string, unknown> = {};

      if (response && typeof response === "object") {
        const responseObj = response as unknown as Record<string, unknown>;
        errorDetails = {
          keys: Object.keys(responseObj),
          statusCode: responseObj.statusCode,
          rawResponse: responseObj.rawResponse ? "present" : "absent",
        };

        // Try to extract error from rawResponse
        if (
          responseObj.rawResponse &&
          typeof responseObj.rawResponse === "object" &&
          responseObj.rawResponse !== null
        ) {
          const rawResp = responseObj.rawResponse as Record<string, unknown>;

          if (typeof rawResp.json === "function") {
            try {
              const errorData = await (
                rawResp.json as () => Promise<unknown>
              )();
              console.error("[parseFile] Raw response JSON:", errorData);

              if (
                errorData &&
                typeof errorData === "object" &&
                errorData !== null
              ) {
                const errObj = errorData as Record<string, unknown>;
                if (errObj.error) errorMessage = String(errObj.error);
                else if (errObj.message) errorMessage = String(errObj.message);
                else if (errObj.detail) errorMessage = String(errObj.detail);
              }
            } catch (jsonError) {
              console.error(
                "[parseFile] Could not parse rawResponse JSON:",
                jsonError
              );
            }
          }

          if (rawResp.status) {
            errorDetails.httpStatus = rawResp.status;
          }
        }
      }

      console.error("[parseFile] No elements in response:", {
        errorMessage,
        ...errorDetails,
      });

      // Provide helpful error messages based on common issues
      if (
        errorMessage.toLowerCase().includes("api key") ||
        errorMessage.includes("401")
      ) {
        throw new Error(
          "Unstructured API authentication failed. Please check your API key in profile settings."
        );
      }
      if (
        errorMessage.includes("402") ||
        errorMessage.toLowerCase().includes("payment")
      ) {
        throw new Error(
          "Unstructured API payment required. Please check your account billing status."
        );
      }
      if (
        errorMessage.includes("429") ||
        errorMessage.toLowerCase().includes("rate limit")
      ) {
        throw new Error(
          "Unstructured API rate limit exceeded. Please wait a moment and try again."
        );
      }

      throw new Error(`Failed to parse file: ${errorMessage}`);
    }
  } catch (error) {
    // Re-throw our custom errors
    if (
      error instanceof Error &&
      error.message.startsWith("Unstructured API")
    ) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith("Failed to parse")) {
      throw error;
    }

    const errorMsg = extractErrorMessage(error);
    console.error("[parseFile] Unexpected error during file parsing:", {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Check for common SDK errors
    if (
      errorMsg.includes("401") ||
      errorMsg.toLowerCase().includes("unauthorized")
    ) {
      throw new Error(
        "Unstructured API authentication failed. Please verify your API key is correct."
      );
    }
    if (
      errorMsg.includes("403") ||
      errorMsg.toLowerCase().includes("forbidden")
    ) {
      throw new Error(
        "Unstructured API access denied. Your API key may not have the required permissions."
      );
    }
    if (
      errorMsg.includes("500") ||
      errorMsg.toLowerCase().includes("internal server")
    ) {
      throw new Error(
        "Unstructured API server error. The service may be temporarily unavailable. Please try again later."
      );
    }

    throw new Error(`Error processing file: ${errorMsg}`);
  }
}
