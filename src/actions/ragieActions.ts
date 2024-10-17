"use server";


const apiKey = process.env.RAGIE_API_KEY;
const BASE_URL = "https://api.ragie.ai"

interface Metadata {
  [key: string]: string | number | boolean | string[];
}

interface RagieFileUploadResponse {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  name: string;
  metadata: Metadata;
  chunk_count: number;
  external_id: string;
  partition: string;
}

export async function uploadToRagie(
  fileId: string, 
  fileUrl: string, 
  fileName: string
): Promise<RagieFileUploadResponse> {
  console.log("Starting upload to Ragie...");
  
  const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout
  const MAX_RETRIES = 3;
  
  try {
    // Fetch the file with streaming enabled
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }

    const contentLength = fileResponse.headers.get('content-length');
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
    
    console.log(`File size: ${contentLength} bytes`);
    
    // Stream the file data instead of loading it all into memory
    const fileStream = fileResponse.body;
    if (!fileStream) {
      throw new Error('Failed to get file stream');
    }

    const formData = new FormData();
    
    // Create a Blob from the stream
    const chunks: Uint8Array[] = [];
    const reader = fileResponse.body!.getReader();
    
    let loadedBytes = 0;
    
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      
      chunks.push(value);
      loadedBytes += value.length;
      
      // Log progress
      if (contentLength) {
        const progress = (loadedBytes / parseInt(contentLength) * 100).toFixed(2);
        console.log(`Upload progress: ${progress}%`);
      }
    }
    
    const fileBlob = new Blob(chunks, { type: contentType });
    formData.append('file', fileBlob, fileName);
    formData.append('metadata', JSON.stringify({ 
      title: fileName, 
      scope: fileId,
      size: loadedBytes
    }));

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < MAX_RETRIES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(`${BASE_URL}/documents`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${apiKey}`,
            accept: 'application/json',
            // Add headers to indicate large file upload
            'X-File-Size': loadedBytes.toString(),
            'X-File-Name': fileName
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Attempt ${attempt + 1} failed:`, errorText);
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Upload successful:", data);
        return data;

      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Upload failed after all retries');

  } catch (error) {
    console.error("Error during upload:", error);
    throw error;
  }
}

// export async function uploadToRagie(fileId: string, fileUrl: string, fileName: string): Promise<RagieFileUploadResponse> {
//   console.log("Starting upload to Ragie...");
//   console.log("File URL:", fileUrl);
//   console.log("File Name:", fileName);

//   console.log("Ragie API Key:", apiKey ? "Key is set" : "Key is missing");

//   try {
//     // Fetch the file from Firebase Storage
//     const fileResponse = await fetch(fileUrl);
//     if (!fileResponse.ok) {
//       throw new Error(
//         `Failed to fetch the file from Firebase Storage: ${fileResponse.statusText}`
//       );
//     }

//     // Get the content type and handle the null case
//     const contentType =
//       fileResponse.headers.get("content-type") || "application/octet-stream";

//     // Convert the response to a Buffer
//     const fileBuffer = await fileResponse.arrayBuffer();
//     const fileBlob = new Blob([fileBuffer], { type: contentType }); // Provide a default type if contentType is null
//     console.log("Fetched file from Firebase Storage.");

//     const formData = new FormData();
//     formData.append("file", fileBlob, fileName); // Append the Blob object with a file name
//     formData.append(
//       "metadata",
//       JSON.stringify({ title: fileName, scope: fileId })
//     );

//     console.log("Form Data Prepared:");
//     console.log("File in FormData:", formData.get("file"));
//     console.log("Metadata in FormData:", formData.get("metadata"));

//     // Perform the upload request to Ragie API
//     const response = await fetch(`${BASE_URL}/documents`, {
//       method: "POST",
//       headers: {
//         authorization: `Bearer ${apiKey}`,
//         // Do not manually set Content-Type when using FormData
//         accept: "application/json",
//       },
//       body: formData,
//     });

//     console.log("Ragie API Response Status:", response.status);
//     console.log("Ragie API Response Headers:", response.headers);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Error Response from Ragie API:", errorText);
//       throw new Error(`Upload to Ragie failed with status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("Successful Upload to Ragie:", data);
//     return data; // Return any relevant response data
//   } catch (error) {
//     console.error("Error during upload to Ragie:", error);
//     throw error;
//   }
// }

export async function retrieveChunks(query: string, fileId: string) {
  console.log("Starting chunk retrieval...");
  console.log("Query:", query);

  console.log("Ragie API Key:", apiKey ? "Key is set" : "Key is missing");

  try {
    const response = await fetch(`${BASE_URL}/retrievals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
      throw new Error(
        `Failed to retrieve chunks from Ragie with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Retrieved chunks successfully:", data);
    return data; // Return the retrieved chunks
  } catch (error) {
    console.error("Error during chunk retrieval:", error);
    throw error;
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