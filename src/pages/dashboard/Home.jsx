import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, AlertCircle, Package } from 'lucide-react';
import { CATEGORIES } from '../../lib/constants';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ItemDetailModal from '../../components/ui/ItemDetailModal';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ItemsAPI, UniversityAPI } from '../../lib/apiClient';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const isGuest = !user;
  const canUseScopedFeed = Boolean(user?.universityId);

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCampus, setFilterCampus] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [directory, setDirectory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    UniversityAPI.list()
      .then((data) => setDirectory(Array.isArray(data) ? data : []))
      .catch(() => setDirectory([]));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user && !user.universityId) {
      navigate('/onboarding', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (user && !user.universityId) return;

    const fetchItems = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await ItemsAPI.list(
          {
            type: filterType || undefined,
            category: filterCategory || undefined,
            status: filterStatus || undefined,
            campusId: filterCampus || undefined,
            search: searchQuery.trim() || undefined,
          },
          { auth: isGuest ? false : true }
        );
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch items', err);
        setError(err.message || 'Unable to fetch items');
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery) {
      const timeoutId = setTimeout(fetchItems, 300);
      return () => clearTimeout(timeoutId);
    }
    fetchItems();
    return undefined;
  }, [
    authLoading,
    user?.universityId,
    isGuest,
    filterType,
    filterCategory,
    filterStatus,
    filterCampus,
    searchQuery,
  ]);

  const categoryOptions = useMemo(
    () => CATEGORIES.map((cat) => ({ value: cat, label: cat })),
    []
  );

  const universityEntry = useMemo(() => {
    if (!user?.universityId || !directory.length) return null;
    return directory.find((u) => String(u._id) === String(user.universityId)) || null;
  }, [directory, user?.universityId]);

  const campusOptions = useMemo(() => {
    if (!directory.length) return [];
    if (canUseScopedFeed && universityEntry?.campuses) {
      return universityEntry.campuses.map((c) => ({ value: c._id, label: c.name }));
    }
    const opts = [];
    for (const uni of directory) {
      for (const c of uni.campuses || []) {
        opts.push({ value: c._id, label: `${uni.name} · ${c.name}` });
      }
    }
    return opts;
  }, [directory, canUseScopedFeed, universityEntry]);

  const filteredItems = items;

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 200);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterCampus('');
  };

  const hasActiveFilters = Boolean(
    searchQuery || filterType || filterCategory || filterStatus || filterCampus
  );

  const feedLabel = canUseScopedFeed
    ? (filterCampus
        ? `${user.universityName || 'Your university'} · ${campusOptions.find((c) => c.value === filterCampus)?.label || ''}`
        : user.universityName || 'Your university')
    : 'All universities';

  const feedHint = canUseScopedFeed
    ? (filterCampus ? 'Viewing selected campus' : 'All campuses in your university')
    : 'Browsing every campus on Khoj — sign in for your university feed';

  const totalActive = items.filter((item) => item.status === 'active').length;
  const campusActive = filteredItems.filter((item) => item.status === 'active').length;
  const foundCount = items.filter((item) => item.type === 'found').length;
  const lostCount = items.filter((item) => item.type === 'lost').length;

  const stats = [
    {
      label: canUseScopedFeed ? 'College Items' : 'All posts',
      value: items.length,
      icon: Package,
      color: 'primary',
      gradient: 'from-primary-50 to-surface-100',
      subtitle: `${totalActive} active posts`,
    },
    {
      label: filterCampus ? (campusOptions.find((c) => c.value === filterCampus)?.label || 'Campus') : 'Scope/Campuses',
      value: filteredItems.length,
      icon: MapPin,
      color: 'warning',
      gradient: 'from-warning-50 to-surface-100',
      subtitle: `${campusActive} active in view`,
    },
    {
      label: 'Found Items',
      value: foundCount,
      icon: Search,
      color: 'success',
      gradient: 'from-success-50 to-surface-100',
    },
    {
      label: 'Lost Items',
      value: lostCount,
      icon: AlertCircle,
      color: 'danger',
      gradient: 'from-danger-50 to-surface-100',
    },
  ];

  const showFeedBanner = canUseScopedFeed;

  if (authLoading || (user && !user.universityId)) {
    return (
      <Card className="p-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-20 md:pb-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Khoj Lost & Found
          </h1>
          <p className="text-sm text-gray-600">
            Browse posts across campus — fast, scannable, student-first.
          </p>
          {showFeedBanner && (
            <p className="text-xs font-medium text-blue-700 mt-2">
              Showing posts from {user.universityName || 'your university'}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="primary" className="text-xs">
              {feedLabel}
            </Badge>
            <span className="text-xs text-gray-500">{feedHint}</span>
          </div>
        </div>
        <Button
          onClick={() => (isGuest ? navigate('/login') : navigate('/post'))}
          icon={Package}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <span className="hidden sm:inline">{isGuest ? 'Sign in to post' : 'Post New Item'}</span>
          <span className="sm:hidden">{isGuest ? 'Sign in' : 'Post Item'}</span>
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={`${stat.label}-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 bg-white border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 leading-none">
                    {stat.value}
                  </p>
                  {stat.subtitle && <p className="text-xs text-gray-500 mt-1.5">{stat.subtitle}</p>}
                </div>
                <div className={`w-10 h-10 bg-${stat.color === 'primary' ? 'blue' : stat.color}-50 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color === 'primary' ? 'blue' : stat.color}-600`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-5 bg-white border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-700" />
              <h3 className="text-base font-semibold text-gray-900">Search & Filter</h3>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              className="lg:col-span-2"
            />
            <Select
              placeholder="All Types"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'found', label: 'Found Items' },
                { value: 'lost', label: 'Lost Items' },
              ]}
            />
            <Select
              placeholder="All Categories"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={categoryOptions}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            <Select
              placeholder="All Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'resolved', label: 'Resolved' },
              ]}
            />
            <Select
              placeholder={directory.length ? 'All Campuses' : 'Loading campuses...'}
              value={filterCampus}
              onChange={(e) => setFilterCampus(e.target.value)}
              options={campusOptions}
              className="lg:col-span-2"
            />
          </div>
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredItems.length}</span> of{' '}
                <span className="font-medium">{items.length}</span> items
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {error && (
        <Card className="p-4 border border-lost-200 bg-lost-50 text-lost-800">{error}</Card>
      )}

      {isLoading ? (
        <Card className="p-12 text-center bg-white border border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading posts...</p>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-sm text-gray-600">Try adjusting your filters or search query</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="h-full"
            >
              <Card
                hover
                onClick={() => handleItemClick(item)}
                className="h-full flex flex-col overflow-hidden bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Fixed height image container */}
                <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {item.images && item.images.length > 0 && (
                    <div className="image-placeholder w-full h-full items-center justify-center bg-gray-50 hidden">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {(!item.images || item.images.length === 0) && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3">
                    <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                      {item.type === 'found' ? 'Found' : 'Lost'}
                    </Badge>
                  </div>
                  {item.urgent && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="danger">Urgent</Badge>
                    </div>
                  )}
                </div>

                {/* Content area - fills remaining space */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title and category */}
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 text-base">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {item.universityName}
                        {item.campusName ? ` • ${item.campusName}` : ''}
                      </p>
                    </div>
                    <Badge variant="default" className="flex-shrink-0">{item.category}</Badge>
                  </div>

                  {/* Reward badge */}
                  {item.type === 'lost' && item.reward && item.reward !== 'none' && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full self-start">
                      <span className="text-sm">
                        {item.reward === 'gratitude' && '🙏'}
                        {item.reward === 'food_treat' && '🍕'}
                        {item.reward === 'coffee' && '☕'}
                        {item.reward === 'cash_reward' && '💵'}
                        {item.reward === 'gift' && '🎁'}
                      </span>
                      <span className="text-xs font-medium text-blue-700">
                        {item.reward === 'gratitude' && 'Gratitude'}
                        {item.reward === 'food_treat' && 'Food Treat'}
                        {item.reward === 'coffee' && 'Coffee'}
                        {item.reward === 'cash_reward' && 'Cash Reward'}
                        {item.reward === 'gift' && 'Gift'}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>

                  {/* Location and date - pushed to bottom */}
                  <div className="space-y-1.5 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{format(new Date(item.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-gray-100 relative">
                    <p className="text-xs text-gray-500">
                      Posted by <span className="font-medium text-gray-700">{item.userName}</span>
                    </p>
                    {isGuest && (
                      <>
                        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2 blur-sm select-none pointer-events-none" aria-hidden>
                          <p className="text-xs text-gray-600">contact@example.com</p>
                          <p className="text-xs text-gray-600 mt-0.5">+91 ••••••••••</p>
                        </div>
                        <button
                          type="button"
                          className="absolute inset-0 top-8 mx-0 flex flex-col items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm text-center px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-white transition-colors z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/login');
                          }}
                        >
                          Sign in to see contact
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <ItemDetailModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            item={selectedItem}
            isGuest={isGuest}
            currentUserId={user?.id || null}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
