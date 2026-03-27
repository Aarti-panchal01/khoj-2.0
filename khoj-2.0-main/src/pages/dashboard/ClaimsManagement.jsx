import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, MapPin, Calendar, FileText, User, Mail, Phone, Package, Inbox } from 'lucide-react';
import { ClaimsAPI } from '../../lib/apiClient';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingClaimId, setProcessingClaimId] = useState(null);
  const [error, setError] = useState('');
  const [expandedClaimId, setExpandedClaimId] = useState(null);
  const [approvedClaims, setApprovedClaims] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      // Get all user's items and their claims
      const allClaims = await ClaimsAPI.getMine();
      // Filter to show only pending claims where user is the owner
      const pendingClaims = allClaims.filter(claim => claim.status === 'pending');
      setClaims(pendingClaims);
    } catch (err) {
      console.error('Failed to fetch claims', err);
      setError(err.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId) => {
    if (!confirm('Are you sure you want to approve this claim? The item will be marked as resolved and the claimer will receive +10 reputation points.')) {
      return;
    }

    setProcessingClaimId(claimId);
    try {
      await ClaimsAPI.approve(claimId);
      // Mark as approved locally
      setApprovedClaims(prev => new Set([...prev, claimId]));
      // Remove from pending list after a delay to show contact info
      setTimeout(() => {
        setClaims(prev => prev.filter(c => c._id !== claimId));
      }, 5000);
    } catch (err) {
      console.error('Failed to approve claim', err);
      alert(err.message || 'Failed to approve claim');
    } finally {
      setProcessingClaimId(null);
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!confirm('Are you sure you want to reject this claim?')) {
      return;
    }

    setProcessingClaimId(claimId);
    try {
      await ClaimsAPI.reject(claimId);
      // Remove from list
      setClaims(prev => prev.filter(c => c._id !== claimId));
    } catch (err) {
      console.error('Failed to reject claim', err);
      alert(err.message || 'Failed to reject claim');
    } finally {
      setProcessingClaimId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            📋 Claims Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Review and process claims for your found items
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-4 border border-danger-200 bg-danger-50 text-danger-700 mb-4">
            <p>{error}</p>
            <Button onClick={fetchClaims} className="mt-2" size="sm">
              Retry
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading claims...</p>
          </Card>
        ) : claims.length === 0 ? (
          /* Empty State */
          <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-gray-50 to-white">
            <Inbox className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No pending claims
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              When someone claims your found items, you'll see them here for review
            </p>
            <Button onClick={() => navigate('/')} variant="primary">
              Browse Items
            </Button>
          </Card>
        ) : (
          /* Claims List */
          <div className="space-y-4 sm:space-y-6">
            {claims.map((claim, index) => {
              const isExpanded = expandedClaimId === claim._id;
              const isApproved = approvedClaims.has(claim._id);

              return (
                <motion.div
                  key={claim._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className={`overflow-hidden border-2 ${
                    isApproved 
                      ? 'border-success-300 bg-gradient-to-br from-success-50 to-green-50' 
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-lg'
                  } transition-all`}>
                    {/* Item Header */}
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200">
                      <div className="flex items-start gap-4">
                        {/* Item Image */}
                        {claim.itemId?.images && claim.itemId.images.length > 0 ? (
                          <img
                            src={claim.itemId.images[0]}
                            alt={claim.itemId.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">
                            {claim.itemId?.title || 'Unknown Item'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {claim.itemId?.type && (
                              <Badge variant={claim.itemId.type === 'found' ? 'found' : 'lost'}>
                                {claim.itemId.type}
                              </Badge>
                            )}
                            {claim.itemId?.category && (
                              <Badge variant="default">{claim.itemId.category}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Claimer Info */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Claimed by</p>
                          <p className="font-semibold text-gray-900">
                            {claim.claimerId?.name || 'Unknown User'}
                          </p>
                        </div>
                      </div>

                      {/* Verification Answers */}
                      <div className="space-y-3 mb-4">
                        <button
                          onClick={() => setExpandedClaimId(isExpanded ? null : claim._id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="text-sm font-medium text-gray-700">
                              {isExpanded ? '▼' : '▶'} Verification Details
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            {/* Where */}
                            <Card className="p-4 bg-white border border-gray-200">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Where did you lose it?
                                  </p>
                                  <p className="text-sm text-gray-900">{claim.whereList || 'Not provided'}</p>
                                </div>
                              </div>
                            </Card>

                            {/* When */}
                            <Card className="p-4 bg-white border border-gray-200">
                              <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    When did you lose it?
                                  </p>
                                  <p className="text-sm text-gray-900">{claim.whenList || 'Not provided'}</p>
                                </div>
                              </div>
                            </Card>

                            {/* Specific Details */}
                            <Card className="p-4 bg-white border border-gray-200">
                              <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Specific Details
                                  </p>
                                  <p className="text-sm text-gray-900">{claim.specificDetails || 'Not provided'}</p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        )}
                      </div>

                      {/* Contact Info (shown after approval) */}
                      {isApproved && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 p-4 bg-success-100 border-2 border-success-300 rounded-lg"
                        >
                          <p className="text-sm font-semibold text-success-900 mb-3">
                            ✓ Claim Approved! Contact Information:
                          </p>
                          <div className="space-y-2">
                            {claim.claimerId?.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Mail className="w-4 h-4 text-success-600" />
                                <a href={`mailto:${claim.claimerId.email}`} className="hover:underline">
                                  {claim.claimerId.email}
                                </a>
                              </div>
                            )}
                            {claim.claimerId?.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Phone className="w-4 h-4 text-success-600" />
                                <a href={`tel:${claim.claimerId.phone}`} className="hover:underline">
                                  {claim.claimerId.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Action Buttons */}
                      {!isApproved && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => handleApproveClaim(claim._id)}
                            loading={processingClaimId === claim._id}
                            disabled={processingClaimId !== null}
                            variant="primary"
                            icon={CheckCircle}
                            fullWidth
                            className="bg-gradient-to-r from-success-500 to-green-600 hover:from-success-600 hover:to-green-700 shadow-lg"
                          >
                            Approve Claim
                          </Button>
                          <Button
                            onClick={() => handleRejectClaim(claim._id)}
                            loading={processingClaimId === claim._id}
                            disabled={processingClaimId !== null}
                            variant="outline"
                            icon={XCircle}
                            fullWidth
                            className="border-2 border-danger-300 text-danger-600 hover:bg-danger-50"
                          >
                            Reject Claim
                          </Button>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        Claimed on {format(new Date(claim.createdAt), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ClaimsManagement;
