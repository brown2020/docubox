"use server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

// Helper function to split text into chunks
const splitIntoChunks = (data: string, chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

export const generateSummary = async (apiKey: string | null, data: string) => {
  try {
    const systemPrompt = "You are a helpful assistant. Your job is to summarize the provided data concisely (100 words or less for each chunk).";

    const ai = createOpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });

    const chunkSize = 3000; // Adjust this size based on token limits (typically ~4096 for GPT-3.5-turbo)
    const chunks = splitIntoChunks(data, chunkSize);
    const summaries = [];

    // Process each chunk
    for (const chunk of chunks) {
      const userPrompt = `Provided data chunk:\n${chunk}`;
      const { text } = await generateText({
        model: ai("gpt-3.5-turbo-instruct"),
        system: systemPrompt,
        prompt: userPrompt,
      });
      summaries.push(text);
    }

    // Combine the chunk summaries into a final summary
    const finalSummary = summaries.join("\n\n");

    return finalSummary; // Return the combined summary
  } catch (err) {
    console.error("Error:", err);
    return null; // Return null or handle the error as you prefer
  }
};
