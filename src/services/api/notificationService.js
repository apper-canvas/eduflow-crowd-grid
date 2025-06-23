import mockData from '@/services/mockData/notifications.json';

class NotificationService {
  constructor() {
    this.notifications = [...mockData];
    this.lastId = Math.max(...this.notifications.map(n => n.Id), 0);
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getById(id) {
    await this.delay();
    const numId = parseInt(id);
    if (isNaN(numId)) return null;
    
    const notification = this.notifications.find(n => n.Id === numId);
    return notification ? { ...notification } : null;
  }

  async getUnreadCount() {
    await this.delay(100);
    return this.notifications.filter(n => !n.isRead).length;
  }

  async getByType(type) {
    await this.delay();
    return this.notifications
      .filter(n => n.type === type)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getUnread() {
    await this.delay();
    return this.notifications
      .filter(n => !n.isRead)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async markAsRead(id) {
    await this.delay(200);
    const numId = parseInt(id);
    if (isNaN(numId)) throw new Error('Invalid notification ID');

    const notification = this.notifications.find(n => n.Id === numId);
    if (!notification) throw new Error('Notification not found');

    notification.isRead = true;
    return { ...notification };
  }

  async markAsUnread(id) {
    await this.delay(200);
    const numId = parseInt(id);
    if (isNaN(numId)) throw new Error('Invalid notification ID');

    const notification = this.notifications.find(n => n.Id === numId);
    if (!notification) throw new Error('Notification not found');

    notification.isRead = false;
    return { ...notification };
  }

  async markAllAsRead() {
    await this.delay(300);
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    return [...this.notifications];
  }

  async create(notificationData) {
    await this.delay(250);
    const newNotification = {
      Id: ++this.lastId,
      type: notificationData.type || 'system',
      title: notificationData.title,
      message: notificationData.message,
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedId: notificationData.relatedId || null,
      relatedType: notificationData.relatedType || null
    };

    this.notifications.unshift(newNotification);
    return { ...newNotification };
  }

  async delete(id) {
    await this.delay(200);
    const numId = parseInt(id);
    if (isNaN(numId)) throw new Error('Invalid notification ID');

    const index = this.notifications.findIndex(n => n.Id === numId);
    if (index === -1) throw new Error('Notification not found');

    const deleted = this.notifications.splice(index, 1)[0];
    return { ...deleted };
  }

  async searchNotifications(query) {
    await this.delay(200);
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return this.notifications
      .filter(n => 
        n.title.toLowerCase().includes(searchTerm) ||
        n.message.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

const notificationService = new NotificationService();
export default notificationService;