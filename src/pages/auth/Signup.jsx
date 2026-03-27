import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { UniversityAPI } from '../../lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [universityOpen, setUniversityOpen] = useState(false);
  const [universitySearch, setUniversitySearch] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    UniversityAPI.list()
      .then(setUniversities)
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('#university-dropdown-container')) {
        setUniversityOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const matchedUniversity = useMemo(
    () => universities.find((u) => u.name === formData.college) || null,
    [universities, formData.college]
  );

  // Auto-select campus when only one exists
  useEffect(() => {
    if (matchedUniversity?.campuses.length === 1 && !formData.campus) {
      setFormData((prev) => ({ ...prev, campus: matchedUniversity.campuses[0].name }));
    }
  }, [matchedUniversity, formData.campus]);

  const filteredUniversities = useMemo(() => {
    if (!universitySearch.trim()) return universities;
    return universities.filter((u) =>
      u.name.toLowerCase().includes(universitySearch.toLowerCase())
    );
  }, [universities, universitySearch]);

  // Is the typed search something NOT in our list?
  const isUnknownUniversity = useMemo(() => {
    if (!universitySearch.trim()) return false;
    return !universities.some(
      (u) => u.name.toLowerCase().includes(universitySearch.toLowerCase())
    );
  }, [universities, universitySearch]);

  const handleUniversitySelect = (name) => {
    setFormData((prev) => ({ ...prev, college: name, campus: '' }));
    setUniversitySearch('');
    setUniversityOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
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
      navigate('/verify-email', { state: { userId: result.userId, email: formData.email } });
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

            <Input label="Campus Email" type="email" name="email" placeholder="name@yourcollege.com"
              value={formData.email} onChange={handleChange} icon={Mail} required />

            <Input label="Phone Number" type="tel" name="phone" placeholder="+91 98765 43210"
              value={formData.phone} onChange={handleChange} icon={Phone} required />

            {/* ── University dropdown ── */}
            <div id="university-dropdown-container" className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                College/University <span className="text-danger-500">*</span>
              </label>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => setUniversityOpen((o) => !o)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 border rounded-lg text-left transition-all duration-200 bg-white
                  ${universityOpen ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className={formData.college ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.college || 'Select your college'}
                </span>
                <svg className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${universityOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown panel */}
              <AnimatePresence>
                {universityOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                  >
                    {/* Search inside dropdown */}
                    <div className="p-2 border-b border-gray-100">
                      <input
                        autoFocus
                        type="text"
                        value={universitySearch}
                        onChange={(e) => setUniversitySearch(e.target.value)}
                        placeholder="Search university..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                      />
                    </div>

                    <ul className="max-h-52 overflow-y-auto">
                      {filteredUniversities.map((u) => (
                        <li key={u._id}>
                          <button
                            type="button"
                            onClick={() => handleUniversitySelect(u.name)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors
                              ${formData.college === u.name ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-800'}`}
                          >
                            {u.name}
                          </button>
                        </li>
                      ))}

                      {/* "Expanding soon" message for unknown universities */}
                      {isUnknownUniversity && (
                        <li className="px-4 py-3 text-sm text-gray-500 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
                          <span>🚀</span>
                          <span>We're expanding to more universities soon! Stay tuned.</span>
                        </li>
                      )}

                      {filteredUniversities.length === 0 && !isUnknownUniversity && (
                        <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Campus dropdown — only shown after university is selected ── */}
            {matchedUniversity && matchedUniversity.campuses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Campus {matchedUniversity.campuses.length > 1 && <span className="text-danger-500">*</span>}
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="campus"
                    value={formData.campus}
                    onChange={handleChange}
                    required={matchedUniversity.campuses.length > 1}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                  >
                    {matchedUniversity.campuses.length > 1 && (
                      <option value="">Select campus</option>
                    )}
                    {matchedUniversity.campuses.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            <Input label="Password" type="password" name="password" placeholder="At least 8 characters"
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
