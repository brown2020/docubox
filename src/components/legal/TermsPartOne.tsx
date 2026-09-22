import { TermsPartOneA } from "@/components/legal/TermsPartOneA";
import { TermsPartOneB } from "@/components/legal/TermsPartOneB";

type Props = {
  companyName: string;
  companyEmail: string;
  privacyLink: string;
  updatedAt: string;
};

export function TermsPartOne(props: Props) {
  return (
    <>
      <TermsPartOneA {...props} />
      <TermsPartOneB {...props} />
    </>
  );
}
