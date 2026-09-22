import TermsContent from "@/components/legal/TermsContent";

type Props = {
  companyName: string;
  companyEmail: string;
  privacyLink: string;
  updatedAt: string;
};

export default function Terms(props: Props) {
  return <TermsContent {...props} />;
}
