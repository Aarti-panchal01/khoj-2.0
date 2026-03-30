import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { AuthAPI, UniversityAPI } from '../../lib/apiClient';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const Onboarding = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [universityQuery, setUniversityQuery] = useState('');
  const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
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
    if (!selectedUniversity) {
      setSelectedCampusId('');
      return;
    }

    const campuses = selectedUniversity.campuses || [];
    if (campuses.length === 1) {
      setSelectedCampusId(String(campuses[0]._id));
    } else {
      setSelectedCampusId('');
    }
  }, [selectedUniversity]);

  const campusCount = selectedUniversity?.campuses?.length ?? 0;
  const showCampusPicker = campusCount > 1;
  const canSubmit = name.trim().length >= 2 && selectedUniversity && Boolean(selectedCampusId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || !user) return;
    setError('');
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        universityId: selectedUniversity._id,
        campusId: selectedCampusId,
      };
      const updated = await AuthAPI.updateProfile(body);
      setUser(updated);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUniversities = useMemo(() => {
    const q = universityQuery.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter((u) => String(u.name).toLowerCase().includes(q));
  }, [universities, universityQuery]);

  const showUniversityNotListed =
    universityQuery.trim().length > 0 && !selectedUniversity;

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

          <div className="relative">
            <Input
              label="University"
              placeholder={loadingUniversities ? 'Loading universities...' : 'Search your university'}
              value={universityQuery}
              onChange={(e) => {
                const v = e.target.value;
                setUniversityQuery(v);
                const trimmed = v.trim();
                if (!trimmed) {
                  setSelectedUniversity(null);
                  return;
                }
                const exact = universities.find(
                  (u) => String(u.name).toLowerCase() === trimmed.toLowerCase()
                );
                setSelectedUniversity(exact || null);
              }}
              onFocus={() => setIsUniversityDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsUniversityDropdownOpen(false), 120)}
              required
              error={showUniversityNotListed ? 'Your university is not listed yet. We are expanding soon.' : ''}
            />

            {isUniversityDropdownOpen && !loadingUniversities && (
              <div className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((u) => {
                    const campusCount = u.campuses?.length ?? 0;
                    const active = selectedUniversity?._id === u._id;
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedUniversity(u);
                          setUniversityQuery(u.name);
                          setIsUniversityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors ${
                          active ? 'bg-primary-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {campusCount} {campusCount === 1 ? 'campus' : 'campuses'}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No matches
                  </div>
                )}
              </div>
            )}
          </div>

          {showCampusPicker && (
            <Select
              label="Campus"
              value={selectedCampusId}
              onChange={(e) => setSelectedCampusId(e.target.value)}
              options={(selectedUniversity?.campuses || []).map((c) => ({
                value: String(c._id),
                label: c.name,
              }))}
              required
            />
          )}

          <Button type="submit" fullWidth loading={submitting} disabled={!canSubmit}>
            Let&apos;s go →
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
