
// const jwt = require('jsonwebtoken');
// const { User } = require('../models');

// const connectedUsers = new Map();

// const initializeSocket = (io) => {

//   // ✅ AUTH TEMPORARILY COMMENT KARO - debug ke liye
//   // io.use(async (socket, next) => {
//   //   try {
//   //     const token = socket.handshake.auth.token;
//   //     if (!token) return next(new Error('No token'));
//   //     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medicare_secret_2024');
//   //     const user = await User.findByPk(decoded.id);
//   //     if (!user) return next(new Error('User not found'));
//   //     socket.user = user;
//   //     next();
//   //   } catch (err) {
//   //     console.log('❌ Socket auth failed:', err.message);
//   //     next(new Error('Authentication failed'));
//   //   }
//   // });

//   io.on('connection', (socket) => {
//     console.log('🔌 New client connected:', socket.id);

//     socket.on('join', (userId) => {
//       connectedUsers.set(userId, socket.id);
//       socket.userId = userId;
//       socket.join(userId);
//       console.log(`✅ User ${userId} joined`);
//     });

//     socket.on('send_message', async (data) => {
//       try {
//         const Message = require('../models/Message');
//         const message = await Message.create({
//           senderId: data.senderId,
//           receiverId: data.receiverId,
//           content: data.content,
//           messageType: data.messageType || 'text'
//         });
//         io.to(data.receiverId).emit('message:new', message);
//         console.log(`📨 Message sent to: ${data.receiverId}`);
//         socket.emit('message:sent', message);
//       } catch (err) {
//         socket.emit('message:error', { error: err.message });
//       }
//     });

//     socket.on('typing_start', (data) => {
//       socket.to(data.receiverId).emit('user_typing', { userId: data.senderId });
//     });

//     socket.on('typing_stop', (data) => {
//       socket.to(data.receiverId).emit('user_stopped_typing', { userId: data.senderId });
//     });

//     socket.on('disconnect', () => {
//       if (socket.userId) {
//         connectedUsers.delete(socket.userId);
//         console.log(`❌ Disconnected: ${socket.userId}`);
//       }
//     });
//   });
// };

// const sendNotification = (io, userId, notification) => {
//   const socketId = connectedUsers.get(userId);
//   if (socketId) {
//     io.to(socketId).emit('notification', notification);
//     return true;
//   }
//   return false;
// };

// const sendBulkNotifications = (io, userIds, notification) => {
//   userIds.forEach(userId => sendNotification(io, userId, notification));
// };

// const getUnreadCount = async (userId) => { return 0; };

// module.exports = {
//   initializeSocket,
//   sendNotification,
//   sendBulkNotifications,
//   connectedUsers
// };

const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join', (userId) => {
      if (!userId) return;

      socket.userId = userId;
      socket.join(userId);

      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }

      connectedUsers.get(userId).add(socket.id);

      console.log(`✅ User ${userId} joined with socket ${socket.id}`);
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

        console.log(`📨 Message sent to: ${data.receiverId}`);
      } catch (err) {
        console.log('❌ Message error:', err.message);
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

        console.log(`❌ Disconnected socket ${socket.id} for user ${userId}`);
      }
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

const getUnreadCount = async (userId) => {
  return 0;
};

module.exports = {
  initializeSocket,
  sendNotification,
  sendBulkNotifications,
  connectedUsers,
  getUnreadCount
};