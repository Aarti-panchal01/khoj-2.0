import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
<<<<<<< HEAD
=======
    if (user && !user.isEmailVerified) {
      navigate('/verify-email', {
        replace: true,
        state: { userId: user.id, email: user.email },
      });
      return;
    }
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
    if (user.universityId) {
      navigate('/', { replace: true });
      return;
    }
<<<<<<< HEAD
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
=======
    setName(user.name || '');
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
    setPhone(user.phone || '');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    UniversityAPI.list()
      .then((data) => setUniversities(Array.isArray(data) ? data : []))
      .catch(() => setUniversities([]))
      .finally(() => setLoadingUniversities(false));
  }, []);

  useEffect(() => {
    setSelectedCampusId('');
  }, [selectedUniversity?._id]);

  const showCampusPicker = selectedUniversity && selectedUniversity.campuses?.length > 1;

  const isValidPhone = (value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return false;
    return /^\+?[0-9\s\-()]{7,20}$/.test(trimmed);
  };

  const canSubmit = name.trim().length >= 2 && selectedUniversity && isValidPhone(phone);

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
      if (showCampusPicker && selectedCampusId) {
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

  const campusRadios = useMemo(() => {
    if (!selectedUniversity?.campuses?.length) return [];
    return selectedUniversity.campuses;
  }, [selectedUniversity]);

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
              required
            />
            <Input
              label="Mobile number"
              name="phone"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">University</p>
            {loadingUniversities ? (
              <p className="text-sm text-gray-500">Loading universities…</p>
            ) : (
              <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 space-y-1.5">
                {universities.map((u) => {
                  const active = selectedUniversity?._id === u._id;
                  const campusCount = u.campuses?.length ?? 0;
                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => setSelectedUniversity(u)}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'border-primary-500 bg-primary-50/70'
                          : 'border-transparent bg-white hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {campusCount} {campusCount === 1 ? 'campus' : 'campuses'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {showCampusPicker && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Campus</p>
              <div className="space-y-1.5">
                {campusRadios.map((c) => {
                  const id = String(c._id);
                  const active = selectedCampusId === id;
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 cursor-pointer transition-colors text-sm ${
                        active ? 'border-primary-500 bg-primary-50/70' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="campus"
                        className="text-primary-600"
                        checked={active}
                        onChange={() => setSelectedCampusId(id)}
                      />
                      <span className="font-medium text-gray-900 truncate">{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={submitting}
            disabled={!canSubmit || (showCampusPicker && !selectedCampusId)}
          >
            Let&apos;s go →
          </Button>
        </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
