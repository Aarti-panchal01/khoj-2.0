import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthAPI, UniversityAPI } from '../../lib/apiClient';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const Onboarding = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.universityId) {
      navigate('/', { replace: true });
      return;
    }
    if (user.name) {
      setName(user.name);
    } else if (user.email) {
      const guess = String(user.email).split('@')[0].replace(/[._-]+/g, ' ');
      const pretty = guess
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      setName(pretty || '');
    } else {
      setName('');
    }
    setPhone(user.phone || '');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    UniversityAPI.list()
      .then((data) => setUniversities(Array.isArray(data) ? data : []))
      .catch(() => setUniversities([]))
      .finally(() => setLoadingUniversities(false));
  }, []);

  useEffect(() => {
    const firstCampusId = selectedUniversity?.campuses?.[0]?._id;
    if (firstCampusId) setSelectedCampusId(String(firstCampusId));
    else setSelectedCampusId('');
  }, [selectedUniversity?._id]);

  const hasCampusOptions = Boolean(selectedUniversity?.campuses?.length);

  const isValidPhone = (value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return false;
    return /^\+?[0-9\s\-()]{7,20}$/.test(trimmed);
  };

  const canSubmit = name.trim().length >= 2
    && selectedUniversity
    && isValidPhone(phone)
    && (!hasCampusOptions || Boolean(selectedCampusId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || !user) return;
    setError('');
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        universityId: selectedUniversity._id,
        phone: phone.trim(),
      };
      if (selectedCampusId) {
        body.campusId = selectedCampusId;
      }
      const updated = await AuthAPI.updateProfile(body);
      setUser(updated);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const campusOptions = useMemo(() => {
    if (!selectedUniversity?.campuses?.length) return [];
    return selectedUniversity.campuses.map((campus) => ({
      value: String(campus._id),
      label: campus.name,
    }));
  }, [selectedUniversity]);

  const universityOptions = useMemo(
    () => universities.map((u) => ({
      value: String(u._id),
      label: `${u.name} (${u.campuses?.length || 0} ${(u.campuses?.length || 0) === 1 ? 'campus' : 'campuses'})`,
    })),
    [universities]
  );

  const selectedUniversityLogoText = selectedUniversity?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

  if (authLoading || !user || user.universityId) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-sky-50 via-white to-amber-50">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-sky-100 px-6 sm:px-8 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-100 rounded-2xl mb-4 shadow-md overflow-hidden">
              <img src="/Khoj_logo.jpeg" alt="Khoj" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Almost there</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Tell us who you are and where you study so we can show you the right lost &amp; found feed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                name="name"
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />
              <Input
                label="Mobile number"
                name="phone"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={Phone}
                required
              />
            </div>

            <div>
              <Select
                label="College / University"
                value={selectedUniversity?._id ? String(selectedUniversity._id) : ''}
                onChange={(e) => {
                  const picked = universities.find((u) => String(u._id) === e.target.value) || null;
                  setSelectedUniversity(picked);
                }}
                options={universityOptions}
                placeholder={loadingUniversities ? 'Loading universities...' : 'Select your college'}
                required
                disabled={loadingUniversities}
              />
            </div>

            {selectedUniversity && (
              <div className="rounded-2xl border border-primary-200 bg-primary-50/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-semibold flex items-center justify-center">
                    {selectedUniversityLogoText || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{selectedUniversity.name}</p>
                    <p className="text-xs text-primary-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {(selectedUniversity.campuses?.length || 0)} {(selectedUniversity.campuses?.length || 0) === 1 ? 'campus' : 'campuses'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedUniversity && (
              <div>
                <Select
                  label="Campus"
                  value={selectedCampusId}
                  onChange={(e) => setSelectedCampusId(e.target.value)}
                  options={campusOptions}
                  placeholder={campusOptions.length ? 'Select campus' : 'No campuses available'}
                  required={hasCampusOptions}
                  disabled={!campusOptions.length}
                />
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={submitting}
              disabled={!canSubmit}
            >
              Save and continue
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
