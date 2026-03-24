// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';

// export default function NotificationBell() {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const { user } = useAuth();

//   useEffect(() => {
//     // Only fetch if user is logged in
//     if (!user) return;
    
//     fetchNotifications();
    
//     // Socket.io connection for real-time notifications
//     const socket = window.socket;
//     if (socket) {
//       socket.on('notification', (data) => {
//         setNotifications(prev => [data, ...prev]);
//         setUnreadCount(prev => prev + 1);
//       });
      
//       socket.on('unread_count', (count) => {
//         setUnreadCount(count);
//       });
//     }
    
//     return () => {
//       if (socket) {
//         socket.off('notification');
//         socket.off('unread_count');
//       }
//     };
//   }, [user]);

//   const fetchNotifications = async () => {
//     try {
//       // Token is already set in axios defaults by AuthContext
//       const res = await axios.get('/api/notifications');
//       setNotifications(res.data.notifications);
//       setUnreadCount(res.data.unreadCount);
//     } catch (err) {
//       // Silently fail for 401 errors (user not logged in)
//       if (err.response?.status !== 401) {
//         console.error('Failed to fetch notifications:', err);
//       }
//     }
//   };

//   const markAsRead = async (id) => {
//     try {
//       await axios.put(`/api/notifications/${id}/read`);
//       setNotifications(prev => 
//         prev.map(n => n.id === id ? { ...n, isRead: true } : n)
//       );
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (err) {
//       console.error('Failed to mark as read:', err);
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       await axios.put('/api/notifications/read-all');
//       setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//       setUnreadCount(0);
//     } catch (err) {
//       console.error('Failed to mark all as read:', err);
//     }
//   };

//   const getIcon = (type) => {
//     const icons = {
//       appointment: '📅',
//       prescription: '💊',
//       payment: '💳',
//       reminder: '⏰',
//       system: '📢'
//     };
//     return icons[type] || '📌';
//   };

//   return (
//     <div style={{ position: 'relative' }}>
//       <button 
//         onClick={() => setIsOpen(!isOpen)}
//         style={{
//           background: 'none',
//           border: 'none',
//           fontSize: '24px',
//           cursor: 'pointer',
//           position: 'relative',
//           padding: '8px'
//         }}
//       >
//         🔔
//         {unreadCount > 0 && (
//           <span style={{
//             position: 'absolute',
//             top: '0',
//             right: '0',
//             background: '#ef4444',
//             color: 'white',
//             borderRadius: '50%',
//             width: '20px',
//             height: '20px',
//             fontSize: '12px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontWeight: 'bold'
//           }}>
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <div style={{
//           position: 'absolute',
//           right: '0',
//           top: '100%',
//           width: '360px',
//           maxHeight: '480px',
//           background: 'var(--bg-secondary)',
//           borderRadius: '16px',
//           boxShadow: 'var(--shadow-xl)',
//           border: '1px solid var(--border-color)',
//           zIndex: 1000,
//           overflow: 'hidden'
//         }}>
//           <div style={{
//             padding: '16px 20px',
//             borderBottom: '1px solid var(--border-color)',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center'
//           }}>
//             <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
//               Notifications
//             </h3>
//             {unreadCount > 0 && (
//               <button 
//                 onClick={markAllAsRead}
//                 style={{
//                   background: 'none',
//                   border: 'none',
//                   color: 'var(--accent-color)',
//                   cursor: 'pointer',
//                   fontSize: '13px',
//                   fontWeight: '600'
//                 }}
//               >
//                 Mark all read
//               </button>
//             )}
//           </div>

//           <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//             {notifications.length === 0 ? (
//               <div style={{
//                 padding: '40px',
//                 textAlign: 'center',
//                 color: 'var(--text-secondary)'
//               }}>
//                 <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
//                 <p>No notifications yet</p>
//               </div>
//             ) : (
//               notifications.map(notification => (
//                 <div 
//                   key={notification.id}
//                   onClick={() => !notification.isRead && markAsRead(notification.id)}
//                   style={{
//                     padding: '16px 20px',
//                     borderBottom: '1px solid var(--border-light)',
//                     background: notification.isRead ? 'transparent' : 'var(--accent-light)',
//                     cursor: notification.isRead ? 'default' : 'pointer',
//                     display: 'flex',
//                     gap: '12px',
//                     alignItems: 'flex-start'
//                   }}
//                 >
//                   <span style={{ fontSize: '24px' }}>
//                     {getIcon(notification.type)}
//                   </span>
//                   <div style={{ flex: 1 }}>
//                     <div style={{
//                       fontWeight: notification.isRead ? '500' : '700',
//                       fontSize: '14px',
//                       color: 'var(--text-primary)',
//                       marginBottom: '4px'
//                     }}>
//                       {notification.title}
//                     </div>
//                     <div style={{
//                       fontSize: '13px',
//                       color: 'var(--text-secondary)',
//                       marginBottom: '6px'
//                     }}>
//                       {notification.message}
//                     </div>
//                     <div style={{
//                       fontSize: '11px',
//                       color: 'var(--text-muted)'
//                     }}>
//                       {new Date(notification.createdAt).toLocaleString()}
//                     </div>
//                   </div>
//                   {!notification.isRead && (
//                     <span style={{
//                       width: '8px',
//                       height: '8px',
//                       background: 'var(--accent-color)',
//                       borderRadius: '50%',
//                       flexShrink: 0
//                     }} />
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './NotificationBell.css';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const socket = window.socket;
    if (socket) {
      socket.on('notification', (data) => {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      socket.on('unread_count', (count) => {
        setUnreadCount(count);
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
        socket.off('unread_count');
      }
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error(err);
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    const icons = {
      appointment: '📅',
      prescription: '💊',
      payment: '💳',
      reminder: '⏰',
      system: '📢'
    };
    return icons[type] || '📌';
  };

  return (
    <div className="notification-container">
      <button className="bell-btn" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown">
          <div className="header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-read">
                Mark all read
              </button>
            )}
          </div>

          <div className="list">
            {notifications.length === 0 ? (
              <div className="empty">
                <div className="icon">📭</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`item ${!n.isRead ? 'unread' : ''}`}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                >
                  <span className="icon">{getIcon(n.type)}</span>

                  <div className="content">
                    <div className="title">{n.title}</div>
                    <div className="message">{n.message}</div>
                    <div className="time">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {!n.isRead && <span className="dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}