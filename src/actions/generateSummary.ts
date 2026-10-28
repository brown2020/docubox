"use server";

import { generateText } from "ai";
import { getOpenAIClient, getModel, DEFAULT_MODEL } from "@/lib/ai";
import { withApiCredential } from "@/lib/api-access";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";
import type { ApiRequest } from "@/types/api-request";

const CHUNK_SIZE = 3000; // ~750 tokens for GPT models

/**
 * Splits text into chunks of specified size.
 */
function splitIntoChunks(
  data: string,
  chunkSize: number = CHUNK_SIZE
): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Generates a summary of the provided data.
 * Processes large data by splitting into chunks and summarizing each in parallel.
 *
 * @param data - The data to summarize
 * @param auth - Credits mode or the caller's own API key
 * @returns The combined summary
 * @throws Error if summarization fails
 */
export async function generateSummary(
  data: string,
  auth: ApiRequest
): Promise<string | null> {
  const { userId } = await requireAuth();

  if (!data.trim()) {
    return null;
  }

  const systemPrompt =
    "You are a helpful assistant. Your job is to summarize the provided data concisely (100 words or less for each chunk).";

  return withApiCredential(userId, "open-ai", auth, async (apiKey) => {
    const client = getOpenAIClient(apiKey);
    const model = getModel(client, DEFAULT_MODEL);
    const chunks = splitIntoChunks(data);

    try {
      const summaries = await Promise.all(
        chunks.map(async (chunk) => {
          const { text } = await generateText({
            model,
            system: systemPrompt,
            prompt: `Provided data chunk:\n${chunk}`,
          });
          return text;
        })
      );

      return summaries.join("\n\n");
    } catch (error) {
      logger.error("generateSummary", "Error generating summary", error);
      throw new Error("Failed to generate summary. Please try again.");
    }
  });
}
