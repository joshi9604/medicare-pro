const { User } = require('../models');

// Store connected users
const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // User joins with their userId
    socket.on('join', async (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`✅ User ${userId} joined with socket ${socket.id}`);
      
      // Send unread notification count
      const unreadCount = await getUnreadCount(userId);
      socket.emit('unread_count', unreadCount);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`❌ User ${socket.userId} disconnected`);
      }
    });
  });
};

// Send notification to specific user
const sendNotification = (io, userId, notification) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    console.log(`📨 Notification sent to user ${userId}`);
    return true;
  }
  return false;
};

// Send notification to multiple users
const sendBulkNotifications = (io, userIds, notification) => {
  userIds.forEach(userId => {
    sendNotification(io, userId, notification);
  });
};

// Get unread notification count (placeholder - implement with actual model)
const getUnreadCount = async (userId) => {
  // TODO: Implement with Notification model
  return 0;
};

module.exports = {
  initializeSocket,
  sendNotification,
  sendBulkNotifications,
  connectedUsers
};
