import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CalendarDays, FileText, Pill, Speaker, Wallet, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../socket';
import './NotificationBell.css';

const ICON_MAP = {
  appointment: CalendarDays,
  prescription: Pill,
  payment: Wallet,
  reminder: Bell,
  system: Speaker
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    const socket = getSocket(token);

    const onNotification = (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const onUnreadCount = (count) => {
      setUnreadCount(count);
    };

    socket.on('notification', onNotification);
    socket.on('unread_count', onUnreadCount);

    return () => {
      socket.off('notification', onNotification);
      socket.off('unread_count', onUnreadCount);
    };
  }, [user, token]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error(err);
      }
    }
  };

  const toggleDropdown = async () => {
    const opening = !isOpen;
    setIsOpen(opening);

    if (opening && unreadCount > 0) {
      await markAllAsRead();
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notification) => notification.id === id ? { ...notification, isRead: true } : notification)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notification-container">
      <button className="bell-btn" onClick={toggleDropdown} type="button" aria-label="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown">
          <div className="header">
            <h3><Bell size={16} /> Notifications</h3>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-read" type="button">
                  Mark all read
                </button>
              )}
              <button className="close-dropdown" onClick={() => setIsOpen(false)} type="button" aria-label="Close notifications">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="list">
            {notifications.length === 0 ? (
              <div className="empty">
                <div className="icon"><FileText size={36} /></div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = ICON_MAP[notification.type] || FileText;
                return (
                  <div
                    key={notification.id}
                    className={`item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if ((event.key === 'Enter' || event.key === ' ') && !notification.isRead) {
                        event.preventDefault();
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <span className="icon"><Icon size={18} /></span>
                    <div className="content">
                      <div className="title">{notification.title}</div>
                      <div className="message">{notification.message}</div>
                      <div className="time">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!notification.isRead && <span className="dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
