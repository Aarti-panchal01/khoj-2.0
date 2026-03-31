import LegalPageLayout, { LegalSection } from '../../components/legal/LegalPageLayout';

const PrivacyPolicy = () => (
  <LegalPageLayout title="Privacy Policy">
    <LegalSection heading="Who We Are">
      <p>
        Khoj is a campus lost and found platform operating at khojapp.in, built for students across Bengaluru.
        We are committed to being transparent about how we handle your personal information.
      </p>
    </LegalSection>
    <LegalSection heading="What We Collect">
      <p>
        When you create an account, we collect your name and email address. If you sign up with Google, these are
        provided directly by Google. We also collect your university and campus during onboarding to personalise your feed.
      </p>
      <p>
        If you choose to add a phone number, it is collected only when you initiate contact with another user. You are never
        required to add a phone number to browse or post.
      </p>
      <p>
        We store content you create: item titles, descriptions, categories, locations, dates, and images you upload.
      </p>
    </LegalSection>
    <LegalSection heading="How We Use Your Data">
      <p>
        Your university is used exclusively to filter your feed to show relevant posts from your institution. Your name
        appears on items you post. Your phone number is shared only with the specific user involved in a claim you approve —
        it is never publicly displayed.
      </p>
      <p>
        We do not sell, rent, or share your personal data with any third party for advertising or marketing purposes. Ever.
      </p>
    </LegalSection>
    <LegalSection heading="Images">
      <p>
        Images you upload are stored securely on Cloudinary. Please do not upload images containing sensitive personal
        information. Once uploaded, images are accessible via their direct URL.
      </p>
    </LegalSection>
    <LegalSection heading="Authentication &amp; Sessions">
      <p>
        We use JWT (JSON Web Tokens) for session management. Your access token is stored in your browser&apos;s local storage.
        Your refresh token is stored in an HTTP-only cookie, which cannot be accessed by JavaScript, for security. Sessions
        expire automatically and require re-login.
      </p>
    </LegalSection>
    <LegalSection heading="Data Retention &amp; Deletion">
      <p>
        Your account and posts remain active as long as you use Khoj. You can delete individual posts at any time from your
        profile. To request complete account deletion, email us at khojapp.team@gmail.com — we will process it within 7 business
        days and permanently remove all your data.
      </p>
    </LegalSection>
    <LegalSection heading="Your Rights">
      <p>
        You have the right to access, correct, or delete your personal data at any time. Contact us at khojapp.team@gmail.com
        for any data-related request.
      </p>
    </LegalSection>
    <LegalSection heading="Changes to This Policy">
      <p>
        We may update this policy as Khoj grows. We will notify users of significant changes via an in-app notice or email.
      </p>
    </LegalSection>
  </LegalPageLayout>
);

export default PrivacyPolicy;
