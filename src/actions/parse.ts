// app/actions/parse.ts
"use server";

import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared/index.js";

export async function parseFile(
  formData: FormData,
  isHighRes: boolean = false
) {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file uploaded");
  }

  const fileData = await file.arrayBuffer();

  const client = new UnstructuredClient({
    security: {
      apiKeyAuth: process.env.UNSTRUCTURED_API_KEY || "",
    },
    serverURL: process.env.UNSTRUCTURED_API_URL || "",
  });

  try {
    const response = await client.general.partition({
      partitionParameters: {
        files: {
          content: new Uint8Array(fileData),
          fileName: file.name,
        },
        strategy: isHighRes ? Strategy.HiRes : Strategy.Auto,
      },
    });

    if (response.statusCode === 200) {
      // Check if 'elements' is defined
      if (!response.elements) {
        throw new Error("No elements found in the response");
      }

      const elements = response.elements;

      const chunks: any[] = [];
      let currentChunk: any[] = [];
      let currentHeading = null;

      for (const element of elements) {
        if (element.category === "Heading") {
          if (currentChunk.length > 0) {
            chunks.push({ heading: currentHeading, content: currentChunk });
          }
          currentChunk = [];
          currentHeading = element.text;
        } else {
          currentChunk.push(element);
        }
      }

      if (currentChunk.length > 0) {
        chunks.push({ heading: currentHeading, content: currentChunk });
      }

      return chunks;
    } else {
      let errorMessage = "Error processing file";

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

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error during file parsing:", error);
    throw new Error("An error occurred while processing the file.");
  }
}
