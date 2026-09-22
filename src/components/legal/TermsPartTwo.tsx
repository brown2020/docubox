type Props = {
  companyName: string;
  companyEmail: string;
  privacyLink: string;
  updatedAt: string;
};

export function TermsPartTwo({
  companyName,
  companyEmail,
  updatedAt,
}: Props) {
  return (
    <>
      <h4>Precautions</h4>
      <p className="uppercase">
        THE SERVICES ARE NOT A MEDICAL DEVICE AND YOU EXPRESSLY AGREE THAT THE
        SERVICES DO NOT INVOLVE THE PROVISION OF MEDICAL ADVICE BY
        {companyName}. THE SERVICES ARE NOT INTENDED TO DIAGNOSE, TREAT, CURE,
        OR PREVENT ANY DISEASE OR MEDICAL CONDITION. THE SERVICES ARE FOR
        INFORMATIONAL PURPOSES ONLY AND CANNOT REPLACE THE SERVICES OF
        PHYSICIANS OR MEDICAL PROFESSIONALS.
      </p>
      <p className="uppercase">
        THE SERVICES, INCLUDING ALL INFORMATION, TEXT, PHOTOGRAPHS, IMAGES,
        ILLUSTRATIONS, GRAPHICS, AUDIO, VIDEO, AND AUDIO-VIDEO CLIPS, AND OTHER
        MATERIALS, WHETHER PROVIDED BY US OR THIRD PARTIES, IS NOT INTENDED TO
        BE AND SHOULD NOT BE USED IN PLACE OF (a) THE ADVICE OF YOUR PHYSICIAN
        OR OTHER MEDICAL PROFESSIONALS, (b) A VISIT, CALL, OR CONSULTATION WITH
        YOUR PHYSICIAN OR OTHER MEDICAL PROFESSIONALS, OR (c) INFORMATION
        CONTAINED ON OR IN ANY PRODUCT PACKAGING OR LABEL.
      </p>
      <p className="uppercase">
        SHOULD YOU HAVE ANY HEALTH-RELATED QUESTIONS, PLEASE CALL OR SEE YOUR
        PHYSICIAN OR OTHER MEDICAL PROVIDER PROMPTLY. SHOULD YOU HAVE AN
        EMERGENCY, CALL YOUR PHYSICIAN OR 911 IMMEDIATELY. YOU SHOULD NEVER
        DISREGARD MEDICAL ADVICE OR DELAY IN SEEKING MEDICAL ADVICE BECAUSE OF
        ANY INFORMATION PRESENTED ON THE SERVICES, AND YOU SHOULD NOT USE THE
        SERVICES OR ANY INFORMATION PROVIDED IN THE SERVICES FOR DIAGNOSING OR
        TREATING A HEALTH PROBLEM. THE TRANSMISSION AND RECEIPT OF SERVICES, IN
        WHOLE OR IN PART, OR COMMUNICATION VIA THE INTERNET, EMAIL, OR OTHER
        MEANS DOES NOT CONSTITUTE OR CREATE A DOCTOR-PATIENT, THERAPIST-PATIENT,
        OR OTHER HEALTHCARE PROFESSIONAL RELATIONSHIP BETWEEN YOU AND
        {companyName}.
      </p>
      <p>
        You should always consult a physician before making any changes to your
        sleep or activity based on information provided through the Services, or
        if you have any questions regarding a medical condition.
        {companyName} is not responsible for any health problems that may result
        from information you learn about through the Services. If you make any
        change to your sleep or activity based on the Services, you agree that
        you do so fully at your own risk. It is important to be sensitive to
        your body&apos;s responses. For example, if you feel unexpected,
        repeating, or long-term pain, or fatigue or discomfort due to having
        made changes to your sleep or activity, it is recommended that you
        consult a physician before continuing with such changes. The information
        in the Services may be misleading if your physiological functions and
        responses differ significantly from population averages due to medical
        conditions or rare natural differences.
      </p>
      <p>
        The Services may provide links to other websites maintained by third
        parties. You acknowledge and agree that such links are provided for your
        convenience only and do not reflect any endorsement, affiliation,
        relationship, or sponsorship by {companyName} with respect to the
        provider of such linked site or the quality, reliability, or any other
        characteristic or feature of such linked site. You further acknowledge
        and agree that {companyName} is not responsible in any manner (including
        without limitation with respect to any loss or injury you may suffer)
        for any matter associated with the linked site, including without
        limitation, the content provided on or through any such linked site or
        your reliance thereon. In addition, you should be aware that your use of
        any third party site is subject to the terms and conditions applicable
        to that site, including the privacy policies (or lack thereof) of such
        site. If a third party links to the Services, it is not necessarily an
        indication of endorsement, affiliation, relationship, or sponsorship by
        or with {companyName}. {companyName} may not even be aware that a third
        party has linked to the Services.
      </p>
      <p>
        Any other content not owned by {companyName} is owned by its respective
        owner. You acknowledge and agree that such content is provided by its
        owner and does not reflect any endorsement, affiliation, relationship,
        or sponsorship by {companyName} with respect to the provider of such
        content. You further acknowledge and agree that
        {companyName} is not liable or responsible in any manner (including
        without limitation with respect to any loss or injury you may suffer)
        for any content provided by third parties including, without limitation,
        your reliance thereon. {companyName} MAKES NO REPRESENTATIONS OR
        WARRANTIES WITH RESPECT TO ANY THIRD PARTY CONTENT.
      </p>
      <p>
        You agree to indemnify, hold harmless, and defend {companyName}, its
        subsidiaries, affiliates, officers, directors, employees,
        representatives, agents, partners, licensors, successors, and assigns,
        from and against any action, cause, claim, damage, debt, demand, or
        liability, including reasonable costs and attorneys’ fees, asserted by
        any person, arising out of or relating to (i) your use of the Services,
        including but not limited to anyone using your account or Credentials;
        (ii) breach of this Agreement by you or anyone using your account or
        Credentials; (iii) any information used, stored, or transmitted in
        connection with your account or Credentials; (iv) breach of the rights
        of any third party, including but not limited to privacy, publicity,
        intellectual property, or other proprietary rights by you or anyone
        using your account or Credentials; or (v) violation of any law,
        regulation, or other legal requirement.
      </p>
      <h4>Notice for California Users</h4>
      <p>
        Under California Civil Code Section 1789.3, California users of the
        Services are entitled to the following specific consumer rights notice:
      </p>
      <h5>
        The Complaint Assistance Unit of the Division of Consumer Services of
        the California Department of Consumer Affairs may be contacted in
        writing at 1625 N. Market Blvd., Suite N 112, Sacramento, California
        95834, or by telephone at (800) 952-5210.
      </h5>
      <h4>Termination; Cancellation</h4>
      <p>
        This Agreement shall continue in full force until terminated or canceled
        pursuant to this Agreement.
      </p>
      <p>
        {companyName} shall have the right to terminate this Agreement (i) for
        any reason whatsoever by providing thirty (30) days’ notice to you; (ii)
        immediately for your material breach of this Agreement, other than
        non-payment of Fees; or (iii) for non-payment of Fees. Notwithstanding
        the foregoing, {companyName} reserves the right, in its sole discretion
        and without notice, at any time and for any reason, to remove, modify,
        suspend, or disable access to all or any portion of the Services.
      </p>
      <p>
        You may terminate the Agreement for any reason whatsoever by providing
        thirty (30) days’ notice to {companyName} by email at {companyEmail}.
        You shall be responsible for all Fees incurred prior to and during the
        notice period.
      </p>
      <p>
        Sections titled Precautions, Intellectual Property Rights, Data and
        Communications, Indemnification, Warranty Disclaimer, Limitation of
        Liability, Governing Law, Forum; Mandatory Binding Arbitration; Class
        Action Waiver, and payment obligations for Fees incurred prior to and
        during any notice period shall survive termination of this Agreement for
        any reason whatsoever.
      </p>
      <h4>Federal Government End Use Restrictions</h4>
      <p>
        If you are a U.S. federal government department or agency or are
        contracting on behalf of such a department or agency, Services are
        “Commercial Items” as that term is defined at 48 C.F.R. §2.101,
        consisting of “Commercial Computer Software” and “Commercial Computer
        Software Documentation,” as those terms are used in 48 C.F.R. §12.212 or
        48 C.F.R. §227.7202. Consistent with 48 C.F.R. §12.212 or 48 C.F.R.
        §227.7202-1 through 227.7202-4, as applicable, the Service is licensed
        to you with only those rights as provided under the terms and conditions
        of this Agreement.
      </p>
      <h4>Export Compliance and Use Restrictions</h4>
      <p>
        You will not directly or indirectly export or re-export the Services, or
        any technical information related thereto, to any destination or person
        prohibited or restricted by applicable law, including, without
        limitation, all applicable U.S. export control laws and regulations.
      </p>
      <h4>
        Governing Law; Forum; Mandatory Binding Arbitration, Class Action Waiver
      </h4>
      <p>
        Any action related to this Agreement, the Services, and your
        relationship with {companyName} shall be governed by, construed, and
        interpreted in accordance with the laws of the State of California
        without regard to its conflict of laws principles AND WILL SPECIFICALLY
        NOT BE GOVERNED BY THE UNITED NATIONS CONVENTIONS ON CONTRACTS FOR THE
        INTERNATIONAL SALE OF GOODS, IF OTHERWISE APPLICABLE. You agree to
        resolve any disputes or claims arising out of or related to this
        Agreement or the Services through final and binding arbitration by a
        single arbitrator. This includes disputes arising out of or relating to
        interpretation or application of this “Mandatory Arbitration Provision”
        section, including its enforceability, revocability, or validity.
        Notwithstanding the foregoing, either party may bring a lawsuit solely
        for injunctive relief to stop unauthorized use or abuse of the Services,
        or violation of any intellectual property. Subject to the Mandatory
        Arbitration Provision, the parties irrevocably consent to bring any
        action to resolve or enforce claims arising under or relating to this
        Agreement in the federal or state courts in San Francisco, California,
        and each party irrevocably submits to the exclusive jurisdiction of such
        courts in any such suit, action, or proceeding. Except to the extent
        prohibited by applicable law, the parties agree that any claim or cause
        of action arising out of or related to use of the Services or this
        Agreement must be filed within one (1) year after such claim or cause of
        action arose or be forever barred. This paragraph does not apply to
        users who reside in the European Union. If you are a user based in the
        European Union, then Finnish law shall apply to this Agreement and the
        Finnish courts shall have exclusive jurisdiction to hear disputes
        arising in relation to this Agreement. This provision shall not apply to
        consumers in countries that require agreements to be governed by the
        local laws of the consumer&apos;s country. The English language shall
        govern all documents, notices, and interpretations of these Agreement.
        You also agree to waive any right to assert any claims against
        {companyName} as a representative or member in any class or
        representative action, except where such waiver is prohibited by law or
        deemed by a court of law to be against public policy.
      </p>
      <h4>Miscellaneous</h4>
      <p>
        You acknowledge that {companyName} has the right to monitor use of the
        Services to ensure compliance with the Agreement.
      </p>
      <p>
        No waiver of any term, provision, or condition of this Agreement,
        whether by conduct or otherwise, in any one or more instances, shall be
        deemed to be, or shall constitute, a waiver of any other term,
        provision, or condition hereof, whether or not similar, nor shall such
        waiver constitute a continuing waiver of any such term, provision, or
        condition hereof. No waiver shall be binding unless executed in writing
        by the party making the waiver.
      </p>
      <p>
        You may not assign this Agreement to any other party and any attempt to
        do so is void.
      </p>
      <p>
        If any provision of this Agreement is determined to be illegal or
        unenforceable, then such provision will be enforced to the maximum
        extent possible, and the other provisions will remain fully effective
        and enforceable.
      </p>
      <p>
        This Agreement and the Privacy Policy constitute the complete and
        exclusive statement of the agreement between you and {companyName}
        regarding the Services, and supersedes any and all prior or
        contemporaneous communications, representations, statements, and
        understandings, whether oral or written, between the parties.
      </p>
      <p>
        In case of any conflict between the terms of this Agreement and the
        terms of the Privacy Policy, the terms of this Agreement shall prevail.
      </p>
      <h4>Modification of the Terms and Services</h4>
      <p>
        {companyName} reserves the right to update this Agreement and/or the
        Privacy Policy at any time and for any reason in its sole discretion by
        posting updated terms. Unless otherwise indicated by
        {companyName}, any changes will become effective on a prospective basis
        from the date of posting. {companyName} will notify you of any material
        changes to the Agreement or Services. By continuing to access or use the
        Services after we have provided you with notice of a modification, you
        are agreeing to be bound by the modified Agreement. If the modified
        Agreement is not acceptable to you, your only recourse is to cease using
        the Services. {companyName} and its third-party service providers may
        make improvements and/or changes in the Services, features, and prices
        described at any time and for any reason in its sole discretion. The
        Mobile Apps may download and install upgrades, updates, and additional
        features in order to improve, enhance, and further develop the Services.{" "}
        {companyName} reserves the right at any time to modify or discontinue,
        temporarily or permanently, the Services or any portion thereof with or
        without notice. You agree that
        {companyName} shall not be liable to you or to any third party for any
        modification, suspension, or discontinuance of the Services.
      </p>
      <h5>Last Updated: {updatedAt}</h5>
    </>
  );
}
