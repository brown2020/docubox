"use server";
import { Element, Chunk } from "@/types/types";
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared/index.js";
export async function parseFile(
  formData: FormData,
  isHighRes: boolean = false
): Promise<Chunk[]> {
  const file = formData.get("file") as File;
  if (!file) {
    console.error("No file uploaded");
    throw new Error("No file uploaded");
  }
  console.log("File uploaded:", file.name, "Size:", file.size);
  const fileData = await file.arrayBuffer();
  console.log("File data loaded. Byte length:", fileData.byteLength);
  const apiKey = process.env.UNSTRUCTURED_API_KEY || "";
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
          content: fileData, // Use fileData directly as ArrayBuffer
          fileName: file.name,
        },
        strategy: isHighRes ? Strategy.HiRes : Strategy.Auto,
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