import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { AuthAPI } from '../../lib/apiClient';
import { motion } from 'framer-motion';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
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

  return (
    <div className="min-h-0 flex flex-col lg:flex-row flex-1">
      <div className="hidden lg:flex relative flex-1 bg-primary-900 p-12 items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)', backgroundSize: '18px 18px' }}></div>
        <div className="relative max-w-md">
          <h2 className="khoj-heading text-4xl font-normal text-white mb-4">Join Khoj</h2>
          <p className="text-primary-200 text-lg font-sans">
            Create your secure campus account with email and a 6-digit passcode. No social login required.
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
