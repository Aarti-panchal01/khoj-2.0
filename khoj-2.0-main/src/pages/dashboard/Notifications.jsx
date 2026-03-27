import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, Package, AlertCircle, Inbox } from 'lucide-react';
import { NotificationsAPI } from '../../lib/apiClient';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await NotificationsAPI.list();
      setNotifications(data);
      
      // Auto-mark unread notifications as read
      const unreadIds = data.filter(n => !n.read).map(n => n._id);
      if (unreadIds.length > 0) {
        // Mark as read in background (don't wait)
        unreadIds.forEach(id => {
          NotificationsAPI.markAsRead(id).catch(err => 
            console.error('Failed to mark as read', err)
          );
        });
        // Update local state immediately
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await NotificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
      setError('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'claim_request':
        return <AlertCircle className="w-5 h-5 text-warning-600" />;
      case 'claim_approved':
        return <CheckCheck className="w-5 h-5 text-success-600" />;
      case 'claim_rejected':
        return <AlertCircle className="w-5 h-5 text-danger-600" />;
      case 'item_resolved':
        return <Package className="w-5 h-5 text-primary-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'claim_request':
        return 'from-warning-50 to-yellow-50 border-warning-200';
      case 'claim_approved':
        return 'from-success-50 to-green-50 border-success-200';
      case 'claim_rejected':
        return 'from-danger-50 to-red-50 border-danger-200';
      case 'item_resolved':
        return 'from-primary-50 to-blue-50 border-primary-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              🔔 Notifications
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Stay updated on your claims and items
            </p>
          </div>
          {notifications.length > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              loading={markingAllRead}
              variant="outline"
              icon={CheckCheck}
              className="w-full sm:w-auto"
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-4 border border-danger-200 bg-danger-50 text-danger-700 mb-4">
            <p>{error}</p>
            <Button onClick={fetchNotifications} className="mt-2" size="sm">
              Retry
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading notifications...</p>
          </Card>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-gray-50 to-white">
            <Inbox className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              You'll see notifications here when someone claims your items or responds to your claims
            </p>
            <Button onClick={() => navigate('/')} variant="primary">
              Browse Items
            </Button>
          </Card>
        ) : (
          /* Notifications List */
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  className={`p-4 sm:p-5 bg-gradient-to-br ${getNotificationColor(notification.type)} border-2 hover:shadow-lg transition-all cursor-pointer ${
                    !notification.read ? 'ring-2 ring-primary-200' : ''
                  }`}
                  onClick={() => {
                    if (notification.type === 'claim_request') {
                      navigate('/claims');
                    }
                  }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {notification.message}
                          </p>
                          {notification.itemId && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Item: {notification.itemId.title || 'Unknown'}
                              {notification.itemId.type && (
                                <Badge variant={notification.itemId.type === 'found' ? 'found' : 'lost'} className="ml-2">
                                  {notification.itemId.type}
                                </Badge>
                              )}
                            </p>
                          )}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(notification.createdAt), 'MMM dd, yyyy • h:mm a')}</span>
                      </div>

                      {/* Action Link for claim_request */}
                      {notification.type === 'claim_request' && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/claims');
                            }}
                          >
                            View Claims
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Notifications;
