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

export async function checkDocumentReadiness(
  ragieFileId: string,
  ragieApiKey: string,
  interval = 3000
) {
  let isReady = false;
  do {
    try {
      const response = await fetch(`${BASE_URL}/documents/${ragieFileId}`, {
        headers: { authorization: `Bearer ${ragieApiKey}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to check document readiness: ${errorText}`);
        throw new Error(
          `Failed to check document readiness: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Current Document Status:", data.status);

      if (data.status === "ready") {
        console.log("Document is ready for querying.");
        isReady = true;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error("Error checking document readiness:", error);
      throw error;
    }
  } while (!isReady);

  return true;
}

export const uploadToRagie = async (
  fileId: string,
  fileUrl: string,
  fileName: string,
  ragieApiKey: string
): Promise<RagieFileUploadResponse> => {
  try {
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }

    const fileStream = fileResponse.body;
    if (!fileStream) {
      throw new Error("File stream is not available");
    }

    const formData = new FormData();
    const reader = fileStream.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const fileBlob = new Blob(chunks, {
      type:
        fileResponse.headers.get("content-type") || "application/octet-stream",
    });
    formData.append("file", fileBlob, fileName);
    formData.append(
      "metadata",
      JSON.stringify({ title: fileName, scope: fileId })
    );

    const response = await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ragieApiKey}`,
        accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error during upload to Ragie:", error);
    throw error;
  }
};

export async function retrieveChunks(
  query: string,
  fileId: string,
  ragieApiKey?: string
) {
  console.log("Starting chunk retrieval...");
  console.log("Query:", query);

  const keyToUse = ragieApiKey || process.env.RAGIE_API_KEY || "";
  console.log("Ragie API Key:", keyToUse ? "Key is set" : "Key is missing");

  if (!keyToUse) {
    return {
      error: true,
      status: 0,
      message:
        "Missing Ragie API key. Set RAGIE_API_KEY in the environment or provide a key in profile settings.",
    } as const;
  }

  try {
    const response = await fetch(`${BASE_URL}/retrievals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keyToUse}`,
      },
      body: JSON.stringify({
        query,
        filter: {
          scope: fileId, // Adjust the filter based on your use case
        },
      }),
    });

    console.log("Ragie API Response Status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Response from Ragie API:", errorText);
      if (response.status === 401 || response.status === 403) {
        return {
          error: true,
          status: response.status,
          message:
            "Ragie API access denied (" +
            response.status +
            "): Your account may be disabled or the API key is invalid. Please contact support@ragie.ai.",
        } as const;
      }
      return {
        error: true,
        status: response.status,
        message: `Failed to retrieve chunks from Ragie with status: ${response.status}`,
      } as const;
    }

    const data = await response.json();
    console.log("Retrieved chunks successfully:", data);
    return data; // Return the retrieved chunks
  } catch (error) {
    console.error("Error during chunk retrieval:", error);
    return {
      error: true,
      status: 0,
      message: "Network error while contacting Ragie API.",
    } as const;
  }
}

export async function deleteFileFromRagie(fileId: string) {
  console.log("Deleting file from Ragie...");
  console.log("FileId: ", fileId);

  console.log("Ragie API Key:", apiKey ? "Key is set" : "Key is missing");

  try {
    const response = await fetch(`${BASE_URL}/documents/${fileId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log("Ragie DELETE API Response Status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Response from Ragie API:", errorText);
      throw new Error(
        `Failed to DLETE file from Ragie with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("File deleted successfully:", data);
    return data; // Return the retrieved chunks
  } catch (error) {
    console.error("Error during File deletion:", error);
    throw error;
  }
}
