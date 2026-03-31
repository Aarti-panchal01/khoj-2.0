import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { AuthAPI } from '../../lib/apiClient';
import { motion } from 'framer-motion';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const afterAuth = async () => {
    try {
      const profile = await AuthAPI.me();
      if (profile && !profile.isEmailVerified) {
        navigate('/verify-email', {
          replace: true,
          state: { userId: profile.id, email: profile.email },
        });
        return;
      }
      if (!profile?.universityId) navigate('/onboarding', { replace: true });
      else navigate('/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  };

  const handleGoogleSuccess = async (cred) => {
    if (!cred.credential) return;
    setError('');
    setLoading(true);
    const result = await loginWithGoogle(cred.credential);
    setLoading(false);
    if (result.success) await afterAuth();
    else setError(result.error || 'Google sign-up failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await signup({ email, password });
    if (result.success) {
      setLoading(false);
      await afterAuth();
      return;
    }
    setLoading(false);
    setError(result.error || 'Failed to create account');
  };

  return (
    <div className="min-h-0 flex flex-col lg:flex-row flex-1">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-800 p-12 items-center justify-center text-white">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-4">Join Khoj</h2>
          <p className="text-primary-100 text-lg">
            Help your campus reunite lost items — create an account, pick your university, and start posting.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white via-blue-50/30 to-primary-50/40 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md my-4"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg overflow-hidden"
            >
              <img src="/Khoj_logo.jpeg" alt="Khoj logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Create your account
            </h1>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm mb-4"
            >
              {error}
            </motion.div>
          )}

          <div className="w-full flex justify-center mb-4 min-h-[44px]">
            {googleClientId ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-up was cancelled or failed')}
                text="continue_with"
                shape="rectangular"
                size="large"
                width="384"
                theme="filled_blue"
              />
            ) : (
              <p className="text-xs text-gray-500 text-center px-4">
                Google sign-in is not configured (add VITE_GOOGLE_CLIENT_ID).
              </p>
            )}
          </div>

          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-500 uppercase">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              icon={Mail}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              icon={Lock}
              required
            />
            <Button type="submit" fullWidth loading={loading} className="shadow-lg shadow-primary-200">
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
