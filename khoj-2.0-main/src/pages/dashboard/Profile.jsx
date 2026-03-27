import { useState, useEffect } from 'react';
import { Mail, Phone, Building2, Package, Search, Award, Edit, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ItemsAPI } from '../../lib/apiClient';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userItems, setUserItems] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState('');

  const loadUserItems = async () => {
    if (!user) return;
    setItemsLoading(true);
    setItemsError('');
    try {
      const items = await ItemsAPI.mine();
      setUserItems(items);
    } catch (error) {
      console.error('Failed to load user items', error);
      setItemsError(error.message || 'Unable to load your posts');
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setUserItems([]);
      setItemsLoading(false);
      return;
    }
    loadUserItems();
  }, [user]);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await ItemsAPI.remove(itemToDelete._id || itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      loadUserItems();
    } catch (error) {
      console.error('Delete item failed', error);
    }
  };

  const handleEditClick = (itemId) => {
    navigate(`/post?edit=${itemId}`);
  };

  const stats = {
    total: userItems.length,
    found: userItems.filter(i => i.type === 'found').length,
    lost: userItems.filter(i => i.type === 'lost').length,
    resolved: userItems.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl overflow-hidden shadow-xl">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/20">
                  <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online Status */}
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-success-500 rounded-full border-4 border-white"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {user?.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                  {user?.college && (
                    <Badge variant="primary" className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-primary-800 bg-white text-center">
                      {user.college}
                    </Badge>
                  )}
                  {user?.campus && (
                    <span className="text-xs font-semibold text-white/90 bg-white/20 rounded-full px-3 py-1">
                      {user.campus}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-white/90">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full"></div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-white/90">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">
                      {user?.college}
                      {user?.campus ? ` • ${user.campus}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-white/80">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{user?.phone}</span>
                </div>
              </div>

              {/* Reputation Badge */}
              <div className="flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center min-w-[120px]">
                  <Award className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                  <p className="text-xs text-white/80 uppercase tracking-wider mb-1">Reputation</p>
                  <p className="text-3xl font-bold text-white">{user?.reputation || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="p-5 border-l-4 border-l-primary-500 bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="p-5 border-l-4 border-l-success-500 bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Found Items</p>
                  <p className="text-3xl font-bold text-success-600">{stats.found}</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="p-5 border-l-4 border-l-danger-500 bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Lost Items</p>
                  <p className="text-3xl font-bold text-danger-600">{stats.lost}</p>
                </div>
                <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-danger-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="p-5 border-l-4 border-l-warning-500 bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-warning-600">{stats.resolved}</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-warning-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* My Posts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Posts</h2>
              {userItems.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">{userItems.length} {userItems.length === 1 ? 'item' : 'items'}</p>
              )}
            </div>
          </div>

          {itemsError && (
            <div className="mb-4 p-3 rounded-lg border border-danger-200 bg-danger-50 text-danger-700 text-sm">
              {itemsError}
            </div>
          )}

          {itemsLoading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-b-2 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your posts...</p>
            </div>
          ) : userItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Start by posting your first lost or found item</p>
              <Button onClick={() => navigate('/post')} icon={Package}>
                Post Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-xl transition-all bg-white">
                  {/* Image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(item.id)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                        {item.type === 'found' ? 'Found' : 'Lost'}
                      </Badge>
                      <Badge variant={item.status === 'active' ? 'success' : 'default'}>
                        {item.status}
                      </Badge>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{item.category}</span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
                      <span className="mx-1">•</span>
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Item">
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete "<span className="font-semibold">{itemToDelete?.title}</span>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </div>
  );
};

export default Profile;
