import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const systemPrompt = `You are a helpful assistant. You are provided with JSON data. Your task is to:
    
    1. Generate a summary of the provided JSON data.
    2. Create an HTML design in tailwind css to display the JSON key/value data.
    
    You will respond with a JSON object containing two keys:
    - **html**: This key should contain an HTML design that displays the most relevant fields from the provided JSON data. Ignore repetitive fields and ensure the design focuses on clarity.
    - **summary**: This key should contain a concise summary of the content of file to which provided JSON data belongs.
    
    You should only respond with this JSON object and nothing else. Avoid any additional text or lines. Do not mention JSON data word in response. 
    `;

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
