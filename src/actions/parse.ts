"use server";
import { Element, Chunk } from "@/types/types";
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared/index.js";

export async function parseFile(
  fileUrl: string,
  fileName: string,
  isHighRes: boolean = false
): Promise<Chunk[]> {


  const fileResponse = await fetch(fileUrl);

  if (!fileResponse.ok) {
    throw new Error(
      `Failed to fetch the file from Firebase Storage: ${fileResponse.statusText}`
    );
  }

  // Convert the response to a Buffer
  const fileBuffer = await fileResponse.arrayBuffer();
  console.log("Fetched file from Firebase Storage.");

  console.log("File data loaded. Byte length:", fileBuffer.byteLength);
  const apiKey = process.env.UNSTRUCTURED_API_KEY || "";
  const apiURL = process.env.UNSTRUCTURED_API_URL || "";

  console.log({apiKey: process.env.OPENAI_API_KEY,})

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
    console.log("Response status code:", response.statusCode);
    if (response.statusCode === 200) {
      console.log("Response received successfully.");
      if (!response.elements) {
        console.error("No elements found in the response");
        throw new Error("No elements found in the response");
      }
      const elements = response.elements as Element[];
      console.log("Number of elements received:", elements.length);
      const chunks: Chunk[] = [];
      let currentChunk: Element[] = [];
      let currentHeading: string | null = null;
      for (const element of elements) {
        console.log("Processing element:", element);
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
      console.log("Chunks created:", chunks);
      return chunks;
    } else {
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
