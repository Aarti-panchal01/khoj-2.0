const About = () => (
  <div className="min-h-0 flex-1 py-10 sm:py-12 px-6">
    <div className="mx-auto max-w-[860px]">
      <div className="khoj-paper rounded-3xl px-6 sm:px-10 py-10 sm:py-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] khoj-heading text-primary-900">
              CAMPUS BULLETIN
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl khoj-heading font-extrabold leading-[0.92] text-ink-950">
              About Khoj
            </h1>
            <p className="mt-4 text-ink-700 leading-relaxed">
              Khoj is a campus lost &amp; found app for Bengaluru students. Post lost or found items, browse your campus feed,
              and reconnect people with their stuff — without the chaos of scattered group chats.
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3">
              <p className="text-xs text-ink-700 font-semibold">Designed for</p>
              <p className="text-2xl khoj-heading font-extrabold text-ink-950 leading-none">Students</p>
              <p className="text-xs text-ink-600 mt-1">18–24 · mobile-first</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-ink-200 bg-surface-0 px-4 py-4">
            <p className="text-xs font-extrabold tracking-[0.16em] khoj-heading text-ink-600">WHY</p>
            <p className="mt-1 text-sm text-ink-800">
              Because “lost &amp; found” shouldn’t mean scrolling forever or waiting on a group chat admin.
            </p>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-surface-0 px-4 py-4">
            <p className="text-xs font-extrabold tracking-[0.16em] khoj-heading text-ink-600">HOW</p>
            <p className="mt-1 text-sm text-ink-800">
              A campus-scoped feed, clear lost vs found signals, and quick posting — built for real student timelines.
            </p>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-surface-0 px-4 py-4">
            <p className="text-xs font-extrabold tracking-[0.16em] khoj-heading text-ink-600">WHAT</p>
            <p className="mt-1 text-sm text-ink-800">
              A calm place to post, browse, claim, and close the loop when an item is reunited.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default About;
