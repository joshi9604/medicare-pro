const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.STRING,
    defaultValue: () => 'APT-' + uuidv4().slice(0, 8).toUpperCase(),
    unique: true
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
  doctorProfileId: {
    type: DataTypes.UUID,
    references: { model: 'doctors', key: 'id' }
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('in-person', 'telemedicine'),
    defaultValue: 'in-person'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'),
    defaultValue: 'pending'
  },
  symptoms: {
    type: DataTypes.STRING(500)
  },
  notes: {
    type: DataTypes.TEXT
  },
  videoCallLink: {
    type: DataTypes.STRING
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2)
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  paymentId: {
    type: DataTypes.STRING
  },
  followUpDate: {
    type: DataTypes.DATE
  },
  cancelReason: {
    type: DataTypes.TEXT
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  review: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true
});

module.exports = Appointment;
