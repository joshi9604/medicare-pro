const connectedUsers = new Map();
const logger = require('./logger');

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    logger.debug('Socket connected', { socketId: socket.id });

    socket.on('join', (userId) => {
      if (!userId) return;

      socket.userId = userId;
      socket.join(userId);

      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }

      connectedUsers.get(userId).add(socket.id);

      logger.debug('Socket joined user room', {
        userId,
        socketId: socket.id,
        activeSockets: connectedUsers.get(userId).size
      });
    });

    socket.on('send_message', async (data) => {
      try {
        const Message = require('../models/Message');

        const message = await Message.create({
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          messageType: data.messageType || 'text'
        });

        io.to(data.receiverId).emit('message:new', message);
        socket.emit('message:sent', message);

        logger.info('Chat message delivered', { receiverId: data.receiverId });
      } catch (err) {
        logger.error('Chat message delivery failed', err.message);
        socket.emit('message:error', { error: err.message });
      }
    });

    socket.on('typing_start', (data) => {
      socket.to(data.receiverId).emit('user_typing', {
        userId: data.senderId
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.receiverId).emit('user_stopped_typing', {
        userId: data.senderId
      });
    });

    socket.on('disconnect', () => {
      const userId = socket.userId;

      if (userId && connectedUsers.has(userId)) {
        connectedUsers.get(userId).delete(socket.id);

        if (connectedUsers.get(userId).size === 0) {
          connectedUsers.delete(userId);
        }
      }

      logger.debug('Socket disconnected', {
        userId: userId || 'unknown',
        socketId: socket.id
      });
    });
  });
};

const sendNotification = (io, userId, notification) => {
  if (!userId) return false;

  io.to(userId).emit('notification', notification);
  return true;
};

const sendBulkNotifications = (io, userIds, notification) => {
  userIds.forEach((userId) => {
    sendNotification(io, userId, notification);
  });
};

const getUnreadCount = async () => 0;

module.exports = {
  initializeSocket,
  sendNotification,
  sendBulkNotifications,
  connectedUsers,
  getUnreadCount
};
