import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';
import notificationService from '@/services/api/notificationService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import SearchBar from '@/components/molecules/SearchBar';
import PageHeader from '@/components/organisms/PageHeader';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchQuery, filterType, filterStatus]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Status filter
    if (filterStatus === 'read') {
      filtered = filtered.filter(n => n.isRead);
    } else if (filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.Id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await notificationService.markAsUnread(id);
      setNotifications(prev => 
        prev.map(n => n.Id === id ? { ...n, isRead: false } : n)
      );
      setUnreadCount(prev => prev + 1);
      toast.success('Notification marked as unread');
    } catch (err) {
      toast.error('Failed to mark notification as unread');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.Id !== id));
      const deletedNotification = notifications.find(n => n.Id === id);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted successfully');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'student': return 'Users';
      case 'payment': return 'CreditCard';
      case 'batch': return 'BookOpen';
      case 'teacher': return 'GraduationCap';
      case 'system': return 'Settings';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'student': return 'text-blue-600 bg-blue-50';
      case 'payment': return 'text-green-600 bg-green-50';
      case 'batch': return 'text-purple-600 bg-purple-50';
      case 'teacher': return 'text-orange-600 bg-orange-50';
      case 'system': return 'text-gray-600 bg-gray-50';
      default: return 'text-primary bg-primary/10';
    }
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'student', label: 'Student' },
    { value: 'payment', label: 'Payment' },
    { value: 'batch', label: 'Batch' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'system', label: 'System' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Notifications"
          subtitle="Stay updated with latest activities"
          icon="Bell"
        />
        <div className="mt-8 space-y-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader
          title="Notifications"
          subtitle="Stay updated with latest activities"
          icon="Bell"
        />
        <div className="mt-8">
          <ErrorState
            title="Failed to load notifications"
            message={error}
            onRetry={loadNotifications}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
        icon="Bell"
        actions={
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="flex items-center gap-2"
              >
                <ApperIcon name="CheckCheck" size={16} />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar
          placeholder="Search notifications..."
          onSearch={setSearchQuery}
          className="w-full sm:w-80"
        />
        <div className="flex gap-3 w-full sm:w-auto">
          <Select
            value={filterType}
            onChange={setFilterType}
            options={typeOptions}
            className="min-w-32"
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            className="min-w-32"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="mt-6">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon="Bell"
            title="No notifications found"
            message={searchQuery ? `No notifications match "${searchQuery}"` : "You're all caught up!"}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  notification.isRead 
                    ? 'bg-white border-gray-200' 
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                    <ApperIcon name={getNotificationIcon(notification.type)} size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className={`font-medium ${notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(notification.timestamp), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => notification.isRead ? handleMarkAsUnread(notification.Id) : handleMarkAsRead(notification.Id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                            title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            <ApperIcon name={notification.isRead ? 'Mail' : 'MailOpen'} size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(notification.Id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete notification"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;