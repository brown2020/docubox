"use server";

const apiKey = process.env.RAGIE_API_KEY;
const BASE_URL = "https://api.ragie.ai";

type Metadata = {
  [key: string]: string | number | boolean | string[];
};

type RagieFileUploadResponse = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  name: string;
  metadata: Metadata;
  chunk_count: number;
  external_id: string;
  partition: string;
};

type RagieErrorResponse = {
  error?: string;
  message?: string;
  detail?: string | { msg: string; type: string }[];
  code?: string;
};

/**
 * Parses error response from Ragie API
 */
async function parseRagieError(response: Response): Promise<string> {
  const status = response.status;
  let errorBody: RagieErrorResponse | null = null;

  try {
    const text = await response.text();
    if (text) {
      errorBody = JSON.parse(text) as RagieErrorResponse;
    }
  } catch {
    // Response body might not be JSON
  }

  const errorMessage =
    errorBody?.error ||
    errorBody?.message ||
    (typeof errorBody?.detail === "string"
      ? errorBody.detail
      : errorBody?.detail?.[0]?.msg) ||
    response.statusText ||
    "Unknown error";

  // Provide user-friendly messages for common status codes
  switch (status) {
    case 400:
      return `Invalid request: ${errorMessage}. Please check your file format.`;
    case 401:
      return "Ragie API authentication failed. Your API key may be invalid or expired. Please update your API key in profile settings.";
    case 403:
      return "Ragie API access denied. Your account may be disabled, suspended, or the API key lacks permissions. Please check your Ragie account status or contact support@ragie.ai.";
    case 404:
      return `Resource not found: ${errorMessage}`;
    case 413:
      return "File too large for Ragie API. Please try a smaller file.";
    case 429:
      return "Ragie API rate limit exceeded. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return `Ragie API server error (${status}). The service may be temporarily unavailable. Please try again later.`;
    default:
      return `Ragie API error (${status}): ${errorMessage}`;
  }
}

