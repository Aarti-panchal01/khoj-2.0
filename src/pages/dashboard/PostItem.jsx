import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { ItemsAPI, UploadAPI } from '../../lib/apiClient';
import { CATEGORIES } from '../../lib/constants';
import { REWARD_STYLES, getRewardStyle } from '../../lib/rewardStyles';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';

const PostItem = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const todayLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  const [formData, setFormData] = useState({
    type: 'found',
    title: '',
    description: '',
    category: '',
    location: '',
    date: todayLocal,
    images: [],
    urgent: false,
    reward: 'none',
    contactPreference: 'both',
    status: 'active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const navigate = useNavigate();

  // Load item data if in edit mode
  useEffect(() => {
    const fetchItem = async () => {
      if (!(isEditMode && editId)) return;
      try {
        const item = await ItemsAPI.getById(editId);
        setFormData({
          type: item.type,
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          date: item.date ? item.date.split('T')[0] : todayLocal,
          images: item.images || [],
          urgent: item.urgent,
          reward: item.reward || 'none',
          contactPreference: item.contactPreference || 'both',
          status: item.status || 'active',
        });
      } catch (err) {
        console.error('Failed to load item', err);
        setError('Unable to load the selected item');
      }
    };
    fetchItem();
  }, [isEditMode, editId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file count (max 5 images)
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      e.target.value = ''; // Reset file input
      return;
    }

    // Keep in sync with backend multer max size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`Image ${file.name} is too large. Maximum size is 5MB`);
        e.target.value = ''; // Reset file input
        return;
      }
    }

    setUploadingImages(true);
    setError('');

    try {
      const result = await UploadAPI.uploadImages(files);
      setFormData((prev) => ({ ...prev, images: [...(prev.images || []), ...(result.images || [])].slice(0, 5) }));
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.message || 'Failed to upload images. Please try again.');
      e.target.value = ''; // Reset file input on error
    } finally {
      setUploadingImages(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.category) return 'Category is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.date) return 'Date is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        await ItemsAPI.update(editId, formData);
      } else {
        await ItemsAPI.create(formData);
      }
      navigate('/profile');
    } catch (err) {
      console.error('Save item error', err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'post'} item`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl khoj-heading font-extrabold leading-[0.95] text-ink-950">
            {isEditMode ? 'Edit post' : 'Post an item'}
          </h1>
          <p className="text-sm sm:text-base text-ink-700 mt-1.5 sm:mt-2">
            {isEditMode ? 'Update your item details' : 'Help reunite items with their owners'}
          </p>
        </div>

        <Card className="p-4 sm:p-5 md:p-6 bg-surface-0 border border-ink-200">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="bg-lost-50 border border-lost-200 text-lost-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            {/* Item Type */}
            <div>
              <label className="block text-sm font-semibold text-ink-800 mb-2 sm:mb-3">
                Item type <span className="text-lost-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.type === 'found' ? 'border-found-600 bg-found-50' : 'border-ink-300 hover:border-ink-400'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="found"
                    checked={formData.type === 'found'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-bold text-ink-950 khoj-heading">Found</p>
                    <p className="text-xs sm:text-sm text-ink-600">I found something</p>
                  </div>
                  {formData.type === 'found' && (
                    <div className="w-5 h-5 bg-found-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>

                <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.type === 'lost' ? 'border-lost-600 bg-lost-50' : 'border-ink-300 hover:border-ink-400'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="lost"
                    checked={formData.type === 'lost'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-bold text-ink-950 khoj-heading">Lost</p>
                    <p className="text-xs sm:text-sm text-ink-600">I lost something</p>
                  </div>
                  {formData.type === 'lost' && (
                    <div className="w-5 h-5 bg-lost-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <Input
              label="Title"
              name="title"
              placeholder="e.g., Black iPhone 13 with blue case"
              value={formData.title}
              onChange={handleChange}
              required
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-ink-800 mb-1.5">
                Description <span className="text-lost-600">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed description including distinguishing features, colors, brands, etc."
                rows={4}
                className="w-full px-4 py-2.5 border border-ink-300 rounded-xl bg-surface-0 text-ink-950 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-600 transition-all duration-200"
                required
              />
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={CATEGORIES}
                required
              />

              <Input
                label="Location"
                name="location"
                placeholder="e.g., Main Library Entrance"
                value={formData.location}
                onChange={handleChange}
                icon={MapPin}
                required
              />
            </div>

            {/* Date */}
            <Input
              label={formData.type === 'found' ? 'Date Found' : 'Date Lost'}
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              icon={Calendar}
              required
              max={todayLocal}
              wrapperClassName="w-full overflow-hidden rounded-xl border border-ink-300 bg-surface-0"
              inputClassName="w-full max-w-full box-border appearance-none !border-0 !rounded-none"
              inputStyle={{ width: '100%', maxWidth: '100%' }}
            />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-ink-800 mb-2 sm:mb-3">
                Images (Optional - Max 5)
              </label>
              <div className="border-2 border-dashed border-ink-300 rounded-2xl p-4 sm:p-6 text-center hover:border-primary-600 transition-colors bg-surface-0">
                {uploadingImages ? (
                  <div className="py-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-ink-700">Uploading images...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-ink-400 mx-auto mb-2 sm:mb-3" />
                    <label className="cursor-pointer">
                      <span className="text-sm sm:text-base text-primary-900 hover:text-primary-950 font-bold">
                        Click to upload
                      </span>
                      <span className="text-sm sm:text-base text-ink-700"> or drag and drop</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                    <p className="text-xs text-ink-600 mt-2">PNG, JPG up to 5MB each (Max 5 images)</p>
                  </>
                )}
              </div>

              {/* Display uploaded images */}
              {formData.images && formData.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urgent Checkbox */}
            {formData.type === 'lost' && (
              <>
                <label className="flex items-center gap-3 p-4 border border-ink-300 rounded-2xl cursor-pointer hover:bg-surface-100">
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-700 border-ink-300 rounded focus:ring-primary-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-lost-600" />
                      <span className="font-bold text-ink-950 khoj-heading">Mark as urgent</span>
                    </div>
                    <p className="text-sm text-ink-700">For important items like ID cards, keys, or wallets</p>
                  </div>
                </label>

                {/* Reward Offering */}
                <div>
                  <label className="block text-sm font-semibold text-ink-800 mb-3">
                    Reward offering
                  </label>
                  <p className="text-sm text-ink-700 mb-4">Offer a small reward to increase replies (optional).</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(REWARD_STYLES).map(([value, style]) => {
                      const isSelected = formData.reward === value;
                      
                      return (
                        <motion.button
                          key={value}
                          type="button"
                          onClick={() => setFormData({ ...formData, reward: value })}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all duration-200
                            ${isSelected 
                              ? `${style.selectedBorder} ${style.selectedBg} ring-2 ring-offset-2 ${style.ring}` 
                              : `${style.border} bg-white ${style.hoverBorder}`
                            }
                            hover:shadow-md
                          `}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">{style.emoji}</span>
                            <span className={`text-sm font-semibold ${isSelected ? 'text-ink-900' : 'text-ink-700'}`}>
                              {style.fullLabel}
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`absolute top-2 right-2 w-5 h-5 ${style.checkmark} rounded-full flex items-center justify-center`}
                            >
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Contact Preference */}
            <div>
              <label className="block text-sm font-semibold text-ink-800 mb-3">
                Contact Preference
              </label>
              <div className="space-y-2">
                {[
                  { value: 'both', label: 'Email & Phone' },
                  { value: 'email', label: 'Email Only' },
                  { value: 'phone', label: 'Phone Only' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="contactPreference"
                      value={option.value}
                      checked={formData.contactPreference === option.value}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-700 border-ink-300 focus:ring-primary-200"
                    />
                    <span className="text-ink-800">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status - Only show in edit mode */}
            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'active', label: 'Active', description: 'Item is still lost/found' },
                    { value: 'resolved', label: 'Resolved', description: 'Item has been returned/claimed' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={formData.status === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium">{option.label}</span>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => navigate('/')}
                className="order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="order-1 sm:order-2 shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300"
              >
                {isEditMode ? 'Update post' : 'Post item'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default PostItem;
