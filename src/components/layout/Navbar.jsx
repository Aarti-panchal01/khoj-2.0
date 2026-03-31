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