export async function checkDocumentReadiness(
  ragieFileId: string,
  ragieApiKey: string,
  interval = 3000,
  maxAttempts = 60 // Timeout after ~3 minutes
) {
  if (!ragieApiKey) {
    console.error("[checkDocumentReadiness] Missing Ragie API key");
    throw new Error(
      "Ragie API key is required. Please add your API key in profile settings."
    );
  }

  console.log("[checkDocumentReadiness] Starting to poll document status:", {
    ragieFileId,
    interval,
    maxAttempts,
  });

  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const response = await fetch(`${BASE_URL}/documents/${ragieFileId}`, {
        headers: { authorization: `Bearer ${ragieApiKey}` },
      });

      if (!response.ok) {
        const errorMessage = await parseRagieError(response);
        console.error("[checkDocumentReadiness] API error:", {
          status: response.status,
          errorMessage,
          attempt: attempts,
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("[checkDocumentReadiness] Document status:", {
        status: data.status,
        attempt: attempts,
      });

      if (data.status === "ready") {
        console.log("[checkDocumentReadiness] Document is ready for querying");
        return true;
      }

      if (data.status === "failed" || data.status === "error") {
        console.error(
          "[checkDocumentReadiness] Document processing failed:",
          data
        );
        throw new Error(
          `Document processing failed in Ragie: ${
            data.error || data.message || "Unknown error"
          }`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      if (error instanceof Error && error.message.includes("Ragie API")) {
        throw error;
      }
      console.error("[checkDocumentReadiness] Unexpected error:", error);
      throw error;
    }
  }

  console.error(
    "[checkDocumentReadiness] Timeout waiting for document to be ready"
  );
  throw new Error(
    "Timeout waiting for document to be processed by Ragie. Please try again or check your Ragie dashboard."
  );
}

export const uploadToRagie = async (
  fileId: string,
  fileUrl: string,
  fileName: string,
  ragieApiKey: string
): Promise<RagieFileUploadResponse> => {
  // Validate inputs
  if (!ragieApiKey) {
    console.error("[uploadToRagie] Missing Ragie API key");
    throw new Error(
      "Ragie API key is required. Please add your API key in profile settings."
    );
  }

  if (!fileUrl) {
    console.error("[uploadToRagie] Missing file URL");
    throw new Error("File URL is required for upload.");
  }

  console.log("[uploadToRagie] Starting upload:", {
    fileId,
    fileName,
    hasApiKey: !!ragieApiKey,
  });

  // Fetch file from storage
  let fileResponse: Response;
  try {
    fileResponse = await fetch(fileUrl);
  } catch (fetchError) {
    console.error("[uploadToRagie] Network error fetching file:", fetchError);
    throw new Error(
      `Network error while fetching file for upload: ${
        fetchError instanceof Error ? fetchError.message : "Unknown error"
      }`
    );
  }

  if (!fileResponse.ok) {
    console.error("[uploadToRagie] Failed to fetch file:", {
      status: fileResponse.status,
      statusText: fileResponse.statusText,
    });
    throw new Error(
      `Failed to fetch file for upload: ${fileResponse.status} ${fileResponse.statusText}`
    );
  }

  const fileStream = fileResponse.body;
  if (!fileStream) {
    console.error("[uploadToRagie] File stream is not available");
    throw new Error(
      "File stream is not available. The file may be empty or corrupted."
    );
  }

  // Read file into blob
  const reader = fileStream.getReader();
  const chunks: BlobPart[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalBytes += value.byteLength;
    }
  } catch (readError) {
    console.error("[uploadToRagie] Error reading file stream:", readError);
    throw new Error(
      `Error reading file: ${
        readError instanceof Error ? readError.message : "Unknown error"
      }`
    );
  }

  if (totalBytes === 0) {
    console.error("[uploadToRagie] File is empty");
    throw new Error("Cannot upload an empty file to Ragie.");
  }

  console.log("[uploadToRagie] File read successfully:", {
    totalBytes,
    contentType: fileResponse.headers.get("content-type"),
  });

  const fileBlob = new Blob(chunks, {
    type:
      fileResponse.headers.get("content-type") || "application/octet-stream",
  });

  const formData = new FormData();
  formData.append("file", fileBlob, fileName);
  formData.append(
    "metadata",
    JSON.stringify({ title: fileName, scope: fileId })
  );

  // Upload to Ragie
  console.log("[uploadToRagie] Sending file to Ragie API...");

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ragieApiKey}`,
        accept: "application/json",
      },
      body: formData,
    });
  } catch (uploadError) {
    console.error("[uploadToRagie] Network error during upload:", uploadError);
    throw new Error(
      `Network error while uploading to Ragie: ${
        uploadError instanceof Error ? uploadError.message : "Unknown error"
      }`
    );
  }

  if (!response.ok) {
    const errorMessage = await parseRagieError(response);
    console.error("[uploadToRagie] Upload failed:", {
      status: response.status,
      errorMessage,
    });
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("[uploadToRagie] Upload successful:", {
    documentId: result.id,
    status: result.status,
  });

  return result;
};

export async function retrieveChunks(
  query: string,
  fileId: string,
  ragieApiKey?: string
) {
  const keyToUse = ragieApiKey || process.env.RAGIE_API_KEY || "";

  console.log("[retrieveChunks] Starting chunk retrieval:", {
    query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
    fileId,
    hasApiKey: !!keyToUse,
  });

  if (!keyToUse) {
    console.error("[retrieveChunks] Missing Ragie API key");
    return {
      error: true,
      status: 0,
      message:
        "Ragie API key is required. Please add your API key in profile settings or set RAGIE_API_KEY in your environment.",
    } as const;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/retrievals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keyToUse}`,
      },
      body: JSON.stringify({
        query,
        filter: {
          scope: fileId,
        },
      }),
    });
  } catch (networkError) {
    console.error("[retrieveChunks] Network error:", networkError);
    return {
      error: true,
      status: 0,
      message: `Network error while contacting Ragie API: ${
        networkError instanceof Error ? networkError.message : "Unknown error"
      }`,
    } as const;
  }

  console.log("[retrieveChunks] Ragie API response:", {
    status: response.status,
  });

  if (!response.ok) {
    const errorMessage = await parseRagieError(response);
    console.error("[retrieveChunks] API error:", {
      status: response.status,
      errorMessage,
    });
    return {
      error: true,
      status: response.status,
      message: errorMessage,
    } as const;
  }

  try {
    const data = await response.json();
    console.log("[retrieveChunks] Retrieved chunks successfully:", {
      chunkCount: data?.scored_chunks?.length || data?.chunks?.length || 0,
    });
    return data;
  } catch (parseError) {
    console.error("[retrieveChunks] Error parsing response:", parseError);
    return {
      error: true,
      status: response.status,
      message: "Failed to parse response from Ragie API.",
    } as const;
  }
}

export async function deleteFileFromRagie(
  fileId: string,
  ragieApiKey?: string
) {
  const keyToUse = ragieApiKey || apiKey;

  console.log("[deleteFileFromRagie] Starting file deletion:", {
    fileId,
    hasApiKey: !!keyToUse,
  });

  if (!keyToUse) {
    console.error("[deleteFileFromRagie] Missing Ragie API key");
    throw new Error(
      "Ragie API key is required. Please add your API key in profile settings or set RAGIE_API_KEY in your environment."
    );
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/documents/${fileId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keyToUse}`,
      },
    });
  } catch (networkError) {
    console.error("[deleteFileFromRagie] Network error:", networkError);
    throw new Error(
      `Network error while deleting from Ragie: ${
        networkError instanceof Error ? networkError.message : "Unknown error"
      }`
    );
  }

  console.log("[deleteFileFromRagie] Ragie API response:", {
    status: response.status,
  });

  if (!response.ok) {
    const errorMessage = await parseRagieError(response);
    console.error("[deleteFileFromRagie] API error:", {
      status: response.status,
      errorMessage,
    });
    throw new Error(errorMessage);
  }

  // Handle 204 No Content (common for DELETE operations)
  if (response.status === 204) {
    console.log(
      "[deleteFileFromRagie] File deleted successfully (no content response)"
    );
    return { success: true, fileId };
  }

  try {
    const data = await response.json();
    console.log("[deleteFileFromRagie] File deleted successfully:", data);
    return data;
  } catch {
    // Some DELETE endpoints return empty body on success
    console.log(
      "[deleteFileFromRagie] File deleted successfully (empty response)"
    );
    return { success: true, fileId };
  }
}
