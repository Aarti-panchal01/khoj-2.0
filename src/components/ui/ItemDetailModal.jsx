import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Mail, Phone, Package, AlertCircle, User, Building2, Gift } from 'lucide-react';
import { format } from 'date-fns';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import ClaimModal from './ClaimModal';

const ItemDetailModal = ({ isOpen, onClose, item }) => {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 100 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="bg-white rounded-t-3xl sm:rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-5 sm:px-6 py-4 flex items-center justify-between z-10">
            {/* Mobile drag indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full sm:hidden"></div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mt-2 sm:mt-0">Item Details</h2>
            <button
              onClick={onClose}
              className="p-2.5 sm:p-2 hover:bg-gray-100 rounded-xl sm:rounded-lg transition-colors flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-6 pb-safe">
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
                <div className="flex items-center gap-3 mb-3">
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
                
                {/* Contact Information - Only show for LOST items */}
                {item.type === 'lost' && (item.userEmail || item.userPhone) && (
                  <div className="mt-3 pt-3 border-t border-primary-200 space-y-2">
                    {item.userEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <a 
                          href={`mailto:${item.userEmail}`}
                          className="text-primary-700 hover:text-primary-800 hover:underline break-all"
                        >
                          {item.userEmail}
                        </a>
                      </div>
                    )}
                    {item.userPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <a 
                          href={`tel:${item.userPhone}`}
                          className="text-primary-700 hover:text-primary-800 hover:underline"
                        >
                          {item.userPhone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Note for FOUND items */}
                {item.type === 'found' && (
                  <div className="mt-3 pt-3 border-t border-primary-200">
                    <p className="text-xs text-gray-500 italic">
                      Contact information will be shared after your claim is approved
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Reward Section for Lost Items */}
            {item.type === 'lost' && item.reward && item.reward !== 'none' && (
              <div className="mb-6">
                <Card className="p-5 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-3xl">
                        {item.reward === 'gratitude' && '🙏'}
                        {item.reward === 'food_treat' && '🍕'}
                        {item.reward === 'coffee' && '☕'}
                        {item.reward === 'cash_reward' && '💵'}
                        {item.reward === 'gift' && '🎁'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-5 h-5 text-amber-700" />
                        <h4 className="text-lg font-bold text-amber-900">Reward Offered</h4>
                      </div>
                      <p className="text-sm text-amber-800">
                        The owner is offering{' '}
                        <span className="font-bold">
                          {item.reward === 'gratitude' && 'Gratitude'}
                          {item.reward === 'food_treat' && 'a Food Treat'}
                          {item.reward === 'coffee' && 'Coffee'}
                          {item.reward === 'cash_reward' && 'a Cash Reward'}
                          {item.reward === 'gift' && 'a Gift'}
                        </span>
                        {' '}for finding this item
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Contact/Claim Section */}
            {item.type === 'found' ? (
              // Claim button for FOUND items
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-400">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  Is This Your Item?
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  If you believe this is your lost item, click below to submit a claim. You'll need to answer verification questions to prove ownership.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setIsClaimModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl text-white font-bold text-base py-4"
                >
                  🔐 Claim This Item
                </Button>
              </div>
            ) : (
              // Contact section for LOST items - show contact buttons based on contactPreference
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border-2 border-primary-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  Contact Owner
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Have information about this item? Reach out to the owner:
                </p>
                <div className="space-y-3">
                  {/* Show email button if contactPreference includes email AND userEmail is available */}
                  {(item.contactPreference === 'email' || item.contactPreference === 'both') && item.userEmail && (
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
                  {/* Show phone button if contactPreference includes phone AND userPhone is available */}
                  {(item.contactPreference === 'phone' || item.contactPreference === 'both') && item.userPhone && (
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
                  {/* Show warning only if no contact info is available */}
                  {!item.userEmail && !item.userPhone && (
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
            )}
          </div>
        </motion.div>
      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <ClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          item={item}
          onClaimSuccess={() => {
            // Optionally refresh or show success message
          }}
        />
      )}
    </>
  );
};

export default ItemDetailModal;
