"use server";

import { generateText } from "ai";
import { getOpenAIClient, getModel, DEFAULT_MODEL } from "@/lib/ai";
import { logger } from "@/lib/logger";

const CHUNK_SIZE = 3000; // ~4096 tokens for GPT models

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
 * Processes large data by splitting into chunks and summarizing each.
 *
 * @param apiKey - Optional API key (uses env var if not provided)
 * @param data - The data to summarize
 * @returns The combined summary or null if an error occurs
 */
export async function generateSummary(
  apiKey: string | null,
  data: string
): Promise<string | null> {
  if (!data.trim()) {
    return null;
  }

  const systemPrompt =
    "You are a helpful assistant. Your job is to summarize the provided data concisely (100 words or less for each chunk).";

  try {
    const client = getOpenAIClient(apiKey);
    const model = getModel(client, DEFAULT_MODEL);

    const chunks = splitIntoChunks(data);
    const summaries: string[] = [];

    // Process each chunk
    for (const chunk of chunks) {
      const { text } = await generateText({
        model,
        system: systemPrompt,
        prompt: `Provided data chunk:\n${chunk}`,
      });
      summaries.push(text);
    }

    return summaries.join("\n\n");
  } catch (error) {
    logger.error("generateSummary", "Error generating summary", error);
    return null;
  }
}
