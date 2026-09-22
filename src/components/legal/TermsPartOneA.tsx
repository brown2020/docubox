import { TermsPartOneA1 } from "@/components/legal/TermsPartOneA1";
import { TermsPartOneA2 } from "@/components/legal/TermsPartOneA2";

type Props = {
  companyName: string;
  companyEmail: string;
  privacyLink: string;
  updatedAt: string;
};

export function TermsPartOneA(props: Props) {
  return (
    <>
      <TermsPartOneA1 {...props} />
      <TermsPartOneA2 {...props} />
    </>
  );
}
