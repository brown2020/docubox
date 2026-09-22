import type { Metadata } from "next";
import TermsPage from "@/components/TermsPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Docubox terms of service.",
};

export default function Terms() {
  return (
    <TermsPage
      companyName="Docubox.ai"
      companyEmail="info@ignitechannel.com"
      updatedAt={"September 1, 2024"}
      privacyLink={"/privacy"}
    />
  );
}
