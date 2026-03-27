import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI, setAuthToken } from '../lib/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Listen for session expiry events dispatched by apiClient
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [navigate]);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('khoj_token');
      if (!storedToken) {
        // Try silent refresh via HTTP-only cookie even without a stored access token
        try {
          const data = await AuthAPI.refresh();
          setAuthToken(data.token);
          const profile = await AuthAPI.me();
          setUser(profile);
        } catch {
          // No valid session — stay logged out
        } finally {
          setLoading(false);
        }
        return;
      }

      setAuthToken(storedToken);
      try {
        const profile = await AuthAPI.me();
        setUser(profile);
      } catch (error) {
        // Access token expired — try refresh
        try {
          const data = await AuthAPI.refresh();
          setAuthToken(data.token);
          const profile = await AuthAPI.me();
          setUser(profile);
        } catch {
          setAuthToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (credentials) => {
    try {
      const result = await AuthAPI.login(credentials);
      setAuthToken(result.token);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      // Surface requiresVerification so Login page can redirect to /verify-email
      return {
        success: false,
        error: error.message,
        requiresVerification: error.data?.requiresVerification,
        userId: error.data?.userId,
      };
    }
  };

  const signup = async (userData) => {
    try {
      const result = await AuthAPI.signup(userData);
      // Signup no longer returns a token — user must verify email first
      return { success: true, userId: result.userId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch {
      // Best-effort
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,   // exposed so VerifyEmail can set user after verification
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
