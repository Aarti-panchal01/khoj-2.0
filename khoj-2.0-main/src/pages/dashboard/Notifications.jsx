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
        return <AlertCircle className="w-5 h-5 text-primary-900" />;
      case 'claim_approved':
        return <CheckCheck className="w-5 h-5 text-found-700" />;
      case 'claim_rejected':
        return <AlertCircle className="w-5 h-5 text-lost-700" />;
      case 'item_resolved':
        return <Package className="w-5 h-5 text-ink-700" />;
      default:
        return <Bell className="w-5 h-5 text-ink-700" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'claim_request':
        return 'from-primary-50 to-surface-100 border-primary-200';
      case 'claim_approved':
        return 'from-found-50 to-surface-100 border-found-200';
      case 'claim_rejected':
        return 'from-lost-50 to-surface-100 border-lost-200';
      case 'item_resolved':
        return 'from-surface-100 to-surface-0 border-ink-200';
      default:
        return 'from-surface-100 to-surface-0 border-ink-200';
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl khoj-heading font-extrabold leading-[0.95] text-ink-950">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-ink-700 mt-1.5">
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
          <Card className="p-4 border border-lost-200 bg-lost-50 text-lost-800 mb-4">
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
            <p className="text-sm text-ink-700">Loading notifications...</p>
          </Card>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <Card className="p-8 sm:p-12 text-center bg-surface-0 border border-ink-200">
            <Inbox className="w-16 h-16 sm:w-20 sm:h-20 text-ink-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-extrabold text-ink-950 mb-2 khoj-heading">
              No notifications yet
            </h3>
            <p className="text-sm sm:text-base text-ink-700 mb-4">
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
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-surface-0 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-ink-200">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-semibold text-ink-950">
                            {notification.message}
                          </p>
                          {notification.itemId && (
                            <p className="text-xs sm:text-sm text-ink-700 mt-1">
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
                          <div
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ring-2 ring-surface-0 ${
                              notification.itemId?.type === 'lost'
                                ? 'bg-lost-600'
                                : notification.itemId?.type === 'found'
                                  ? 'bg-found-600'
                                  : 'bg-primary-600'
                            }`}
                            aria-hidden
                          />
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 text-xs text-ink-600">
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
