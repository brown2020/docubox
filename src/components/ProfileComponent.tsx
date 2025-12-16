"use client";

import Link from "next/link";
import useProfileStore from "@/zustand/useProfileStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ApiKeyInput } from "./common/ApiKeyInput";
import { logger } from "@/lib/logger";
import { Button } from "./ui/button";

export default function ProfileComponent() {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const [unstructuredApiKey, setUnstructuredApiKey] = useState(
    profile.unstructured_api_key
  );
  const [openaiApiKey, setOpenaiApiKey] = useState(profile.openai_api_key);
  const [ragieApiKey, setRagieApiKey] = useState(profile.ragie_api_key);
  const [useCredits, setUseCredits] = useState(profile.useCredits);

  // Sync local state when profile changes
  useEffect(() => {
    // Defer updates to avoid synchronous setState inside effects (React Compiler rule).
    queueMicrotask(() => {
      setUnstructuredApiKey(profile.unstructured_api_key);
      setOpenaiApiKey(profile.openai_api_key);
      setRagieApiKey(profile.ragie_api_key);
      setUseCredits(profile.useCredits);
    });
  }, [
    profile.unstructured_api_key,
    profile.openai_api_key,
    profile.ragie_api_key,
    profile.useCredits,
  ]);

  const hasChanges =
    unstructuredApiKey !== profile.unstructured_api_key ||
    openaiApiKey !== profile.openai_api_key ||
    ragieApiKey !== profile.ragie_api_key;

  const handleApiKeyChange = async () => {
    if (!hasChanges) return;

    const toastId = toast.loading("Updating API keys...");
    try {
      await updateProfile({
        unstructured_api_key: unstructuredApiKey,
        openai_api_key: openaiApiKey,
        ragie_api_key: ragieApiKey,
      });
      toast.success("API keys updated successfully!", { id: toastId });
    } catch (error) {
      logger.error("ProfileComponent", "Error updating API keys", error);
      toast.error("Failed to update API keys", { id: toastId });
    }
  };

  const handleCreditsChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newUseCredits = e.target.value === "credits";
    setUseCredits(newUseCredits);
    await updateProfile({ useCredits: newUseCredits });
  };

  const areApiKeysAvailable = unstructuredApiKey && openaiApiKey && ragieApiKey;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <div className="flex gap-2 w-full items-center">
          <div className="flex-1">
            Usage Credits:{" "}
            <span className="font-semibold">{Math.round(profile.credits)}</span>
          </div>
          <Button asChild>
            <Link href="/payment-attempt">Buy 10,000 Credits</Link>
          </Button>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          You can either buy credits or add your own API keys for Unstructured,
          OpenAI, and Ragie.
        </div>
      </div>

      <div className="flex flex-col px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <ApiKeyInput
          id="unstructured-api-key"
          label="Unstructured API Key"
          value={unstructuredApiKey}
          onChange={setUnstructuredApiKey}
          placeholder="Enter your Unstructured API Key"
        />

        <ApiKeyInput
          id="openai-api-key"
          label="OpenAI API Key"
          value={openaiApiKey}
          onChange={setOpenaiApiKey}
          placeholder="Enter your OpenAI API Key"
        />

        <ApiKeyInput
          id="ragie-api-key"
          label="Ragie API Key"
          value={ragieApiKey}
          onChange={setRagieApiKey}
          placeholder="Enter your Ragie API Key"
        />

        <Button onClick={handleApiKeyChange} disabled={!hasChanges}>
          Update API Keys
        </Button>
      </div>

      <div className="flex items-center px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <label htmlFor="toggle-use-credits" className="text-sm font-medium">
          Use:
        </label>
        <select
          id="toggle-use-credits"
          value={useCredits ? "credits" : "apikeys"}
          onChange={handleCreditsChange}
          className="border border-input rounded-md px-3 py-2 h-10 bg-background"
          disabled={!areApiKeysAvailable}
        >
          <option value="credits">Credits</option>
          {areApiKeysAvailable && <option value="apikeys">API Keys</option>}
        </select>
      </div>
    </div>
  );
}
