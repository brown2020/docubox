import { createOpenAI } from "@ai-sdk/openai";

/**
 * Default model for AI operations.
 */
export const DEFAULT_MODEL = "gpt-4.1" as const;

/**
 * Creates an OpenAI client instance for a key the server already resolved.
 * Does not read OPENAI_API_KEY; callers pass either the platform key or the user's key.
 */
export function getOpenAIClient(apiKey: string) {
  if (!apiKey) {
    throw new Error("OpenAI API key is required.");
  }
  return createOpenAI({ apiKey });
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

