"use server";
import { Element, Chunk } from "@/types/types";
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared/index.js";

export async function parseFile(
  fileUrl: string,
  fileName: string,
  apiKey: string,
  isHighRes: boolean = false
): Promise<Chunk[]> {
  const fileResponse = await fetch(fileUrl);

  console.log("File URL:", { fileResponse });

  if (!fileResponse.ok) {
    throw new Error(
      `Failed to fetch the file from Firebase Storage: ${fileResponse.statusText}`
    );
  }

  // Convert the response to a Buffer
  const fileBuffer = await fileResponse.arrayBuffer();
  console.log("Fetched file from Firebase Storage.");

  console.log("File data loaded. Byte length:", fileBuffer.byteLength);
  const apiURL = process.env.UNSTRUCTURED_API_URL || "";

  const client = new UnstructuredClient({
    security: {
      apiKeyAuth: apiKey,
    },
    serverURL: apiURL,
  });
  try {
    const response = await client.general.partition({
      partitionParameters: {
        files: {
          content: fileBuffer, // Use fileData directly as ArrayBuffer
          fileName: fileName,
        },
        strategy: isHighRes ? Strategy.HiRes : Strategy.Auto,
        splitPdfPage: true,
        // Continue PDF splitting even if some earlier split operations fail.
        splitPdfAllowFailed: true,
        // Modify splitPdfConcurrencyLevel to set the number of parallel requests
        splitPdfConcurrencyLevel: 10,
      },
    });

    // Handle different possible response formats
    let elements: Element[] = [];

    if (typeof response === "string") {
      // Try to parse if it's a JSON string
      try {
        const parsed = JSON.parse(response);
        if (parsed && parsed.elements && Array.isArray(parsed.elements)) {
          elements = parsed.elements;
        }
      } catch (e) {
        console.error("Could not parse response as JSON string:", e);
      }
    } else if (response && typeof response === "object") {
      // Check if it has elements property
      const responseObj = response as unknown as Record<string, unknown>;
      if (responseObj.elements && Array.isArray(responseObj.elements)) {
        elements = responseObj.elements as Element[];
      }
    }

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
      return chunks;
    } else {
      console.error("Error: No elements in response");
      let errorMessage = "Error processing file";

      // Try to extract error info if available
      if (response && typeof response === "object") {
        const responseObj = response as unknown as Record<string, unknown>;
        if (
          responseObj.rawResponse &&
          typeof responseObj.rawResponse === "object" &&
          responseObj.rawResponse !== null &&
          "json" in responseObj.rawResponse &&
          typeof (responseObj.rawResponse as { json: unknown }).json ===
            "function"
        ) {
          try {
            const errorData = await (
              responseObj.rawResponse as { json: () => Promise<unknown> }
            ).json();
            if (
              errorData &&
              typeof errorData === "object" &&
              errorData !== null &&
              "error" in errorData
            ) {
              errorMessage = String((errorData as { error: unknown }).error);
            }
          } catch (jsonError) {
            console.error("Error parsing error response:", jsonError);
          }
        }
      }

      console.error("Error message:", errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error during file parsing:", error);
    throw new Error("An error occurred while processing the file.");
  }
}
