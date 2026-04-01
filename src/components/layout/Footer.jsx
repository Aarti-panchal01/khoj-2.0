import { Link } from 'react-router-dom';

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
  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 ring-1 ring-primary-400/40">
    <svg className="h-5 w-5 text-primary-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  </div>
);

const footerLink = 'text-surface-200/80 hover:text-surface-50 transition-colors text-sm';

const Footer = () => (
  <footer className="mt-auto border-t border-ink-900 bg-ink-950 text-surface-100">
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <KhojMark />
            <div>
              <p className="text-2xl font-extrabold text-surface-50 khoj-heading leading-none">Khoj</p>
              <p className="text-xs font-extrabold text-primary-300 tracking-[0.16em] khoj-heading mt-1">DON&apos;T PANIC. POST IT.</p>
            </div>
          </div>
          <p className="text-sm text-surface-200/80 leading-relaxed">
            Campus lost &amp; found for Bengaluru students.
          </p>
          <div className="flex items-center gap-4 text-surface-200/70">
            <a href="https://www.linkedin.com/company/khoj-app" target="_blank" rel="noreferrer noopener" className="hover:text-surface-50 transition-colors" aria-label="Khoj on LinkedIn">
              <LinkedInIcon />
            </a>
            <a href="https://www.instagram.com/official.khojapp" target="_blank" rel="noreferrer noopener" className="hover:text-surface-50 transition-colors" aria-label="Khoj on Instagram">
              <InstagramIcon />
            </a>
            <a href="mailto:khojapp.team@gmail.com" className="hover:text-surface-50 transition-colors" aria-label="Email Khoj">
              <MailIcon />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-surface-200/60 mb-4 khoj-heading">Platform</h3>
          <ul className="space-y-3">
            <li><Link to="/" className={footerLink}>Home Feed</Link></li>
            <li><Link to="/post" className={footerLink}>Report an Item</Link></li>
            <li><Link to="/claims" className={footerLink}>My Claims</Link></li>
            <li><Link to="/profile" className={footerLink}>My Profile</Link></li>
            <li><Link to="/notifications" className={footerLink}>Notifications</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-surface-200/60 mb-4 khoj-heading">Company</h3>
          <ul className="space-y-3">
            <li><Link to="/about" className={footerLink}>About Khoj</Link></li>
            <li><Link to="/how-it-works" className={footerLink}>How It Works</Link></li>
            <li><a href="https://www.linkedin.com/company/khoj-app" target="_blank" rel="noreferrer noopener" className={footerLink}>LinkedIn</a></li>
            <li><a href="https://www.instagram.com/official.khojapp" target="_blank" rel="noreferrer noopener" className={footerLink}>Instagram</a></li>
            <li><a href="mailto:khojapp.team@gmail.com" className={footerLink}>Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-surface-200/60 mb-4 khoj-heading">Legal</h3>
          <ul className="space-y-3 mb-5">
            <li><Link to="/privacy" className={footerLink}>Privacy Policy</Link></li>
            <li><Link to="/terms" className={footerLink}>Terms of Service</Link></li>
            <li><Link to="/community-guidelines" className={footerLink}>Community Guidelines</Link></li>
          </ul>
          <div className="rounded-2xl border border-primary-400/30 bg-primary-500/10 px-4 py-4">
            <p className="text-3xl font-extrabold text-primary-200 khoj-heading leading-none">150+</p>
            <p className="text-sm text-surface-200/80 mt-1">Items recovered across Bengaluru</p>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-surface-200/60">
        <span>© 2026 Khoj · Built for campus students</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/privacy" className="hover:text-surface-200/90">Privacy</Link>
          <span aria-hidden>·</span>
          <Link to="/terms" className="hover:text-surface-200/90">Terms</Link>
          <span aria-hidden>·</span>
          <a href="mailto:khojapp.team@gmail.com" className="hover:text-surface-200/90">khojapp.team@gmail.com</a>
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
