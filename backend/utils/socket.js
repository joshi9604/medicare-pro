// const { User } = require('../models');

// // Store connected users
// const connectedUsers = new Map();

// const initializeSocket = (io) => {
//   io.on('connection', (socket) => {
//     console.log('🔌 New client connected:', socket.id);

//     // User joins with their userId
//     socket.on('join', async (userId) => {
//       connectedUsers.set(userId, socket.id);
//       socket.userId = userId;
//       console.log(`✅ User ${userId} joined with socket ${socket.id}`);
      
//       // Join user's room for messages
//       socket.join(userId);
      
//       // Send unread notification count
//       const unreadCount = await getUnreadCount(userId);
//       socket.emit('unread_count', unreadCount);
//     });

//     // Handle sending messages
//     socket.on('send_message', async (data) => {
//       try {
//         const Message = require('../models/Message');
//         const message = await Message.create({
//           senderId: data.senderId,
//           receiverId: data.receiverId,
//           content: data.content,
//           messageType: data.messageType || 'text'
//         });
        
//         // Emit to receiver
//         io.to(data.receiverId).emit('message:new', message);
        
//         // Emit confirmation to sender
//         socket.emit('message:sent', message);
//       } catch (err) {
//         socket.emit('message:error', { error: err.message });
//       }
//     });

//     // Handle typing indicators
//     socket.on('typing_start', (data) => {
//       socket.to(data.receiverId).emit('user_typing', { userId: data.senderId });
//     });

//     socket.on('typing_stop', (data) => {
//       socket.to(data.receiverId).emit('user_stopped_typing', { userId: data.senderId });
//     });

//     // Handle disconnection
//     socket.on('disconnect', () => {
//       if (socket.userId) {
//         connectedUsers.delete(socket.userId);
//         console.log(`❌ User ${socket.userId} disconnected`);
//       }
//     });
//   });
// };

// // Send notification to specific user
// const sendNotification = (io, userId, notification) => {
//   const socketId = connectedUsers.get(userId);
//   if (socketId) {
//     io.to(socketId).emit('notification', notification);
//     console.log(`📨 Notification sent to user ${userId}`);
//     return true;
//   }
//   return false;
// };

// // Send notification to multiple users
// const sendBulkNotifications = (io, userIds, notification) => {
//   userIds.forEach(userId => {
//     sendNotification(io, userId, notification);
//   });
// };

// // Get unread notification count (placeholder - implement with actual model)
// const getUnreadCount = async (userId) => {
//   // TODO: Implement with Notification model
//   return 0;
// };

// module.exports = {
//   initializeSocket,
//   sendNotification,
//   sendBulkNotifications,
//   connectedUsers
// };

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const connectedUsers = new Map();

const initializeSocket = (io) => {

  // ✅ AUTH TEMPORARILY COMMENT KARO - debug ke liye
  // io.use(async (socket, next) => {
  //   try {
  //     const token = socket.handshake.auth.token;
  //     if (!token) return next(new Error('No token'));
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medicare_secret_2024');
  //     const user = await User.findByPk(decoded.id);
  //     if (!user) return next(new Error('User not found'));
  //     socket.user = user;
  //     next();
  //   } catch (err) {
  //     console.log('❌ Socket auth failed:', err.message);
  //     next(new Error('Authentication failed'));
  //   }
  // });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId);
      console.log(`✅ User ${userId} joined`);
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
        console.log(`📨 Message sent to: ${data.receiverId}`);
        socket.emit('message:sent', message);
      } catch (err) {
        socket.emit('message:error', { error: err.message });
      }
    });

    socket.on('typing_start', (data) => {
      socket.to(data.receiverId).emit('user_typing', { userId: data.senderId });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.receiverId).emit('user_stopped_typing', { userId: data.senderId });
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`❌ Disconnected: ${socket.userId}`);
      }
    });
  });
};

const sendNotification = (io, userId, notification) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    return true;
  }
  return false;
};

const sendBulkNotifications = (io, userIds, notification) => {
  userIds.forEach(userId => sendNotification(io, userId, notification));
};

const getUnreadCount = async (userId) => { return 0; };

module.exports = {
  initializeSocket,
  sendNotification,
  sendBulkNotifications,
  connectedUsers
};