"use server";

import { generateText } from "ai";
import { getOpenAIClient, getModel, DEFAULT_MODEL } from "@/lib/ai";
import { requireAuth } from "@/lib/server-auth";
import { logger } from "@/lib/logger";

/**
 * Generates a response using the AI model.
 */
async function generateResponse(
  systemPrompt: string,
  userPrompt: string,
  modelName: string = DEFAULT_MODEL,
  apiKey?: string | null
): Promise<string> {
  const client = getOpenAIClient(apiKey);
  const model = getModel(client, modelName);

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
  });

  return text;
}

/**
 * Generates a response based on retrieved document chunks.
 * Uses RAG (Retrieval Augmented Generation) pattern.
 */
export async function generateWithChunks(
  chunks: string[],
  query: string,
  modelName: string = DEFAULT_MODEL,
  apiKey?: string | null
): Promise<string> {
  await requireAuth();

  // Combine the retrieved chunks into a single text block
  const chunkText = chunks.join("\n");

  // Create the system prompt with the retrieved chunks
  const systemPrompt = `You are "Ragie AI", a professional but friendly AI chatbot working as an assistant to the user.
Your current task is to help the user based on all of the information available to you shown below.
Answer informally, directly, and concisely without a heading or greeting but include everything relevant.
Use richtext Markdown when appropriate including bold, italic, paragraphs, and lists when helpful.
If using LaTeX, use double $$ as delimiter instead of single $. Use $$...$$ instead of parentheses.
Organize information into multiple sections or points when appropriate.
Don't include raw item IDs or other raw fields from the source.
Don't use XML or other markup unless requested by the user.

Here is all of the information available to answer the user:
===
${chunkText}
===

If the user asked for a search and there are no results, make sure to let the user know that you couldn't find anything,
and what they might be able to do to find the information they need.`;

  try {
    return await generateResponse(systemPrompt, query, modelName, apiKey);
  } catch (error) {
    logger.error("generateActions", "Error generating response with chunks", error);
    throw new Error("Failed to generate response. Please try again.");
  }
}
