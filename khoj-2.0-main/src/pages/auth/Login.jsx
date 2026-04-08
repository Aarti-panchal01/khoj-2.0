import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { AuthAPI } from '../../lib/apiClient';
import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setUser } = useAuth();
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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ email, password });
    if (result.success) {
      setLoading(false);
      await afterAuth();
      return;
    }
    setLoading(false);
    setError(result.error || 'Invalid credentials');
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('🔐 Starting Google login...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google signin successful:', result.user.email);
      
      const user = result.user;
      const idToken = await user.getIdToken();
      console.log('✅ ID token obtained');
      
      try {
        const backendResponse = await AuthAPI.google({ credential: idToken });
        console.log('✅ Backend authentication successful:', backendResponse);
        
        if (backendResponse.token) {
          localStorage.setItem('khoj_token', backendResponse.token);
          setUser(backendResponse.user);
          setLoading(false);
          
          setTimeout(() => {
            afterAuth();
          }, 50);
        } else {
          console.error('❌ No token in backend response:', backendResponse);
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
        setError('Sign-in popup was closed');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection');
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups for this site');
      } else {
        setError(firebaseError.message || 'Firebase authentication failed');
      }
    }
  };

  return (
    <div className="min-h-0 flex flex-col lg:flex-row flex-1">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white via-blue-50/30 to-primary-50/40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
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
              Welcome back
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

          {/* Continue with Google Button */}
          <Button 
            onClick={handleGoogleLogin} 
            fullWidth 
            loading={loading}
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg"
          >
            🔍 Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-white via-blue-50/30 to-primary-50/40 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              icon={Lock}
              required
            />
            <Button type="submit" fullWidth loading={loading} className="shadow-lg shadow-primary-200">
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-medium hover:text-primary-700">Sign up</Link>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex relative flex-1 bg-primary-900 p-12 items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)', backgroundSize: '18px 18px' }}></div>
        <div className="relative max-w-md">
          <h2 className="khoj-heading text-5xl font-normal text-white mb-4">Khoj</h2>
          <p className="text-primary-200 text-lg font-sans">
            Campus lost &amp; found for Bengaluru — sign in to see your university feed and contact details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
