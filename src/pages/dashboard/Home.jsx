import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, AlertCircle, Package } from 'lucide-react';
import { CATEGORIES } from '../../lib/constants';
import { getRewardStyle } from '../../lib/rewardStyles';
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
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Hero Section - Addictive & Conversion Focused */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl p-6 md:p-10 shadow-lg"
      >
        {/* Subtle blur glow behind title */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl -z-10" />
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex-1">
            {/* Line 1: KHOJ */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-4xl font-bold text-blue-600 tracking-tight leading-none mb-2"
            >
              KHOJ
            </motion.h1>
            
            {/* Line 2: Lost Something on Campus? */}
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-2xl font-semibold text-gray-900 leading-tight mb-2"
            >
              Lost Something on Campus?
            </motion.h2>
            
            {/* Subtext */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-sm text-gray-600 mt-2 mb-4 leading-relaxed"
            >
              Post it. Find it. Get it back — faster than asking around.
            </motion.p>
            
            {/* Dynamic Trust Indicator */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 mt-4"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              {user?.universityName 
                ? `Live across ${user.universityName}`
                : 'Live across campuses near you'
              }
            </motion.div>
          </div>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="w-full sm:w-auto"
          >
            <motion.button
              onClick={() => (isGuest ? navigate('/login') : navigate('/post'))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group min-h-[48px]"
            >
              <Package className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>{isGuest ? 'Sign in to Post' : 'Post New Item'}</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards - Premium Feel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={`${stat.label}-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
          >
            <Card className="p-4 md:p-5 bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 rounded-2xl group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
                  <motion.p 
                    className="text-2xl md:text-3xl font-bold text-gray-900 leading-none"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {stat.value}
                  </motion.p>
                  {stat.subtitle && <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>}
                </div>
                <motion.div 
                  className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${stat.color === 'primary' ? 'from-blue-50 to-blue-100' : `from-${stat.color}-50 to-${stat.color}-100`} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <stat.icon className={`w-6 h-6 md:w-7 md:h-7 text-${stat.color === 'primary' ? 'blue' : stat.color}-600`} />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter Section - Smart Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.15 }}
      >
        <Card className="p-5 md:p-7 bg-white/90 backdrop-blur-md border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-sm"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Filter className="w-5 h-5 text-blue-600" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900">Search & Filter</h3>
            </div>
            {hasActiveFilters && (
              <motion.button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All
              </motion.button>
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
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-5 pt-5 border-t border-gray-100"
            >
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-blue-600">{filteredItems.length}</span> of{' '}
                <span className="font-semibold">{items.length}</span> items
              </p>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {error && (
        <Card className="p-4 border border-lost-200 bg-lost-50 text-lost-800">{error}</Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-full flex flex-col overflow-hidden animate-pulse">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
              <div className="p-4 flex flex-col flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="mt-auto space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-16 text-center bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No items found</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your filters or search query to find what you're looking for
            </p>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="primary"
                className="mx-auto"
              >
                Clear All Filters
              </Button>
            )}
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="h-full"
            >
              <Card
                hover
                onClick={() => handleItemClick(item)}
                className="h-full flex flex-col overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-2xl group"
              >
                {/* Fixed height image container */}
                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
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
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <Package className="w-12 h-12 text-gray-300 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  )}
                  
                  {/* Badges - Top Left */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {/* Type Badge (Found/Lost) */}
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Badge variant={item.type === 'found' ? 'found' : 'lost'} className="shadow-md backdrop-blur-sm">
                        {item.type === 'found' ? 'Found' : 'Lost'}
                      </Badge>
                    </motion.div>
                    
                    {/* Reward Badge - Only for Lost Items with Distinct Colors */}
                    {item.type === 'lost' && item.reward && item.reward !== 'none' && (
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 ${getRewardStyle(item.reward).bgOpacity} ${getRewardStyle(item.reward).text} ${getRewardStyle(item.reward).border} border text-xs font-bold rounded-full shadow-md backdrop-blur-sm transition-all duration-200`}
                      >
                        <span className="text-sm">
                          {getRewardStyle(item.reward).emoji}
                        </span>
                        <span>
                          {getRewardStyle(item.reward).label}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Urgent Badge - Top Right */}
                  {item.urgent && (
                    <div className="absolute top-3 right-3">
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Badge variant="danger" className="shadow-md backdrop-blur-sm">Urgent</Badge>
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Content area - fills remaining space with consistent height */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  {/* Title and category */}
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 text-base group-hover:text-blue-600 transition-colors duration-200">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {item.universityName}
                        {item.campusName ? ` • ${item.campusName}` : ''}
                      </p>
                    </div>
                    <Badge variant="default" className="flex-shrink-0">{item.category}</Badge>
                  </div>

                  {/* Description - Fixed height with line clamp */}
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
                          className="absolute inset-0 top-8 mx-0 flex flex-col items-center justify-center rounded-lg bg-white/95 backdrop-blur-sm text-center px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-white hover:text-blue-800 transition-all duration-200 z-10"
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
