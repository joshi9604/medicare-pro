const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const Payment = require('./Payment');
const Notification = require('./Notification');
const MedicalRecord = require('./MedicalRecord');
const Message = require('./Message');

// Define associations
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.belongsTo(Doctor, {
  foreignKey: 'doctorProfileId',
  as: 'doctorProfile',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Appointment.hasOne(Prescription, { foreignKey: 'appointmentId', as: 'prescription' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

Appointment.hasOne(Payment, { foreignKey: 'appointmentId', as: 'payment' });
Payment.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Payment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Payment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Medical Record associations
User.hasMany(MedicalRecord, { foreignKey: 'patientId', as: 'medicalRecords' });
MedicalRecord.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Message associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

const ensureDoctorColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const doctorTable = await queryInterface.describeTable('doctors');
  const requiredDoctorColumns = [
    ['address_street', { type: DataTypes.STRING, allowNull: true }],
    ['address_city', { type: DataTypes.STRING, allowNull: true }],
    ['address_state', { type: DataTypes.STRING, allowNull: true }],
    ['address_landmark', { type: DataTypes.STRING, allowNull: true }],
    ['address_pincode', { type: DataTypes.STRING, allowNull: true }]
  ];

  for (const [columnName, definition] of requiredDoctorColumns) {
    if (!doctorTable[columnName]) {
      await queryInterface.addColumn('doctors', columnName, definition);
      console.log(`Added missing doctors.${columnName} column`);
    }
  }
};

const cleanupOrphanDoctorProfileIds = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const allTables = await queryInterface.showAllTables();
  const normalizedTables = allTables.map((tableName) => (
    typeof tableName === 'string' ? tableName : tableName.tableName
  ));

  if (!normalizedTables.includes('appointments') || !normalizedTables.includes('doctors')) {
    return;
  }

  await sequelize.query(`
    UPDATE appointments
    SET doctor_profile_id = NULL
    WHERE doctor_profile_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM doctors
        WHERE doctors.id = appointments.doctor_profile_id
      )
  `);
};

// Sync database
const syncDatabase = async () => {
  try {
    // Use force: true only for development to recreate tables
    // WARNING: This will DROP all tables and recreate them!
    const forceSync = process.env.DB_FORCE_SYNC === 'true';

    await cleanupOrphanDoctorProfileIds();

    await sequelize.sync({
      alter: !forceSync,
      force: forceSync
    });

    await ensureDoctorColumns();

    if (!forceSync) {
      await sequelize.sync({ alter: true });
    }

    console.log('Database synced successfully');
    if (forceSync) {
      console.log('Tables were recreated (force: true)');
    }
  } catch (error) {
    console.error('Database sync error:', error.message);
    console.log('Try running with DB_FORCE_SYNC=true to recreate tables');
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Doctor,
  Appointment,
  Prescription,
  Payment,
  Notification,
  MedicalRecord,
  Message,
  syncDatabase
};
