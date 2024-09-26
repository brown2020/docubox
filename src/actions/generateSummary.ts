"use server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";


export const generateSummary = async (apiKey: string | null, data: string) => {
  try {
    const systemPrompt = "You are a helpful translation assistant. Your job is to generate a summary of the provided json data. Without any introduction, provide an answer that is concise, informative, and 100 words or less.";
    const userPrompt = `Provided JSON data:\n${JSON.stringify(data)}`;

    const ai = createOpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });

    const { text } = await generateText({
      model: ai("gpt-3.5-turbo-instruct"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    return text; // Return the generated summary
  } catch (err) {
    console.error("Error:", err);
    return null; // Return null or handle the error as you prefer
  }
};
