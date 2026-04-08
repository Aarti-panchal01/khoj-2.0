const HowItWorks = () => (
  <div className="min-h-0 flex-1 py-10 sm:py-12 px-6">
    <div className="mx-auto max-w-[860px]">
      <div className="khoj-paper rounded-3xl px-6 sm:px-10 py-10 sm:py-12">
        <p className="text-xs font-extrabold tracking-[0.16em] khoj-heading text-primary-900">
          CAMPUS BULLETIN
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl khoj-heading font-extrabold leading-[0.92] text-ink-950">
          How it works
        </h1>
        <p className="mt-4 text-ink-700 leading-relaxed">
          A simple flow that feels like a noticeboard — post fast, scan faster, and reunite items with owners.
        </p>

        <ol className="mt-8 space-y-3">
          <li className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-surface-0 px-4 py-4">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500 text-ink-950 font-extrabold khoj-heading leading-none">1</span>
            <div>
              <p className="font-extrabold text-ink-950 khoj-heading">Pick your campus</p>
              <p className="text-sm text-ink-700 mt-0.5">Sign up and choose your university (and campus) during onboarding.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-surface-0 px-4 py-4">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500 text-ink-950 font-extrabold khoj-heading leading-none">2</span>
            <div>
              <p className="font-extrabold text-ink-950 khoj-heading">Browse the feed</p>
              <p className="text-sm text-ink-700 mt-0.5">Scan lost/found posts with clear, high-contrast badges.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-surface-0 px-4 py-4">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500 text-ink-950 font-extrabold khoj-heading leading-none">3</span>
            <div>
              <p className="font-extrabold text-ink-950 khoj-heading">Filter fast</p>
              <p className="text-sm text-ink-700 mt-0.5">Use search, category, and campus filters to narrow things down.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-surface-0 px-4 py-4">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500 text-ink-950 font-extrabold khoj-heading leading-none">4</span>
            <div>
              <p className="font-extrabold text-ink-950 khoj-heading">Lost vs found behaves differently</p>
              <p className="text-sm text-ink-700 mt-0.5">
                For found items, owners submit a claim. For lost items, others can contact you using your chosen preference.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-surface-0 px-4 py-4">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500 text-ink-950 font-extrabold khoj-heading leading-none">5</span>
            <div>
              <p className="font-extrabold text-ink-950 khoj-heading">Close the loop</p>
              <p className="text-sm text-ink-700 mt-0.5">When it’s resolved, mark it and move on — cleaner feed for everyone.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
);

export default HowItWorks;
