const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  prescriptionId: {
    type: DataTypes.STRING,
    unique: true
  },
  appointmentId: {
    type: DataTypes.UUID,
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
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  medicines: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  labTests: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  advice: {
    type: DataTypes.TEXT
  },
  followUpDate: {
    type: DataTypes.DATE
  },
  issuedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'prescriptions',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (prescription) => {
      if (!prescription.prescriptionId) {
        prescription.prescriptionId = 'RX-' + Date.now().toString(36).toUpperCase();
      }
    }
  }
});

module.exports = Prescription;
