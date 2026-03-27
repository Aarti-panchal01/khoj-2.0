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
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCampus, setFilterCampus] = useState('');  // stores campusId string
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [universityEntry, setUniversityEntry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.universityId) return;
    const fetchUniversityDirectory = async () => {
      try {
        const directory = await UniversityAPI.list();
        const entry = directory.find((u) => String(u._id) === String(user.universityId));
        setUniversityEntry(entry || null);
      } catch (err) {
        console.error('Failed to load university directory', err);
      }
    };
    fetchUniversityDirectory();
  }, [user?.universityId]);

  useEffect(() => {
    if (!user?.universityId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    const fetchItems = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await ItemsAPI.list({
          type: filterType || undefined,
          category: filterCategory || undefined,
          status: filterStatus || undefined,
          // campusId is an ObjectId string — passed as optional filter, not restriction
          campusId: filterCampus || undefined,
          search: searchQuery.trim() || undefined,
        });
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
    } else {
      fetchItems();
    }
  }, [user?.universityId, filterType, filterCategory, filterStatus, filterCampus, searchQuery]);

  const categoryOptions = useMemo(
    () => CATEGORIES.map(cat => ({
      value: cat,
      label: cat
    })),
    []
  );

  const campusOptions = useMemo(() => {
    if (!universityEntry?.campuses) return [];
    return universityEntry.campuses.map((c) => ({ value: c._id, label: c.name }));
  }, [universityEntry]);

  // Items are already filtered by the API, no need for client-side filtering
  const filteredItems = items;

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 200); // Clear after animation
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterCampus('');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    filterType ||
    filterCategory ||
    filterStatus ||
    filterCampus
  );

  const campusLabel = filterCampus
    ? `${user?.universityName || 'Your University'} • ${campusOptions.find(c => c.value === filterCampus)?.label || ''}`
    : user?.universityName || 'Your University';
  const campusDescription = filterCampus ? 'Viewing selected campus' : 'All campuses in your university';

  const totalActive = items.filter(item => item.status === 'active').length;
  const campusActive = filteredItems.filter(item => item.status === 'active').length;
  const foundCount = items.filter(item => item.type === 'found').length;
  const lostCount = items.filter(item => item.type === 'lost').length;

  const stats = [
    {
      label: 'College Items',
      value: items.length,
      icon: Package,
      color: 'primary',
      gradient: 'from-primary-50 to-blue-50',
      subtitle: `${totalActive} active posts`,
    },
    {
      label: filterCampus ? filterCampus : 'All Campuses',
      value: filteredItems.length,
      icon: MapPin,
      color: 'warning',
      gradient: 'from-warning-50 to-yellow-50',
      subtitle: `${campusActive} active on campus`,
    },
    {
      label: 'Found Items',
      value: foundCount,
      icon: Search,
      color: 'success',
      gradient: 'from-success-50 to-green-50',
    },
    {
      label: 'Lost Items',
      value: lostCount,
      icon: AlertCircle,
      color: 'danger',
      gradient: 'from-danger-50 to-red-50',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Khoj - Lost & Found
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 flex items-center gap-2">
            <span className="hidden sm:inline">🔍</span>
            Browse and search for items in your campus
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="primary" className="text-xs sm:text-sm">
              {campusLabel}
            </Badge>
            <span className="text-xs text-gray-500">
              {campusDescription}
            </span>
          </div>
        </div>
        <Button
          onClick={() => navigate('/post')}
          icon={Package}
          className="w-full sm:w-auto shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300"
        >
          <span className="hidden sm:inline">Post New Item</span>
          <span className="sm:hidden">Post Item</span>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={`${stat.label}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-3 sm:p-4 md:p-5 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br ${stat.gradient} border-0`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-${stat.color}-600 mt-1`}>
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-${stat.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 ring-4 ring-${stat.color}-50`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Search & Filter</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3">
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
              placeholder="All Campuses"
              value={filterCampus}
              onChange={(e) => setFilterCampus(e.target.value)}
              options={campusOptions}
              className="lg:col-span-2"
            />
          </div>

          {/* Show active filter count */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-semibold text-primary-600">{filteredItems.length}</span> of <span className="font-semibold">{items.length}</span> items
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Items Grid */}
      {error && (
        <Card className="p-4 border border-danger-200 bg-danger-50 text-danger-700">
          {error}
        </Card>
      )}

      {isLoading ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading campus posts...</p>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-sm sm:text-base text-gray-600">Try adjusting your filters or search query</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card hover onClick={() => handleItemClick(item)} className="overflow-hidden group cursor-pointer border-2 border-transparent hover:border-primary-300">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Image failed to load:', {
                          url: item.images[0],
                          itemId: item.id,
                          itemTitle: item.title,
                        });
                        // Hide broken image and show placeholder instead
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Placeholder for broken images */}
                  {item.images && item.images.length > 0 && (
                    <div className="image-placeholder w-full h-full flex items-center justify-center bg-white" style={{ display: 'none' }}>
                      <Package className="w-16 h-16 text-gray-300 group-hover:text-primary-400 transition-colors" />
                    </div>
                  )}
                  {/* Placeholder for items without images */}
                  {(!item.images || item.images.length === 0) && (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      <Package className="w-16 h-16 text-gray-300 group-hover:text-primary-400 transition-colors" />
                    </div>
                  )}
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

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                      <p className="text-xs font-semibold text-primary-600 mt-0.5 line-clamp-1">
                        {item.universityName}
                        {item.campusName ? ` • ${item.campusName}` : ''}
                      </p>
                    </div>
                    <Badge variant="default">{item.category}</Badge>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(item.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Posted by <span className="font-medium text-gray-700">{item.userName}</span>
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ItemDetailModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            item={selectedItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
