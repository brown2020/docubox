"use client";

import Link from "next/link";
import useProfileStore from "@/zustand/useProfileStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
    setUnstructuredApiKey(profile.unstructured_api_key);
    setOpenaiApiKey(profile.openai_api_key);
    setRagieApiKey(profile.ragie_api_key);
    setUseCredits(profile.useCredits);
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
      console.error("Error updating API keys:", error);
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
            Usage Credits: {Math.round(profile.credits)}
          </div>
          <Link
            className="bg-primary text-white px-3 py-2 rounded-md hover:opacity-50 flex-1 text-center"
            href={"/payment-attempt"}
          >
            Buy 10,000 Credits
          </Link>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          You can either buy credits or add your own API keys for Unstructured,
          OpenAI, and Ragie.
        </div>
      </div>

      <div className="flex flex-col px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <label htmlFor="unstructured-api-key" className="text-sm font-medium">
          Unstructured API Key:
        </label>
        <input
          type="password"
          id="unstructured-api-key"
          value={unstructuredApiKey}
          onChange={(e) => setUnstructuredApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your Unstructured API Key"
        />

        <label htmlFor="openai-api-key" className="text-sm font-medium">
          OpenAI API Key:
        </label>
        <input
          type="password"
          id="openai-api-key"
          value={openaiApiKey}
          onChange={(e) => setOpenaiApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your OpenAI API Key"
        />

        <label htmlFor="ragie-api-key" className="text-sm font-medium">
          Ragie API Key:
        </label>
        <input
          type="password"
          id="ragie-api-key"
          value={ragieApiKey}
          onChange={(e) => setRagieApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          placeholder="Enter your Ragie API Key"
        />

        <button
          onClick={handleApiKeyChange}
          disabled={!hasChanges}
          className="bg-primary text-white px-3 py-2 rounded-md hover:opacity-50 disabled:opacity-50"
        >
          Update API Keys
        </button>
      </div>

      <div className="flex items-center px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <label htmlFor="toggle-use-credits" className="text-sm font-medium">
          Use:
        </label>
        <select
          id="toggle-use-credits"
          value={useCredits ? "credits" : "apikeys"}
          onChange={handleCreditsChange}
          className="border border-gray-300 rounded-md px-3 py-2 h-10"
          disabled={!areApiKeysAvailable}
        >
          <option value="credits">Credits</option>
          {areApiKeysAvailable && <option value="apikeys">API Keys</option>}
        </select>
      </div>
    </div>
  );
}
