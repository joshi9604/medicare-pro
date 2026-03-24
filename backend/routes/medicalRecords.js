const express = require('express');
const router = express.Router();
const { MedicalRecord, User, Appointment } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all medical records for current user
router.get('/', protect, async (req, res) => {
  try {
    let whereClause = {};
    
    if (req.user.role === 'patient') {
      whereClause.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      whereClause.doctorId = req.user.id;
    }
    // Admin can see all records (no whereClause filter)
    
    const { type, search, patientId } = req.query;
    if (type) whereClause.recordType = type;
    if (patientId) whereClause.patientId = patientId;
    
    const records = await MedicalRecord.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email', 'avatar', 'dateOfBirth', 'gender', 'bloodGroup'] },
        { model: User, as: 'doctor', attributes: ['name', 'email', 'avatar'] },
        { model: Appointment, as: 'appointment', attributes: ['appointmentDate', 'type', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    console.error('Medical records fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single medical record
router.get('/:id', protect, async (req, res) => {
  try {
    let whereClause = { id: req.params.id };
    
    if (req.user.role === 'patient') {
      whereClause.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      whereClause.doctorId = req.user.id;
    }
    
    const record = await MedicalRecord.findOne({
      where: whereClause,
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email', 'avatar', 'dateOfBirth', 'gender', 'bloodGroup'] },
        { model: User, as: 'doctor', attributes: ['name', 'email', 'avatar'] },
        { model: Appointment, as: 'appointment', attributes: ['appointmentDate', 'type', 'status', 'symptoms', 'notes'] }
      ]
    });
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create medical record (doctor only)
router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      recordType,
      title,
      description,
      diagnosis,
      symptoms,
      treatment,
      medications,
      attachments,
      labResults,
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
      allergies,
      notes,
      isConfidential,
      followUpRequired,
      followUpDate
    } = req.body;
    
    const record = await MedicalRecord.create({
      patientId,
      doctorId: req.user.id,
      appointmentId,
      recordType: recordType || 'consultation',
      title,
      description,
      diagnosis,
      symptoms,
      treatment,
      medications: medications || [],
      attachments: attachments || [],
      labResults: labResults || {},
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
      allergies,
      notes,
      isConfidential: isConfidential || false,
      followUpRequired: followUpRequired || false,
      followUpDate
    });
    
    const recordWithDetails = await MedicalRecord.findByPk(record.id, {
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email'] },
        { model: User, as: 'doctor', attributes: ['name', 'email'] }
      ]
    });
    
    res.status(201).json({ success: true, record: recordWithDetails });
  } catch (err) {
    console.error('Create medical record error:', err);
    res.status(400).json({ success: false, message: err.message, errors: err.errors?.map(e => e.message) });
  }
});

// Update medical record (doctor only)
router.put('/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({
      where: { id: req.params.id, doctorId: req.user.id }
    });
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    
    await record.update(req.body);
    
    const updatedRecord = await MedicalRecord.findByPk(record.id, {
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email'] },
        { model: User, as: 'doctor', attributes: ['name', 'email'] }
      ]
    });
    
    res.json({ success: true, record: updatedRecord });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete medical record (doctor/admin/patient - can delete their own records)
router.delete('/:id', protect, async (req, res) => {
  try {
    let whereClause = { id: req.params.id };
    
    // Patients can only delete their own records
    if (req.user.role === 'patient') {
      whereClause.patientId = req.user.id;
    }
    // Doctors can only delete records they created
    else if (req.user.role === 'doctor') {
      whereClause.doctorId = req.user.id;
    }
    // Admin can delete any record
    
    const record = await MedicalRecord.findOne({ where: whereClause });
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found or not authorized' });
    }
    
    await record.destroy();
    
    res.json({ success: true, message: 'Medical record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get medical record statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    let whereClause = {};
    
    if (req.user.role === 'patient') {
      whereClause.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      whereClause.doctorId = req.user.id;
    }
    
    const total = await MedicalRecord.count({ where: whereClause });
    
    const byType = await MedicalRecord.findAll({
      where: whereClause,
      attributes: ['recordType', [sequelize.fn('COUNT', sequelize.col('recordType')), 'count']],
      group: ['recordType']
    });
    
    const recent = await MedicalRecord.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        { model: User, as: 'patient', attributes: ['name'] },
        { model: User, as: 'doctor', attributes: ['name'] }
      ]
    });
    
    res.json({ success: true, stats: { total, byType, recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
