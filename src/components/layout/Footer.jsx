import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const KhojMark = () => (
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d1117] ring-2 ring-primary-500/40">
    <svg className="h-5 w-5 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  </div>
);

const footerLink =
  'group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] rounded-md';

const Bullet = () => (
  <span
    aria-hidden
    className="h-1.5 w-1.5 rounded-full bg-gray-600 group-hover:bg-primary-400 transition-colors"
  />
);

const SectionTitle = ({ children }) => (
  <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-4">
    {children}
  </h3>
);

const Footer = () => (
  <motion.footer
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="mt-auto text-gray-300"
  >
    {/* Smooth page-to-footer transition */}
    <div className="h-10 sm:h-14 bg-gradient-to-b from-transparent to-[#0b0f14]" aria-hidden />

    <div className="border-t border-gray-800/70 bg-[#0b0f14] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <KhojMark />
            <div>
              <p className="text-lg font-bold text-white">Khoj</p>
              <p className="text-sm font-medium text-primary-400">Don&apos;t panic. Post it.</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Lost &amp; Found, but make it campus-core. Built for Bengaluru students.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            <a href="https://www.linkedin.com/company/khoj-app" target="_blank" rel="noreferrer noopener" className="hover:text-white transition-colors" aria-label="Khoj on LinkedIn">
              <LinkedInIcon />
            </a>
            <a href="https://www.instagram.com/official.khojapp" target="_blank" rel="noreferrer noopener" className="hover:text-white transition-colors" aria-label="Khoj on Instagram">
              <InstagramIcon />
            </a>
            <a href="mailto:khojapp.team@gmail.com" className="hover:text-white transition-colors" aria-label="Email Khoj">
              <MailIcon />
            </a>
          </div>
        </div>

        {/* Desktop columns */}
        <div className="hidden lg:block">
          <SectionTitle>Platform</SectionTitle>
          <ul className="space-y-3">
            <li><Link to="/" className={footerLink}><Bullet />Home Feed</Link></li>
            <li><Link to="/post" className={footerLink}><Bullet />Report an Item</Link></li>
            <li><Link to="/claims" className={footerLink}><Bullet />My Claims</Link></li>
            <li><Link to="/profile" className={footerLink}><Bullet />My Profile</Link></li>
            <li><Link to="/notifications" className={footerLink}><Bullet />Notifications</Link></li>
          </ul>
        </div>

        <div className="hidden lg:block">
          <SectionTitle>Company</SectionTitle>
          <ul className="space-y-3">
            <li><Link to="/about" className={footerLink}><Bullet />About Khoj</Link></li>
            <li><Link to="/how-it-works" className={footerLink}><Bullet />How It Works</Link></li>
            <li><a href="https://www.linkedin.com/company/khoj-app" target="_blank" rel="noreferrer noopener" className={footerLink}><Bullet />LinkedIn</a></li>
            <li><a href="https://www.instagram.com/official.khojapp" target="_blank" rel="noreferrer noopener" className={footerLink}><Bullet />Instagram</a></li>
            <li><a href="mailto:khojapp.team@gmail.com" className={footerLink}><Bullet />Contact Us</a></li>
          </ul>
        </div>

        <div className="hidden lg:block">
          <SectionTitle>Legal</SectionTitle>
          <ul className="space-y-3 mb-6">
            <li><Link to="/privacy" className={footerLink}><Bullet />Privacy Policy</Link></li>
            <li><Link to="/terms" className={footerLink}><Bullet />Terms of Service</Link></li>
            <li><Link to="/community-guidelines" className={footerLink}><Bullet />Community Guidelines</Link></li>
          </ul>
          <div className="rounded-2xl border border-primary-500/25 bg-gradient-to-br from-primary-500/15 to-transparent px-4 py-4 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]">
            <p className="text-2xl font-bold text-primary-200">150+</p>
            <p className="text-sm text-gray-400 mt-1">Items recovered across Bengaluru</p>
            <p className="text-xs text-gray-500 mt-2">Small W’s → big campus energy.</p>
          </div>
        </div>

        {/* Mobile: accordion (no routing changes, just layout) */}
        <div className="lg:hidden sm:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <details className="group rounded-2xl border border-gray-800/70 bg-white/5 p-4 backdrop-blur-sm">
              <summary className="cursor-pointer list-none select-none flex items-center justify-between">
                <SectionTitle>Platform</SectionTitle>
                <span aria-hidden className="text-gray-500 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <ul className="space-y-3 pt-2">
                <li><Link to="/" className={footerLink}><Bullet />Home Feed</Link></li>
                <li><Link to="/post" className={footerLink}><Bullet />Report an Item</Link></li>
                <li><Link to="/claims" className={footerLink}><Bullet />My Claims</Link></li>
                <li><Link to="/profile" className={footerLink}><Bullet />My Profile</Link></li>
                <li><Link to="/notifications" className={footerLink}><Bullet />Notifications</Link></li>
              </ul>
            </details>

            <details className="group rounded-2xl border border-gray-800/70 bg-white/5 p-4 backdrop-blur-sm">
              <summary className="cursor-pointer list-none select-none flex items-center justify-between">
                <SectionTitle>Company</SectionTitle>
                <span aria-hidden className="text-gray-500 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <ul className="space-y-3 pt-2">
                <li><Link to="/about" className={footerLink}><Bullet />About Khoj</Link></li>
                <li><Link to="/how-it-works" className={footerLink}><Bullet />How It Works</Link></li>
                <li><a href="https://www.linkedin.com/company/khoj-app" target="_blank" rel="noreferrer noopener" className={footerLink}><Bullet />LinkedIn</a></li>
                <li><a href="https://www.instagram.com/official.khojapp" target="_blank" rel="noreferrer noopener" className={footerLink}><Bullet />Instagram</a></li>
                <li><a href="mailto:khojapp.team@gmail.com" className={footerLink}><Bullet />Contact Us</a></li>
              </ul>
            </details>

            <details className="group rounded-2xl border border-gray-800/70 bg-white/5 p-4 backdrop-blur-sm">
              <summary className="cursor-pointer list-none select-none flex items-center justify-between">
                <SectionTitle>Legal</SectionTitle>
                <span aria-hidden className="text-gray-500 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <ul className="space-y-3 pt-2">
                <li><Link to="/privacy" className={footerLink}><Bullet />Privacy Policy</Link></li>
                <li><Link to="/terms" className={footerLink}><Bullet />Terms of Service</Link></li>
                <li><Link to="/community-guidelines" className={footerLink}><Bullet />Community Guidelines</Link></li>
              </ul>
            </details>
          </div>

          <div className="mt-4 rounded-2xl border border-primary-500/25 bg-gradient-to-br from-primary-500/15 to-transparent px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-primary-200">150+</p>
                <p className="text-sm text-gray-400 mt-1">Items recovered across Bengaluru</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-xl border border-gray-800/80 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to top
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

    <div className="border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
        <span>© 2026 Khoj · Built for campus students</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
          <span aria-hidden>·</span>
          <Link to="/terms" className="hover:text-gray-300">Terms</Link>
          <span aria-hidden>·</span>
          <a href="mailto:khojapp.team@gmail.com" className="hover:text-gray-300">khojapp.team@gmail.com</a>
        </span>
      </div>
    </div>
    </div>
  </motion.footer>
);

export default Footer;
