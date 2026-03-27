import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Mail, Phone, Package, AlertCircle, User, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';

const ItemDetailModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const handleContact = (method) => {
    switch (method) {
      case 'email':
        if (item.userEmail) {
          window.location.href = `mailto:${item.userEmail}?subject=Regarding: ${item.title}`;
        }
        break;
      case 'phone':
        if (item.userPhone) {
          window.location.href = `tel:${item.userPhone}`;
        }
        break;
      case 'both':
        // Show both options - user can choose
        break;
      default:
        break;
    }
  };

  const canShowEmail = item.contactPreference === 'email' || item.contactPreference === 'both';
  const canShowPhone = item.contactPreference === 'phone' || item.contactPreference === 'both';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Item Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6">
            {/* Image Gallery */}
            {item.images && item.images.length > 0 ? (
              <div className="mb-6">
                <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                      {item.type === 'found' ? '✓ Found' : '✗ Lost'}
                    </Badge>
                  </div>
                  {item.urgent && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="danger" className="animate-pulse">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Urgent
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 relative h-48 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                <Package className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                    {item.type === 'found' ? '✓ Found' : '✗ Lost'}
                  </Badge>
                </div>
                {item.urgent && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="danger" className="animate-pulse">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Urgent
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Title and Category */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{item.title}</h3>
                <Badge variant="default" className="flex-shrink-0">{item.category}</Badge>
              </div>

              {/* Description */}
              <Card className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </Card>
            </div>

            {/* Details Section */}
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Details</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <Card className="p-4 border-2 border-gray-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                      <p className="text-sm font-semibold text-gray-900 break-words">{item.location}</p>
                    </div>
                  </div>
                </Card>

                {/* Date */}
                <Card className="p-4 border-2 border-gray-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        {item.type === 'found' ? 'Date Found' : 'Date Lost'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {format(new Date(item.date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {item.college && (
                <Card className="p-4 border-2 border-gray-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        College & Campus
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.college}
                      </p>
                      {item.campus && (
                        <p className="text-xs text-gray-600 mt-1">{item.campus}</p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Status */}
              <Card className="p-4 border-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.status === 'active' ? 'bg-success-500 animate-pulse' : 'bg-gray-400'}`} />
                  <p className="text-sm font-medium text-gray-700">
                    Status: <span className={`${item.status === 'active' ? 'text-success-600' : 'text-gray-600'} font-semibold`}>
                      {item.status === 'active' ? 'Active' : item.status}
                    </span>
                  </p>
                </div>
              </Card>
            </div>

            {/* Posted By Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Posted By</h4>
              <Card className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.userName}</p>
                    {(item.college || item.campus) && (
                      <p className="text-sm text-gray-600">
                        {item.college}
                        {item.campus ? ` • ${item.campus}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-4 sm:p-6 border-2 border-primary-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💬</span>
                Contact Owner
              </h4>

              <p className="text-sm text-gray-600 mb-4">
                Reach out to the person who posted this item:
              </p>

              <div className="space-y-3">
                {canShowEmail && item.userEmail && (
                  <Button
                    variant="primary"
                    fullWidth
                    icon={Mail}
                    onClick={() => handleContact('email')}
                    className="shadow-md hover:shadow-lg transition-all"
                  >
                    Contact via Email
                  </Button>
                )}

                {canShowPhone && item.userPhone && (
                  <Button
                    variant="outline"
                    fullWidth
                    icon={Phone}
                    onClick={() => handleContact('phone')}
                    className="border-2"
                  >
                    Contact via Phone
                  </Button>
                )}

                {!canShowEmail && !canShowPhone && (
                  <Card className="p-4 bg-yellow-50 border border-yellow-200">
                    <p className="text-sm text-yellow-800 text-center">
                      No contact methods available for this item.
                    </p>
                  </Card>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Posted on {format(new Date(item.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ItemDetailModal;
