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
    setName(user.name || '');
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

  const canSubmit = name.trim().length >= 2 && selectedUniversity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || !user) return;
    setError('');
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        universityId: selectedUniversity._id,
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
    <div className="max-w-lg mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl mb-4 shadow-lg overflow-hidden">
            <img src="/Khoj_logo.jpeg" alt="Khoj" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Almost there</h1>
          <p className="text-gray-600 mt-2 text-sm">Tell us your name and campus so we can show the right feed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Name"
            name="name"
            placeholder="What should we call you?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">University</p>
            {loadingUniversities ? (
              <p className="text-sm text-gray-500">Loading universities…</p>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 space-y-2">
                {universities.map((u) => {
                  const active = selectedUniversity?._id === u._id;
                  const campusCount = u.campuses?.length ?? 0;
                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => setSelectedUniversity(u)}
                      className={`w-full text-left rounded-lg border-2 px-4 py-3 transition-colors ${
                        active
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
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
              <div className="space-y-2">
                {campusRadios.map((c) => {
                  const id = String(c._id);
                  const active = selectedCampusId === id;
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
                        active ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="campus"
                        className="text-primary-600"
                        checked={active}
                        onChange={() => setSelectedCampusId(id)}
                      />
                      <span className="text-sm font-medium text-gray-900">{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <Button type="submit" fullWidth loading={submitting} disabled={!canSubmit || (showCampusPicker && !selectedCampusId)}>
            Let&apos;s go →
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
