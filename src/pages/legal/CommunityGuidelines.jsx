import LegalPageLayout, { LegalSection } from '../../components/legal/LegalPageLayout';

const CommunityGuidelines = () => (
  <LegalPageLayout title="Community Guidelines">
    <p className="text-base leading-relaxed text-gray-600 -mt-4">
      Khoj works because students trust each other. These guidelines exist to keep that trust intact. Violating them may result
      in your account being suspended.
    </p>
    <LegalSection heading="Post Honestly">
      <p>
        Only post items that are genuinely lost or found. Do not create test posts, joke posts, or duplicate posts. If you have
        found your item or resolved the situation, mark your post as resolved immediately so others know.
      </p>
    </LegalSection>
    <LegalSection heading="Claim Responsibly">
      <p>
        Only claim an item if it genuinely belongs to you. Provide accurate details about where and when you lost the item —
        vague or fabricated claims waste everyone&apos;s time and damage the community&apos;s trust. False claims will result in
        permanent account suspension.
      </p>
    </LegalSection>
    <LegalSection heading="Respect Every User">
      <p>
        Every person on Khoj is a student dealing with a stressful situation. Be patient, be polite, and assume good faith.
        Harassment, threats, or abusive language of any kind will result in immediate account suspension.
      </p>
    </LegalSection>
    <LegalSection heading="Protect Privacy">
      <p>
        If a found item contains someone&apos;s personal information (ID card, documents, bank card), handle it with care. Do not
        photograph or share that personal information publicly. Report the find and let the owner claim it through the platform.
      </p>
    </LegalSection>
    <LegalSection heading="No Commercial Use">
      <p>
        Khoj is strictly for lost and found. Do not use it to sell, trade, advertise, or promote products or services of any kind.
        Commercial posts will be removed immediately.
      </p>
    </LegalSection>
    <LegalSection heading="Respond Promptly">
      <p>
        If someone submits a claim on your item, review it within a reasonable time. If you have already found your item through
        other means, update the post status so the finder is not left waiting.
      </p>
    </LegalSection>
    <LegalSection heading="Reporting Problems">
      <p>
        If you encounter a post or user that seems fraudulent, inappropriate, or suspicious, email us immediately at
        khojapp.team@gmail.com with the post details. We review all reports seriously and act quickly.
      </p>
    </LegalSection>
  </LegalPageLayout>
);

export default CommunityGuidelines;
