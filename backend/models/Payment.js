const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'appointments', key: 'id' }
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  razorpayOrderId: {
    type: DataTypes.STRING
  },
  razorpayPaymentId: {
    type: DataTypes.STRING
  },
  razorpaySignature: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('created', 'paid', 'failed', 'refunded'),
    defaultValue: 'created'
  },
  method: {
    type: DataTypes.STRING
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  refundId: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true
});

module.exports = Payment;
