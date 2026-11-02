import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, getModel, getOpenAIClient } from "@/lib/ai";

describe("AI model ids", () => {
  it("keeps the default and supported OpenAI model ids", () => {
    expect(DEFAULT_MODEL).toBe("gpt-4.1");
    const client = getOpenAIClient("test-key");
    expect(() => getModel(client, "gpt-5")).toThrow(
      /gpt-4\.1, gpt-4o, gpt-4o-mini/
    );
    expect(getModel(client).modelId).toBe("gpt-4.1");
    expect(getModel(client, "gpt-4o-mini").modelId).toBe("gpt-4o-mini");
  });
});
