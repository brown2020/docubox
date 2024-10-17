const parseEnvVarToNumber = (
  envVar: string | undefined,
  fallback: number
): number => {
  return envVar ? parseInt(envVar, 10) : fallback
}

export const creditsToMinus = (model: 'open-ai' | 'unstructured' | 'ragie'): number => {
  if (model === "open-ai") {
    return parseEnvVarToNumber(
      process.env.NEXT_PUBLIC_CREDITS_PER_OPEN_AI,
      4
    )
  } else if (model == "unstructured") {
    return parseEnvVarToNumber(
      process.env.NEXT_PUBLIC_CREDITS_PER_UNSTRUCTURED,
      4
    )
  }  else if (model == "ragie") {
    return parseEnvVarToNumber(
      process.env.NEXT_PUBLIC_CREDITS_PER_RAGIE,
      4
    )
  }

  return 4
}
