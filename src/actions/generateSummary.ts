"use server";

import { generateText } from "ai";
import { getOpenAIClient, getModel, DEFAULT_MODEL } from "@/lib/ai";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/server-auth";

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
 * @param apiKey - Optional API key (uses env var if not provided)
 * @param data - The data to summarize
 * @returns The combined summary
 * @throws Error if summarization fails
 */
export async function generateSummary(
  apiKey: string | null,
  data: string
): Promise<string | null> {
  await requireAuth();

  if (!data.trim()) {
    return null;
  }

  const systemPrompt =
    "You are a helpful assistant. Your job is to summarize the provided data concisely (100 words or less for each chunk).";

  const client = getOpenAIClient(apiKey);
  const model = getModel(client, DEFAULT_MODEL);

  const chunks = splitIntoChunks(data);

  try {
    // Process chunks in parallel for better performance
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
}
