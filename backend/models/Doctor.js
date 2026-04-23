const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' }
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  qualifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 500
  },
  telemedicineFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 300
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: { min: 0, max: 5 }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  about: {
    type: DataTypes.TEXT
  },
  languages: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  hospital: {
    type: DataTypes.STRING
  },
  addressStreet: {
    type: DataTypes.STRING
  },
  addressCity: {
    type: DataTypes.STRING
  },
  addressState: {
    type: DataTypes.STRING
  },
  addressLandmark: {
    type: DataTypes.STRING
  },
  addressPincode: {
    type: DataTypes.STRING
  },
  department: {
    type: DataTypes.STRING
  },
  availableSlots: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isAvailableOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Account Information for Payments
  accountHolderName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ifscCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  branchName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  upiId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'doctors',
  timestamps: true,
  underscored: true
});

module.exports = Doctor;
