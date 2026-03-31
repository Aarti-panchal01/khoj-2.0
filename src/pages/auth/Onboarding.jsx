import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Check, ChevronDown, Phone, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthAPI, UniversityAPI } from '../../lib/apiClient';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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
  const [isUniversityOpen, setIsUniversityOpen] = useState(false);
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [universityQuery, setUniversityQuery] = useState('');
  const [campusQuery, setCampusQuery] = useState('');

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

  const universityOptions = useMemo(() => (
    universities.map((u) => ({
      value: String(u._id),
      label: u.name,
      subtitle: `${u.campuses?.length || 0} ${(u.campuses?.length || 0) === 1 ? 'campus' : 'campuses'}`,
    }))
  ), [universities]);

  const filteredUniversityOptions = useMemo(() => {
    const query = universityQuery.trim().toLowerCase();
    if (!query) return universityOptions;
    return universityOptions.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [universityOptions, universityQuery]);

  const filteredCampusOptions = useMemo(() => {
    const query = campusQuery.trim().toLowerCase();
    if (!query) return campusOptions;
    return campusOptions.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [campusOptions, campusQuery]);

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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                College / University <span className="text-danger-500">*</span>
              </label>
              <button
                type="button"
                disabled={loadingUniversities}
                onClick={() => {
                  setIsUniversityOpen((prev) => !prev);
                  setIsCampusOpen(false);
                }}
                className="w-full min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <span className={selectedUniversity ? 'text-slate-900' : 'text-slate-500'}>
                  {selectedUniversity?.name || (loadingUniversities ? 'Loading universities...' : 'Select your college')}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isUniversityOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUniversityOpen && !loadingUniversities && (
                <div className="mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={universityQuery}
                        onChange={(e) => setUniversityQuery(e.target.value)}
                        placeholder="Search college..."
                        className="w-full h-10 rounded-lg border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredUniversityOptions.map((option) => {
                      const isActive = String(selectedUniversity?._id) === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            const picked = universities.find((u) => String(u._id) === option.value) || null;
                            setSelectedUniversity(picked);
                            setIsUniversityOpen(false);
                            setUniversityQuery('');
                            setIsCampusOpen(true);
                          }}
                          className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-b-0 flex items-center justify-between ${
                            isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-800'
                          }`}
                        >
                          <span>
                            <span className="block font-medium">{option.label}</span>
                            <span className="block text-xs text-slate-500">{option.subtitle}</span>
                          </span>
                          {isActive && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                    {!filteredUniversityOptions.length && (
                      <p className="px-4 py-3 text-sm text-slate-500">No matching college found</p>
                    )}
                  </div>
                </div>
              )}
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Campus <span className="text-danger-500">*</span>
                </label>
                <button
                  type="button"
                  disabled={!campusOptions.length}
                  onClick={() => {
                    setIsCampusOpen((prev) => !prev);
                    setIsUniversityOpen(false);
                  }}
                  className="w-full min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-60"
                >
                  <span className={selectedCampusId ? 'text-slate-900' : 'text-slate-500'}>
                    {campusOptions.find((opt) => opt.value === selectedCampusId)?.label || 'Select campus'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isCampusOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCampusOpen && (
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    {campusOptions.length > 6 && (
                      <div className="p-3 border-b border-slate-100">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={campusQuery}
                            onChange={(e) => setCampusQuery(e.target.value)}
                            placeholder="Search campus..."
                            className="w-full h-10 rounded-lg border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                          />
                        </div>
                      </div>
                    )}
                    <div className="max-h-56 overflow-y-auto">
                      {filteredCampusOptions.map((option) => {
                        const isActive = selectedCampusId === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSelectedCampusId(option.value);
                              setIsCampusOpen(false);
                              setCampusQuery('');
                            }}
                            className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-b-0 flex items-center justify-between ${
                              isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-800'
                            }`}
                          >
                            <span className="font-medium">{option.label}</span>
                            {isActive && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
