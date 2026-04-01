import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Package, AlertCircle, User, Building2, Gift, Mail, Phone, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import ClaimModal from './ClaimModal';

const ItemDetailModal = ({ isOpen, onClose, item, isGuest = false, currentUserId = null }) => {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !item) return null;

  const isOwner = currentUserId && String(item.user) === String(currentUserId);

  const uniLine = [item.universityName, item.campusName].filter(Boolean).join(' · ');

  const email = item.userEmail?.trim() || '';
  const phone = item.userPhone?.trim() || '';
  const hasEmail = Boolean(email);
  const hasPhone = Boolean(phone);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 100 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="bg-surface-0 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-ink-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div className="sticky top-0 bg-surface-0 border-b border-ink-200 px-5 sm:px-6 py-4 flex items-center justify-between z-10">
            {/* Mobile drag indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-ink-200 rounded-full sm:hidden"></div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-ink-950 mt-2 sm:mt-0 khoj-heading">Item details</h2>
            <button
              onClick={onClose}
              className="p-2.5 sm:p-2 hover:bg-surface-100 rounded-xl sm:rounded-2xl transition-colors flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-ink-600" />
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
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                      {item.type === 'found' ? '✓ Found' : '✗ Lost'}
                    </Badge>
                    {/* Reward Badge */}
                    {item.type === 'lost' && item.reward && item.reward !== 'none' && (
                      <Badge className="bg-gradient-to-r from-primary-500 to-primary-700 text-white border-0 shadow-lg">
                        {item.reward === 'gratitude' && '🙏 Gratitude'}
                        {item.reward === 'food_treat' && '🍕 Food Treat'}
                        {item.reward === 'coffee' && '☕ Coffee'}
                        {item.reward === 'cash_reward' && '💵 Cash Reward'}
                        {item.reward === 'gift' && '🎁 Gift'}
                      </Badge>
                    )}
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
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                    {item.type === 'found' ? '✓ Found' : '✗ Lost'}
                  </Badge>
                  {/* Reward Badge */}
                  {item.type === 'lost' && item.reward && item.reward !== 'none' && (
                  <Badge className="bg-gradient-to-r from-primary-500 to-primary-700 text-white border-0 shadow-lg">
                      {item.reward === 'gratitude' && '🙏 Gratitude'}
                      {item.reward === 'food_treat' && '🍕 Food Treat'}
                      {item.reward === 'coffee' && '☕ Coffee'}
                      {item.reward === 'cash_reward' && '💵 Cash Reward'}
                      {item.reward === 'gift' && '🎁 Gift'}
                    </Badge>
                  )}
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
                <h3 className="text-2xl sm:text-3xl font-extrabold text-ink-950 khoj-heading">{item.title}</h3>
                <Badge variant="default" className="flex-shrink-0">{item.category}</Badge>
              </div>

              {/* Description */}
              <Card className="p-4 bg-surface-100 border border-ink-200">
                <p className="text-base text-ink-800 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </Card>
            </div>

            {/* Details Section */}
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-extrabold text-ink-950 khoj-heading">Details</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <Card className="p-4 border-2 border-ink-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1">Location</p>
                      <p className="text-sm font-bold text-ink-950 break-words">{item.location}</p>
                    </div>
                  </div>
                </Card>

                {/* Date */}
                <Card className="p-4 border-2 border-ink-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-surface-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-ink-800" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1">
                        {item.type === 'found' ? 'Date Found' : 'Date Lost'}
                      </p>
                      <p className="text-sm font-bold text-ink-950">
                        {format(new Date(item.date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {(item.universityName || item.college) && (
                <Card className="p-4 border-2 border-ink-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary-900" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1">
                        University &amp; Campus
                      </p>
                      <p className="text-sm font-bold text-ink-950">{uniLine}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Status */}
              <Card className="p-4 border-2 border-ink-200">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.status === 'active' ? 'bg-found-600 animate-pulse' : 'bg-ink-400'}`} />
                  <p className="text-sm font-semibold text-ink-700">
                    Status: <span className={`${item.status === 'active' ? 'text-found-700' : 'text-ink-600'} font-bold`}>
                      {item.status === 'active' ? 'Active' : item.status}
                    </span>
                  </p>
                </div>
              </Card>
            </div>

            {/* Posted By Section */}
            <div className="mb-6">
              <h4 className="text-lg font-extrabold text-ink-950 mb-3 khoj-heading">Posted by</h4>
              <Card className="p-4 bg-primary-50/50 border-2 border-primary-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-ink-950">{item.userName}</p>
                    {uniLine && <p className="text-sm text-ink-700">{uniLine}</p>}
                  </div>
                </div>

                {item.type === 'found' && (
                  <div className="mt-3 pt-3 border-t border-primary-200 text-xs text-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-900" />
                      Posted {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-primary-900" />
                      Category: {item.category}
                    </p>
                    <p className="text-primary-900 font-semibold">Claim flow unlocks contact after approval</p>
                  </div>
                )}
                
                {/* Contact Information - Only show for LOST items */}
                {item.type === 'lost' && (item.userEmail || item.userPhone) && (
                  <div className="mt-3 pt-3 border-t border-primary-200 space-y-2">
                    {item.userEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-primary-900 flex-shrink-0" />
                        <a 
                          href={`mailto:${item.userEmail}`}
                          className="text-primary-900 hover:text-primary-950 hover:underline break-all font-semibold"
                        >
                          {item.userEmail}
                        </a>
                      </div>
                    )}
                    {item.userPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-primary-900 flex-shrink-0" />
                        <a 
                          href={`tel:${item.userPhone}`}
                          className="text-primary-900 hover:text-primary-950 hover:underline font-semibold"
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
                <Card className="p-5 bg-gradient-to-br from-primary-50 via-primary-100 to-surface-100 border-2 border-primary-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
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
                        <Gift className="w-5 h-5 text-primary-900" />
                        <h4 className="text-lg font-extrabold text-ink-950 khoj-heading">Reward offered</h4>
                      </div>
                      <p className="text-sm text-ink-800">
                        The owner is offering{' '}
                        <span className="font-extrabold">
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
              <div className="bg-gradient-to-br from-found-50 to-success-50 rounded-2xl p-6 border-2 border-found-200">
                <h4 className="text-lg font-extrabold text-ink-950 mb-4 flex items-center gap-2 khoj-heading">
                  <span className="text-xl">✓</span>
                  {isOwner ? 'Your listing' : 'Is This Your Item?'}
                </h4>
                {isOwner ? (
                  <p className="text-sm text-ink-800">
                    You posted this found item. Manage claims from your profile and notifications.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-ink-800 mb-4">
                      If you believe this is your lost item, submit a claim and answer a few verification questions.
                    </p>
                    {isGuest ? (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => { onClose(); navigate('/login'); }}
                        className="shadow-lg"
                      >
                        Sign in to claim
                      </Button>
                    ) : (
                      <Button
                        variant="found"
                        fullWidth
                        onClick={() => setIsClaimModalOpen(true)}
                        className="shadow-lg"
                      >
                        🔐 Claim Test (3 quick questions)
                      </Button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary-50 to-surface-100 rounded-2xl p-6 border-2 border-primary-200 relative overflow-hidden">
                <h4 className="text-lg font-extrabold text-ink-950 mb-4 flex items-center gap-2 khoj-heading">
                  <span className="text-xl">💬</span>
                  Contact Owner
                </h4>
                <p className="text-sm text-ink-700 mb-4">
                  {isOwner
                    ? 'This is your lost-item post. Others can contact you using the methods you chose when posting.'
                    : 'Have information about this item? Reach out to the owner:'}
                </p>
                {isOwner ? (
                  <Card className="p-4 bg-surface-0/90 border border-primary-200">
                    <p className="text-sm text-ink-800 text-center">
                      You&apos;ll receive email or phone outreach based on your contact preference (
                      <span className="font-semibold">{item.contactPreference || 'both'}</span>
                      ).
                    </p>
                  </Card>
                ) : isGuest ? (
                  <div className="relative min-h-[120px]">
                    <div className="space-y-3 blur-md select-none pointer-events-none opacity-80" aria-hidden>
                      <div className="h-11 rounded-lg bg-primary-200/80" />
                      <div className="h-11 rounded-lg bg-primary-200/60" />
                    </div>
                    <button
                      type="button"
                      className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface-0/80 backdrop-blur-[2px] text-sm font-extrabold text-primary-950 px-4 py-3 hover:bg-surface-0/90 transition-colors border border-primary-200"
                      onClick={() => { onClose(); navigate('/login'); }}
                    >
                      Sign in to see contact details
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hasEmail && (
                      <a
                        href={`mailto:${email}?subject=${encodeURIComponent(`Regarding: ${item.title}`)}`}
                        className="flex items-center justify-center w-full rounded-xl bg-primary-500 text-ink-950 py-3 text-sm font-extrabold shadow-md hover:bg-primary-600 transition-colors"
                      >
                        Contact via Email
                      </a>
                    )}
                    {hasPhone && (
                      <a
                        href={`tel:${phone}`}
                        className="flex items-center justify-center w-full rounded-xl border-2 border-ink-300 bg-surface-0 py-3 text-sm font-extrabold text-ink-950 hover:bg-surface-100 transition-colors"
                      >
                        Contact via Phone
                      </a>
                    )}
                    {!hasEmail && !hasPhone && (
                      <p className="text-sm text-center text-ink-700 py-2">No contact details available</p>
                    )}
                  </div>
                )}
                <p className="text-xs text-ink-600 text-center mt-4">
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
