"use client";

import { getApiKey } from "@/actions/getApiKeys";
import { creditsToMinus } from "@/utils/credits";
import { ProfileState } from "@/zustand/useProfileStore";

export type APIType = "unstructured" | "open-ai" | "ragie";

const defaultCredits = {
    "open-ai": 4,
    "unstructured": 4,
    "ragie": 8
}

const handleAPIAndCredits = async (
    apiType: APIType,
    profileData: ProfileState,
    callback: (apiKey: string) => Promise<void>
): Promise<void> => {
    const apiKeyField = apiType === "open-ai" ? "openai_api_key" : apiType === "ragie" ? "ragie_api_key" : `unstructured_api_key`;
    const apiKey = profileData.profile[apiKeyField as keyof ProfileState["profile"]];

    const creditEnvKey = apiType === "open-ai" ? "NEXT_PUBLIC_CREDITS_PER_OPEN_AI" : `NEXT_PUBLIC_CREDITS_PER_${apiType.toUpperCase()}`;
    const requiredCredits = Number(process.env[creditEnvKey] || defaultCredits[apiType]);

    if (profileData.profile.useCredits) {
        if (profileData.profile.credits < requiredCredits) {
            throw new Error("Insufficient credits");
        }
        const envApiKey = await getApiKey(apiType);
        if (!envApiKey) {
            throw new Error(`Missing environment API key for ${apiType}`);
        }

        await callback(envApiKey);
        profileData.minusCredits(creditsToMinus(apiType));
    } else {
        if (!apiKey) {
            throw new Error(
                `No API key found for ${apiType === "open-ai" ? "OpenAI" : apiType.charAt(0).toUpperCase() + apiType.slice(1)} API / Credits not enabled`
            );
        }
        await callback(apiKey as string);
    }
};

export { handleAPIAndCredits };