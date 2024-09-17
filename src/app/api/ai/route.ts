import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const systemPrompt = "You are a helpful translation assistant. Your job is to generate a summary of the provided json data. Without any introduction, provide an answer that is concise, informative, and 100 words or less.";

    const userPrompt = `Provided JSON data:\n${JSON.stringify(data)}`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    return Response.json(text, { status: 200 });
  } catch (err) {
    return new Response("something went wrong", { status: 500 });
  }
}
