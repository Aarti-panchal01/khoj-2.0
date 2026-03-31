import LegalPageLayout, { LegalSection } from '../../components/legal/LegalPageLayout';

const Terms = () => (
  <LegalPageLayout title="Terms of Service">
    <LegalSection heading="Acceptance">
      <p>
        By using Khoj at khojapp.in, you agree to these Terms of Service. If you do not agree, please do not use the platform.
        These terms apply to all users including guests who browse without an account.
      </p>
    </LegalSection>
    <LegalSection heading="Who Can Use Khoj">
      <p>
        Khoj is designed for students, faculty, and staff of universities listed on the platform. You must provide accurate
        information about your university affiliation during onboarding. Providing false affiliation information is a violation
        of these terms.
      </p>
    </LegalSection>
    <LegalSection heading="Your Account">
      <p>
        You are responsible for keeping your account credentials secure. Do not share your account with others. You are
        responsible for all activity that occurs under your account. Notify us immediately at khojapp.team@gmail.com if you
        suspect unauthorised access.
      </p>
    </LegalSection>
    <LegalSection heading="Acceptable Use">
      <p>
        You may only post items that are genuinely lost or found. All information in your posts must be accurate to the best
        of your knowledge. You must not post items that are illegal, counterfeit, hazardous, or that violate any applicable law.
      </p>
      <p>
        You must not use Khoj to harass, threaten, or abuse other users. You must not use the platform for spam, advertising,
        or any commercial purpose. You must not attempt to scrape, reverse-engineer, or exploit the platform in any way.
      </p>
    </LegalSection>
    <LegalSection heading="Claims &amp; Rewards">
      <p>
        The claims system exists to verify item ownership. Submitting a false claim is a serious violation and will result in
        immediate account suspension. Any rewards offered by item posters are voluntary, private agreements between users. Khoj
        does not facilitate, process, or guarantee any payments or rewards. Khoj is not liable for any disputes arising from reward arrangements.
      </p>
    </LegalSection>
    <LegalSection heading="Content Ownership">
      <p>
        You retain ownership of the content you post on Khoj. By posting, you grant Khoj a non-exclusive, royalty-free licence
        to display your content on the platform for the purpose of operating the service.
      </p>
    </LegalSection>
    <LegalSection heading="Termination">
      <p>
        We reserve the right to suspend or permanently terminate any account that violates these terms, at our sole discretion,
        without prior notice. You may delete your account at any time by contacting khojapp.team@gmail.com.
      </p>
    </LegalSection>
    <LegalSection heading="Limitation of Liability">
      <p>
        Khoj is a platform that connects users — we do not verify the accuracy of item posts or the identity of users beyond their
        stated university affiliation. To the fullest extent permitted by law, Khoj is not liable for any loss, damage, or dispute
        arising from interactions between users on the platform.
      </p>
    </LegalSection>
    <LegalSection heading="Governing Law">
      <p>
        These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts
        in Bengaluru, Karnataka.
      </p>
    </LegalSection>
  </LegalPageLayout>
);

export default Terms;
