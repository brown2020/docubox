import { createOpenAI } from "@ai-sdk/openai";

/**
 * Default model for AI operations.
 */
export const DEFAULT_MODEL = "gpt-4.1" as const;

/**
 * Creates an OpenAI client instance.
 * Uses provided API key or falls back to environment variable.
 */
export function getOpenAIClient(apiKey?: string | null) {
  return createOpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  });
}

/**
 * Gets the OpenAI model by name.
 * Validates that the model is supported.
 */
export function getModel(
  client: ReturnType<typeof createOpenAI>,
  modelName: string = DEFAULT_MODEL
) {
  const supportedModels = ["gpt-4.1", "gpt-4o", "gpt-4o-mini"] as const;

  if (
    !supportedModels.includes(modelName as (typeof supportedModels)[number])
  ) {
    throw new Error(
      `Unsupported model: ${modelName}. Supported models: ${supportedModels.join(
        ", "
      )}`
    );
  }

  return client(modelName);
}




