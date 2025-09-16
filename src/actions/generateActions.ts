"use server";

import { ModelMessage, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

async function getModel(modelName: string) {
  switch (modelName) {
    case "gpt-4o":
      return openai("gpt-4o");

    default:
      throw new Error(`Unsupported model name: ${modelName}`);
  }
}

async function generateResponse(
  systemPrompt: string,
  userPrompt: string,
  modelName: string
) {
  const model = await getModel(modelName);

  const messages: ModelMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const { text } = await generateText({
    model,
    messages,
  });

  return text;
}

// New function to handle generation using previously retrieved chunks
export async function generateWithChunks(
  chunks: string[],
  query: string,
  modelName: string
): Promise<string> {
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

  // Generate an answer based on the system prompt and user query
  return generateResponse(systemPrompt, query, modelName);
}
