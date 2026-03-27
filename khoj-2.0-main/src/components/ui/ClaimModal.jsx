import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, FileText, AlertCircle } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { ClaimsAPI } from '../../lib/apiClient';

const ClaimModal = ({ isOpen, onClose, item, onClaimSuccess }) => {
  const [formData, setFormData] = useState({
    whereList: '',
    whenList: '',
    specificDetails: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.whereList.trim()) {
      setError('Please specify where you lost this item');
      return;
    }
    if (!formData.whenList.trim()) {
      setError('Please specify when you lost this item');
      return;
    }
    if (!formData.specificDetails.trim()) {
      setError('Please provide specific details about the item');
      return;
    }

    setLoading(true);
    try {
      await ClaimsAPI.create({
        itemId: item.id,
        whereList: formData.whereList,
        whenList: formData.whenList,
        specificDetails: formData.specificDetails,
      });

      if (onClaimSuccess) onClaimSuccess();
      onClose();
    } catch (err) {
      console.error('Claim error', err);
      setError(err.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-60 z-50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-2xl w-full max-w-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Claim This Item</h2>
                <p className="text-sm text-primary-100 mt-1">Help us verify you're the rightful owner</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Item Preview */}
            <Card className="p-4 mb-6 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-4">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
              </div>
            </Card>

            {/* Info Alert */}
            <Card className="p-4 mb-6 bg-blue-50 border-2 border-blue-200">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Verification Required</p>
                  <p className="text-sm text-blue-700">
                    Please answer these questions to help verify ownership. Your responses will be sent to the person who found this item.
                  </p>
                </div>
              </div>
            </Card>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Card className="p-4 bg-red-50 border-2 border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </Card>
              )}

              {/* Where */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <MapPin className="w-4 h-4" />
                  Where did you lose this item? <span className="text-yellow-300">*</span>
                </label>
                <textarea
                  name="whereList"
                  value={formData.whereList}
                  onChange={handleChange}
                  placeholder="e.g., Main Library, 2nd floor near the study tables"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white/90 backdrop-blur transition-all"
                  required
                />
              </div>

              {/* When */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Calendar className="w-4 h-4" />
                  When did you lose this item? <span className="text-yellow-300">*</span>
                </label>
                <textarea
                  name="whenList"
                  value={formData.whenList}
                  onChange={handleChange}
                  placeholder="e.g., Last Tuesday around 3 PM, or Yesterday morning"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white/90 backdrop-blur transition-all"
                  required
                />
              </div>

              {/* Specific Details */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <FileText className="w-4 h-4" />
                  Tell one specific detail about this item <span className="text-yellow-300">*</span>
                </label>
                <textarea
                  name="specificDetails"
                  value={formData.specificDetails}
                  onChange={handleChange}
                  placeholder="e.g., It has a blue keychain attached, scratches on the back, my name written inside, specific brand/model, etc."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white/90 backdrop-blur transition-all"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={onClose}
                  className="bg-white/90 hover:bg-white border-2 border-white/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  className="bg-white text-primary-700 hover:bg-white/90 shadow-lg"
                >
                  Submit Claim
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ClaimModal;
