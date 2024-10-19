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

  console.log("File URL:", {fileResponse});

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
    if (response.statusCode === 200) {
      console.error("Error at status not 200");
      if (!response.elements) {
      }
      const elements = response.elements as Element[];
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
      console.error("Error at status not 200");
      let errorMessage = "Error processing file";
      console.error("Error status code received:", response.statusCode);
      if (response.rawResponse) {
        try {
          const errorData = await response.rawResponse.json();
          if (errorData && "error" in errorData) {
            errorMessage = errorData.error as string;
          }
        } catch (jsonError) {
          console.error("Error parsing error response:", jsonError);
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
