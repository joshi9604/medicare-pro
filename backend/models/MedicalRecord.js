const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  appointmentId: {
    type: DataTypes.UUID,
    references: { model: 'appointments', key: 'id' }
  },
  recordType: {
    type: DataTypes.ENUM('consultation', 'lab_report', 'prescription', 'vaccination', 'surgery', 'other'),
    defaultValue: 'consultation'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  diagnosis: {
    type: DataTypes.TEXT
  },
  symptoms: {
    type: DataTypes.TEXT
  },
  treatment: {
    type: DataTypes.TEXT
  },
  medications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  labResults: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  bloodPressure: {
    type: DataTypes.STRING
  },
  heartRate: {
    type: DataTypes.INTEGER
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 1)
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2)
  },
  height: {
    type: DataTypes.DECIMAL(5, 2)
  },
  allergies: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  isConfidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'medical_records',
  timestamps: true,
  underscored: true
});

module.exports = MedicalRecord;
