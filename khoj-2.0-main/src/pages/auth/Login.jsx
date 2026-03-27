import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { UniversityAPI } from '../../lib/apiClient';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    college: '',   // display name — resolved to universityId on backend
    campus: '',    // display name — resolved to campusId on backend
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const [universities, setUniversities] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'college' ? { campus: '' } : {}),
    }));
    setError('');
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const list = await UniversityAPI.list();
        setUniversities(list);
      } catch (error) {
        console.error('Failed to load universities', error);
      }
    };
    fetchUniversities();
  }, []);

  const matchedUniversity = useMemo(() => {
    if (!formData.college) return null;
    return universities.find(
      (u) => u.name.toLowerCase() === formData.college.toLowerCase()
    );
  }, [universities, formData.college]);

  useEffect(() => {
    if (matchedUniversity && matchedUniversity.campuses.length === 1 && !formData.campus) {
      setFormData(prev => ({ ...prev, campus: matchedUniversity.campuses[0].name }));
    }
  }, [matchedUniversity, formData.campus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email domain
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!formData.college.trim()) {
      setError('Please enter your college name');
      setLoading(false);
      return;
    }
    if (matchedUniversity && matchedUniversity.campuses.length > 1 && !formData.campus.trim()) {
      setError('Please select your campus');
      setLoading(false);
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password,
      college: formData.college,
      campus: formData.campus,
    });

    if (result.success) {
      navigate('/');
    } else {
      if (result.requiresVerification && result.userId) {
        navigate('/verify-email', { state: { userId: result.userId, email: formData.email } });
        return;
      }
      setError(result.error || 'Invalid credentials');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white via-blue-50/30 to-primary-50/40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-primary-200 overflow-hidden"
            >
              <img src="/Khoj_logo.jpeg" alt="Khoj logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Welcome to Khoj
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-primary-600 tracking-wide mt-1">
              DON'T PANIC. POST IT.
            </p>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <Input
              label="Campus Email"
              type="email"
              name="email"
              placeholder="name@yourcollege.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                College/University <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                name="college"
                list="login-college-options"
                value={formData.college}
                onChange={handleChange}
                placeholder="Start typing your college name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                required
              />
              <datalist id="login-college-options">
                {universities.map((u) => (
                  <option key={u._id} value={u.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Campus {matchedUniversity && matchedUniversity.campuses.length > 1 && <span className="text-danger-500">*</span>}
              </label>
              <input
                type="text"
                name="campus"
                list="login-campus-options"
                value={formData.campus}
                onChange={handleChange}
                placeholder={
                  matchedUniversity && matchedUniversity.campuses.length > 0
                    ? 'Select or type your campus'
                    : 'Campus (optional)'
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                required={Boolean(matchedUniversity && matchedUniversity.campuses.length > 1)}
              />
              {matchedUniversity && matchedUniversity.campuses.length > 0 && (
                <datalist id="login-campus-options">
                  {matchedUniversity.campuses.map((c) => (
                    <option key={c._id} value={c.name} />
                  ))}
                </datalist>
              )}
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300"
            >
              🔐 Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Create Account
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          {/* <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-700">Email: demo@student.outlook.com</p>
            <p className="text-xs text-blue-700">Password: demo123</p>
          </div> */}
        </motion.div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-800 p-8 xl:p-12 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-lg text-white"
        >
          <h2 className="text-3xl xl:text-4xl font-bold mb-6">Khoj - Lost & Found Made Simple</h2>
          <p className="text-lg xl:text-xl mb-8 text-primary-100">
            Connect with your campus community to reunite lost items with their owners.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Quick Search</h3>
                <p className="text-primary-100">Find your lost items with our powerful search and filter system</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Instant Notifications</h3>
                <p className="text-primary-100">Get notified when someone finds an item matching your description</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
