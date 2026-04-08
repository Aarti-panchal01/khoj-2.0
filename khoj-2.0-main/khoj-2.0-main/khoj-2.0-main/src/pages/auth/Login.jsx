import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, MapPin, Search, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import CustomSelect from '../../components/ui/CustomSelect';
import { UniversityAPI } from '../../lib/apiClient';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    campus: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingUniversities(true);
    console.log('Fetching universities from API...');
    UniversityAPI.list()
      .then((data) => {
        console.log('Universities loaded:', data);
        console.log('Number of universities:', data?.length);
        console.log('[Mobile Debug] Universities array:', JSON.stringify(data));
        console.log('[Mobile Debug] Setting universities state...');
        setUniversities(Array.isArray(data) ? data : []);
        setLoadingUniversities(false);
        console.log('[Mobile Debug] Universities state set successfully');
      })
      .catch((err) => {
        console.error('Failed to load universities:', err);
        setUniversities([]);
        setLoadingUniversities(false);
      });
  }, []);

  const matchedUniversity = useMemo(() => {
    if (!formData.college) return null;
    return universities.find((u) => u.name === formData.college) || null;
  }, [universities, formData.college]);

  // Log options array for mobile debugging
  useEffect(() => {
    const options = universities.map(u => ({ value: u.name, label: u.name }));
    console.log('[Mobile Debug - Login] Universities state length:', universities.length);
    console.log('[Mobile Debug - Login] Options array length:', options.length);
    console.log('[Mobile Debug - Login] Options array:', options);
  }, [universities]);

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

  const handleSelectChange = (name) => (e) => {
    handleChange({ target: { name, value: e.target.value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.college.trim()) {
      setError('Please select your university');
      return;
    }
    if (matchedUniversity && matchedUniversity.campuses.length > 1 && !formData.campus.trim()) {
      setError('Please select your campus');
      return;
    }

    setLoading(true);
    const result = await login({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      college: formData.college,
      campus: formData.campus,
      password: formData.password,
    });

    if (result.success) {
      navigate('/');
    } else {
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
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-primary-200 overflow-hidden"
            >
              <img src="/Khoj_logo.jpeg" alt="Khoj logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Welcome to Khoj
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-primary-600 tracking-wide mt-1">DON'T PANIC. POST IT.</p>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Sign in to your account to continue</p>
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

            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              required
            />

            {/* University dropdown */}
            <CustomSelect
              label="College/University"
              required
              placeholder={loadingUniversities ? "Loading universities..." : "Select your university"}
              icon={Building2}
              name="college"
              value={formData.college}
              onChange={handleSelectChange('college')}
              options={universities.map(u => ({ value: u.name, label: u.name }))}
              error={error && !formData.college ? error : ''}
            />

            {/* Campus dropdown — only for multi-campus universities */}
            {matchedUniversity && matchedUniversity.campuses.length > 1 && (
              <CustomSelect
                label="Campus"
                required
                placeholder="Select your campus"
                icon={MapPin}
                name="campus"
                value={formData.campus}
                onChange={handleSelectChange('campus')}
                options={matchedUniversity.campuses.map(c => ({ value: c.name, label: c.name }))}
                error={error && !formData.campus ? error : ''}
              />
            )}

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

            <Button type="submit" fullWidth loading={loading}
              className="shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300">
              🔐 Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">Create Account</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Hero */}
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

