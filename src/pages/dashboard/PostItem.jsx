import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { ItemsAPI, UploadAPI } from '../../lib/apiClient';
import { CATEGORIES } from '../../lib/constants';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';

const PostItem = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const [formData, setFormData] = useState({
    type: 'found',
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    images: [],
    urgent: false,
    contactPreference: 'both',
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
          date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
          images: item.images || [],
          urgent: item.urgent,
          contactPreference: item.contactPreference || 'both',
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

    // Validate file sizes (max 10MB each)
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`Image ${file.name} is too large. Maximum size is 10MB`);
        e.target.value = ''; // Reset file input
        return;
      }
    }

    setUploadingImages(true);
    setError('');

    try {
      const result = await UploadAPI.uploadImages(files);
      setFormData({ ...formData, images: result.images });
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            {isEditMode ? '✏️ Edit Item' : '📝 Post an Item'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            {isEditMode ? 'Update your item details' : 'Help reunite items with their owners'}
          </p>
        </div>

        <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-white to-gray-50/30 border-2 border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            {/* Item Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Item Type <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.type === 'found' ? 'border-success-500 bg-success-50' : 'border-gray-300 hover:border-gray-400'
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
                    <p className="text-sm sm:text-base font-medium text-gray-900">Found Item</p>
                    <p className="text-xs sm:text-sm text-gray-500">I found something</p>
                  </div>
                  {formData.type === 'found' && (
                    <div className="w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>

                <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.type === 'lost' ? 'border-danger-500 bg-danger-50' : 'border-gray-300 hover:border-gray-400'
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
                    <p className="text-sm sm:text-base font-medium text-gray-900">Lost Item</p>
                    <p className="text-xs sm:text-sm text-gray-500">I lost something</p>
                  </div>
                  {formData.type === 'lost' && (
                    <div className="w-5 h-5 bg-danger-500 rounded-full flex items-center justify-center">
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-danger-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed description including distinguishing features, colors, brands, etc."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
              max={new Date().toISOString().split('T')[0]}
            />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Images (Optional - Max 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-primary-500 transition-colors">
                {uploadingImages ? (
                  <div className="py-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Uploading images...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <label className="cursor-pointer">
                      <span className="text-sm sm:text-base text-primary-600 hover:text-primary-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-sm sm:text-base text-gray-600"> or drag and drop</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB each (Max 5 images)</p>
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
              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-warning-600" />
                    <span className="font-medium text-gray-900">Mark as Urgent</span>
                  </div>
                  <p className="text-sm text-gray-500">For important items like ID cards, keys, or wallets</p>
                </div>
              </label>
            )}

            {/* Contact Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
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
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

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
                {isEditMode ? '✓ Update Item' : '📤 Post Item'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default PostItem;
