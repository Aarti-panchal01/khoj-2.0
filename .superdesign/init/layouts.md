# layouts.md

Shared layout components (full source).

## MainLayout
- Source: `src/components/layout/MainLayout.jsx`
- Description: Public/main route wrapper with navbar + centered content container.

```jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => (
  <div className="min-h-0 flex flex-col flex-1 bg-gradient-to-br from-blue-50 via-white to-primary-50">
    <Navbar />
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Outlet />
    </main>
  </div>
);

export default MainLayout;
```

## ProtectedLayout
- Source: `src/components/layout/ProtectedLayout.jsx`
- Description: Auth gate wrapper for protected pages; redirects to login/verify/onboarding; includes navbar + container.

```jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

const ProtectedLayout = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace state={{ userId: user.id, email: user.email }} />;
  }

  if (user && !user.universityId) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-0 flex flex-col flex-1 bg-gradient-to-br from-blue-50 via-white to-primary-50">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
```

## Navbar
- Source: `src/components/layout/Navbar.jsx`
- Description: Sticky top nav with logo, auth actions, desktop links, and mobile bottom nav.

```jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Plus, User, LogOut, Home, Bell, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationsAPI } from '../../lib/apiClient';
import Badge from '../ui/Badge';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count } = await NotificationsAPI.getUnreadCount();
        setUnreadCount(count);
      } catch {
        /* ignore */
      }
    };

    if (user?.universityId) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
    setUnreadCount(0);
    return undefined;
  }, [user?.universityId]);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
              <img src="/Khoj_logo.jpeg" alt="Khoj logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Khoj</h1>
                <span className="text-[9px] sm:text-[10px] font-semibold text-primary-600 tracking-wide hidden sm:inline">
                  DON&apos;T PANIC. POST IT.
                </span>
              </div>
              {user?.universityName && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5">
                  <Badge variant="primary" className="hidden sm:inline-flex text-[10px] font-medium">
                    {user.universityName}
                  </Badge>
                  {user?.campusName && (
                    <span className="text-[10px] text-primary-600 font-semibold hidden sm:inline">
                      {user.campusName}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/') ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/post"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/post') ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Post Item</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/profile') ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {user?.universityId && (
                  <button
                    type="button"
                    onClick={() => navigate('/notifications')}
                    className="relative p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[18px] h-[18px] bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                )}

                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                    {user?.universityName && (
                      <p className="text-xs text-primary-600 font-semibold truncate max-w-[150px]">
                        {user.universityName}{user?.campusName ? ` • ${user.campusName}` : ''}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:bg-danger-50 hover:text-danger-600 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-md safe-bottom">
          <div className="flex justify-around py-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>

            <Link
              to="/post"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/post') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-medium">Post</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/profile') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
```

## Footer
- Source: `src/components/layout/Footer.jsx`
- Description: Site footer with brand mark, social links, nav links, and stats card.

```jsx
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
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d1117] ring-2 ring-primary-500/40">
    <svg className="h-5 w-5 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  </div>
);

const footerLink = 'text-gray-400 hover:text-white transition-colors text-sm';

const Footer = () => (
  <footer className="mt-auto border-t border-gray-800 bg-[#0d1117] text-gray-300">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
            Campus lost &amp; found for Bengaluru students.
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

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Platform</h3>
          <ul className="space-y-3">
            <li><Link to="/" className={footerLink}>Home Feed</Link></li>
            <li><Link to="/post" className={footerLink}>Report an Item</Link></li>
            <li><Link to="/claims" className={footerLink}>My Claims</Link></li>
            <li><Link to="/profile" className={footerLink}>My Profile</Link></li>
            <li><Link to="/notifications" className={footerLink}>Notifications</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Company</h3>
          <ul className="space-y-3">
            <li><Link to="/about" className={footerLink}>About Khoj</Link></li>
            <li><Link to="/how-it-works" className={footerLink}>How It Works</Link></li>
            <li><a href="https://www.linkedin.com/company/khoj-app" target="_blank" rel="noreferrer noopener" className={footerLink}>LinkedIn</a></li>
            <li><a href="https://www.instagram.com/official.khojapp" target="_blank" rel="noreferrer noopener" className={footerLink}>Instagram</a></li>
            <li><a href="mailto:khojapp.team@gmail.com" className={footerLink}>Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Legal</h3>
          <ul className="space-y-3 mb-6">
            <li><Link to="/privacy" className={footerLink}>Privacy Policy</Link></li>
            <li><Link to="/terms" className={footerLink}>Terms of Service</Link></li>
            <li><Link to="/community-guidelines" className={footerLink}>Community Guidelines</Link></li>
          </ul>
          <div className="rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-4">
            <p className="text-2xl font-bold text-primary-300">150+</p>
            <p className="text-sm text-gray-400 mt-1">Items recovered across Bengaluru</p>
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
  </footer>
);

export default Footer;
```

