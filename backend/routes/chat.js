// const express = require('express');
// const router = express.Router();
// const { Op } = require('sequelize');
// const Message = require('../models/Message');
// const User = require('../models/User');
// const { protect } = require('../middleware/auth');

// // Get all conversations for a user
// router.get('/conversations', [protect], async (req, res) => {
//   try {
//     const conversations = await Message.findAll({
//       where: {
//         [Op.or]: [
//           { senderId: req.user.id },
//           { receiverId: req.user.id }
//         ],
//         isDeleted: false
//       },
//       include: [
//         { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
//         { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
//       ],
//      // order: [['created_at', 'DESC']]
//      order: [['created_at', 'DESC']]
//     });

//     // Group by conversation partner
//     const conversationMap = new Map();
    
//     conversations.forEach(msg => {
//       const partnerId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
//       const partner = msg.senderId === req.user.id ? msg.receiver : msg.sender;
      
//       if (!conversationMap.has(partnerId)) {
//         conversationMap.set(partnerId, {
//           participant: partner,
//           lastMessage: msg,
//           unreadCount: 0
//         });
//       }
//     });

//     // Count unread messages for each conversation
//     for (const [partnerId, data] of conversationMap) {
//       const unreadCount = await Message.count({
//         where: {
//           senderId: partnerId,
//           receiverId: req.user.id,
//           isRead: false,
//           isDeleted: false
//         }
//       });
//       data.unreadCount = unreadCount;
//     }

//     const result = Array.from(conversationMap.values());
//     res.json({ success: true, conversations: result });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Get messages between two users
// router.get('/messages/:userId', [protect], async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     const messages = await Message.findAll({
//       where: {
//         [Op.or]: [
//           { senderId: req.user.id, receiverId: userId },
//           { senderId: userId, receiverId: req.user.id }
//         ],
//         isDeleted: false
//       },
//       include: [
//         { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
//         { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
//       ],
//       order: [['created_at', 'ASC']]
//     });

//     // Mark messages as read
//     await Message.update(
//       { isRead: true, readAt: new Date() },
//       {
//         where: {
//           senderId: userId,
//           receiverId: req.user.id,
//           isRead: false
//         }
//       }
//     );

//     res.json({ success: true, messages });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Send a message
// router.post('/send', [protect], async (req, res) => {
//   try {
//     const { receiverId, content, messageType = 'text', attachmentUrl } = req.body;

//     if (!content || !receiverId) {
//       return res.status(400).json({ success: false, message: 'Content and receiver required' });
//     }

//     const message = await Message.create({
//       senderId: req.user.id,
//       receiverId,
//       content,
//       messageType,
//       attachmentUrl
//     });

//     const populatedMessage = await Message.findByPk(message.id, {
//       include: [
//         { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
//         { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
//       ]
//     });

//     // Emit socket event (will be handled in socket.js)
//     if (global.io) {
//       global.io.to(receiverId).emit('message:new', populatedMessage);
//     }

//     res.json({ success: true, message: populatedMessage });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Mark messages as read
// router.put('/read/:senderId', [protect], async (req, res) => {
//   try {
//     const { senderId } = req.params;

//     await Message.update(
//       { isRead: true, readAt: new Date() },
//       {
//         where: {
//           senderId,
//           receiverId: req.user.id,
//           isRead: false
//         }
//       }
//     );

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Delete a message
// router.delete('/:id', [protect], async (req, res) => {
//   try {
//     const message = await Message.findByPk(req.params.id);

//     if (!message) {
//       return res.status(404).json({ success: false, message: 'Message not found' });
//     }

//     if (message.senderId !== req.user.id) {
//       return res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
//     }

//     await message.update({ isDeleted: true });

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get all conversations for a user
router.get('/conversations', [protect], async (req, res) => {
  try {
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ],
        isDeleted: false
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    // Group by conversation partner
    const conversationMap = new Map();

    conversations.forEach(msg => {
      const partnerId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === req.user.id ? msg.receiver : msg.sender;

      // ✅ null partner skip karo
      if (!partner) return;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          participant: partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }
    });

    // Count unread messages for each conversation
    for (const [partnerId, data] of conversationMap) {
      const unreadCount = await Message.count({
        where: {
          senderId: partnerId,
          receiverId: req.user.id,
          isRead: false,
          isDeleted: false
        }
      });
      data.unreadCount = unreadCount;
    }

    const result = Array.from(conversationMap.values());
    res.json({ success: true, conversations: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get messages between two users
router.get('/messages/:userId', [protect], async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id }
        ],
        isDeleted: false
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'ASC']]
    });

    // Mark messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId: userId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send a message
router.post('/send', [protect], async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', attachmentUrl } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({ success: false, message: 'Content and receiver required' });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      messageType,
      attachmentUrl
    });

    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
      ]
    });

    // Emit socket event
    if (global.io) {
      global.io.to(receiverId).emit('message:new', populatedMessage);
    }

    res.json({ success: true, message: populatedMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark messages as read
router.put('/read/:senderId', [protect], async (req, res) => {
  try {
    const { senderId } = req.params;

    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a message
router.delete('/:id', [protect], async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
    }

    await message.update({ isDeleted: true });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;