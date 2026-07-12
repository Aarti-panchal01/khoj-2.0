import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { AuthAPI, setAuthToken } from '../../lib/apiClient';
import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, setUser } = useAuth();
  const navigate = useNavigate();

  const afterAuth = async () => {
    try {
      const profile = await AuthAPI.me();
      if (!profile?.universityId) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(password)) {
      setError('Passcode must be exactly 6 digits');
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

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;
      const idToken = await user.getIdToken();

      try {
        const backendResponse = await AuthAPI.google({ credential: idToken });

        if (backendResponse.token) {
          // CRITICAL: Use setAuthToken to update both localStorage AND module cache
          setAuthToken(backendResponse.token);
          setUser(backendResponse.user);
          setLoading(false);

          setTimeout(() => {
            afterAuth();
          }, 50);
        } else {
          setLoading(false);
          setError('Authentication failed: No token received from server');
        }
      } catch (backendError) {
        console.error('❌ Backend authentication error:', backendError);
        setLoading(false);
        setError(backendError.data?.message || backendError.message || 'Backend authentication failed');
      }
    } catch (firebaseError) {
      console.error('❌ Firebase error:', firebaseError.code, firebaseError.message);
      setLoading(false);
      
      // Provide user-friendly error messages for Firebase errors
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        setError('Sign-up popup was closed');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection');
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        setError('Google sign-up is not enabled');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups for this site');
      } else {
        setError(firebaseError.message || 'Firebase authentication failed');
      }
    }
  };

  return (
    <div className="min-h-0 flex flex-col lg:flex-row flex-1">
      <div className="hidden lg:flex relative flex-1 bg-primary-900 p-12 items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)', backgroundSize: '18px 18px' }}></div>
        <div className="relative max-w-md">
          <h2 className="khoj-heading text-4xl font-normal text-white mb-4">Join Khoj</h2>
          <p className="text-primary-200 text-lg font-sans">
            Create your secure campus account with email, Google, or a 6-digit passcode.
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

          <Button 
            onClick={handleGoogleSignup} 
            fullWidth 
            loading={loading}
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg"
          >
            🔍 Sign up with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-white via-blue-50/30 to-primary-50/40 text-gray-500">Or sign up with email</span>
            </div>
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
              label="6-digit passcode"
              type="password"
              inputMode="numeric"
              name="password"
              placeholder="Enter 6 digits"
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
