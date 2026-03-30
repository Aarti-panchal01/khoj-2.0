const LegalPageLayout = ({ title, children }) => (
  <div className="min-h-0 flex-1 bg-gradient-to-br from-blue-50 via-white to-primary-50 py-[48px] px-6 sm:px-6">
    <article className="mx-auto max-w-[760px]">
      <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
        Legal
      </span>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>
      <div className="prose prose-gray mt-10 max-w-none space-y-10">
        {children}
      </div>
      <div className="mt-12 rounded-xl border border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-gray-700">
        Have questions? Reach us at{' '}
        <a href="mailto:khojapp.team@gmail.com" className="font-semibold text-primary-700 hover:underline">
          khojapp.team@gmail.com
        </a>
      </div>
    </article>
  </div>
);

export const LegalSection = ({ heading, children }) => (
  <section>
    <h2 className="text-xl font-semibold text-gray-900">{heading}</h2>
    <div className="mt-3 text-base leading-relaxed text-gray-600 space-y-3">{children}</div>
  </section>
);

export default LegalPageLayout;
