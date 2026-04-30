// const { sequelize } = require('../config/database');
// const { DataTypes } = require('sequelize');

// const Message = sequelize.define('Message', {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true
//   },
//   senderId: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     field: 'sender_id'
//   },
//   receiverId: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     field: 'receiver_id'
//   },
//   appointmentId: {
//     type: DataTypes.UUID,
//     allowNull: true,
//     field: 'appointment_id'
//   },
//   content: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   },
//   messageType: {
//     type: DataTypes.STRING(50),
//     defaultValue: 'text',
//     field: 'message_type'
//   },
//   attachmentUrl: {
//     type: DataTypes.STRING(500),
//     allowNull: true,
//     field: 'attachment_url'
//   },
//   isRead: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//     field: 'is_read'
//   },
//   readAt: {
//     type: DataTypes.DATE,
//     allowNull: true,
//     field: 'read_at'
//   },
//   isDeleted: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//     field: 'is_deleted'
//   }
// }, {
//   tableName: 'messages',
//   timestamps: true,
//   underscored: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at'
// });

// module.exports = Message;

const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sender_id'
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'receiver_id'
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'appointment_id'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  messageType: {
    type: DataTypes.STRING(50),
    defaultValue: 'text',
    field: 'message_type'
  },
  attachmentUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'attachment_url'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true   // ✅ Sirf ye rakho, createdAt/updatedAt hato
});

// ✅ Associations - YE NAYA HAI
Message.associate = (models) => {
  Message.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  });
  Message.belongsTo(models.User, {
    foreignKey: 'receiverId',
    as: 'receiver'
  });
};

module.exports = Message;