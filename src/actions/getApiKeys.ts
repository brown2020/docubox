'use server'

import { APIType } from "@/utils/useApiAndCreditKeys";


export async function getApiKey(type: APIType): Promise<string> {
  let apiKey;
  switch (type) {
    case 'unstructured':
      apiKey = process.env.UNSTRUCTURED_API_KEY;
      break;
    case 'open-ai':
      apiKey = process.env.OPENAI_API_KEY;
      break;
    case 'ragie':
      apiKey = process.env.RAGIE_API_KEY;
      break;
    default:
      throw new Error('Invalid API type');
  }

  if (!apiKey) {
    throw new Error('API key not found');
  }

  return apiKey;
}