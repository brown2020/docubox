import { TermsPartOne } from "@/components/legal/TermsPartOne";
import { TermsPartTwo } from "@/components/legal/TermsPartTwo";

type Props = {
  companyName: string;
  companyEmail: string;
  privacyLink: string;
  updatedAt: string;
};

export default function TermsContent({
  companyName,
  companyEmail,
  privacyLink,
  updatedAt,
}: Props) {
  const props = { companyName, companyEmail, privacyLink, updatedAt };
  return (
    <div className="text-wrapper">
      <TermsPartOne {...props} />
      <TermsPartTwo {...props} />
    </div>
  );
}
