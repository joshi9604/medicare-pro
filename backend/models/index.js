const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const Payment = require('./Payment');
const Notification = require('./Notification');
const MedicalRecord = require('./MedicalRecord');

// Define associations
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorProfileId', as: 'doctorProfile' });

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

// Sync database
const syncDatabase = async () => {
  try {
    // Use force: true only for development to recreate tables
    // WARNING: This will DROP all tables and recreate them!
    const forceSync = process.env.DB_FORCE_SYNC === 'true';
    
    await sequelize.sync({ 
      alter: !forceSync,  // Try to alter existing tables
      force: forceSync    // Or force recreate if DB_FORCE_SYNC=true
    });
    
    console.log('✅ Database synced successfully');
    if (forceSync) {
      console.log('⚠️  Tables were recreated (force: true)');
    }
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
    console.log('💡 Try running with DB_FORCE_SYNC=true to recreate tables');
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
  syncDatabase
};
