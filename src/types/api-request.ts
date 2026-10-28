/**
 * How a server action should authenticate to a third-party API.
 * Platform keys are never sent to the browser. When `useCredits` is true the
 * server loads its own key and ignores `userApiKey`.
 */
export type ApiRequest = {
  useCredits: boolean;
  userApiKey?: string | null;
};

export function isApiRequest(value: unknown): value is ApiRequest {
  if (!value || typeof value !== "object") return false;
  const record = value as ApiRequest;
  if (typeof record.useCredits !== "boolean") return false;
  if (record.userApiKey != null && typeof record.userApiKey !== "string") {
    return false;
  }
  return true;
}

export type ApiKeySource = "platform" | "user";

/**
 * Picks the key source. Platform mode never falls through to a caller-supplied key.
 */
export function selectApiKey(input: {
  useCredits: boolean;
  userApiKey?: string | null;
  platformKey?: string | null;
  force?: ApiKeySource;
}): { source: ApiKeySource; apiKey: string } {
  const source = input.force ?? (input.useCredits ? "platform" : "user");
  if (source === "platform") {
    const platformKey = input.platformKey?.trim();
    if (!platformKey) {
      throw new Error("Platform API key is not configured. Please contact support.");
    }
    return { source, apiKey: platformKey };
  }

  const userApiKey = input.userApiKey?.trim();
  if (!userApiKey) {
    throw new Error("API key is required. Add one in profile settings or enable credits.");
  }
  return { source: "user", apiKey: userApiKey };
}

/**
 * Which Ragie account indexed this file.
 * An explicit false never uses the platform key, even if the caller has credits on.
 * Missing flag is legacy data and follows the caller's current mode.
 */
export function ragieKeyMode(
  ragieUsesPlatformKey: boolean | null | undefined,
  useCredits: boolean
): ApiKeySource {
  if (ragieUsesPlatformKey === true) return "platform";
  if (ragieUsesPlatformKey === false) return "user";
  return useCredits ? "platform" : "user";
}
