import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { UniversityAPI } from '../../lib/apiClient';
import { motion } from 'framer-motion';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    campus: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    UniversityAPI.list()
      .then(setUniversities)
      .catch(() => {});
  }, []);

  const matchedUniversity = useMemo(
    () => universities.find((u) => u.name === formData.college) || null,
    [universities, formData.college]
  );

  // Auto-select campus when only one exists
  useEffect(() => {
    if (matchedUniversity?.campuses.length === 1) {
      setFormData((prev) => ({ ...prev, campus: matchedUniversity.campuses[0].name }));
    } else if (!matchedUniversity) {
      setFormData((prev) => ({ ...prev, campus: '' }));
    }
  }, [matchedUniversity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'college') {
      setFormData((prev) => ({ ...prev, college: value, campus: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address';
    if (formData.phone.length < 10) return 'Please enter a valid phone number';
    if (!formData.college.trim()) return 'Please select your university';
    if (matchedUniversity && matchedUniversity.campuses.length > 1 && !formData.campus.trim()) {
      return 'Please select your campus';
    }
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await signup(userData);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Failed to create account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-800 p-8 xl:p-12 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg text-white"
        >
          <h2 className="text-3xl xl:text-4xl font-bold mb-6">Join Your Campus Community</h2>
          <p className="text-lg xl:text-xl mb-8 text-primary-100">
            Help your fellow students by reporting found items and finding your lost belongings.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
            {['Post found items instantly', 'Get matched with potential owners', 'Build your campus reputation'].map((t) => (
              <p key={t} className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>{t}</span>
              </p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white via-blue-50/30 to-primary-50/40 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md my-4 sm:my-8"
        >
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-primary-200 overflow-hidden"
            >
              <img src="/Khoj_logo.jpeg" alt="Khoj logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Join Khoj
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-primary-600 tracking-wide mt-1">DON'T PANIC. POST IT.</p>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Sign up with your campus email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <Input label="Full Name" type="text" name="name" placeholder="John Doe"
              value={formData.name} onChange={handleChange} icon={User} required />

            <Input label="Email" type="email" name="email" placeholder="name@yourcollege.com"
              value={formData.email} onChange={handleChange} icon={Mail} required />

            <Input label="Phone Number" type="tel" name="phone" placeholder="+91 98765 43210"
              value={formData.phone} onChange={handleChange} icon={Phone} required />

            {/* ── University select ── */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
                College/University <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 sm:py-2.5 border-2 border-gray-300 rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-base sm:text-sm touch-manipulation relative z-20"
                  style={{ minHeight: '44px', WebkitAppearance: 'menulist', appearance: 'menulist' }}
                >
                  <option value="">Select your university</option>
                  {universities.map((u) => (
                    <option key={u._id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Campus select — shown when university has multiple campuses ── */}
            {matchedUniversity && matchedUniversity.campuses.length > 1 && (
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
                  Campus <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <select
                    name="campus"
                    value={formData.campus}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3 sm:py-2.5 border-2 border-gray-300 rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-base sm:text-sm touch-manipulation relative z-20"
                    style={{ minHeight: '44px', WebkitAppearance: 'menulist', appearance: 'menulist' }}
                  >
                    <option value="">Select your campus</option>
                    {matchedUniversity.campuses.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <Input label="Password" type="password" name="password" placeholder="At least 6 characters"
              value={formData.password} onChange={handleChange} icon={Lock} required />

            <Input label="Confirm Password" type="password" name="confirmPassword" placeholder="Re-enter password"
              value={formData.confirmPassword} onChange={handleChange} icon={Lock} required />

            <Button type="submit" fullWidth loading={loading}
              className="mt-6 shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300">
              ✨ Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
