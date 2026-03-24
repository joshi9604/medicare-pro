const express = require('express');
const router = express.Router();
const { Prescription, User, Appointment, Notification } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

router.use(protect);

// Create prescription (doctor only)
router.post('/', authorize('doctor'), async (req, res) => {
  try {
    const prescription = await Prescription.create({
      ...req.body,
      doctorId: req.user.id
    });
    
    const prescriptionWithDetails = await Prescription.findByPk(prescription.id, {
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email', 'dateOfBirth', 'gender'] },
        { model: User, as: 'doctor', attributes: ['name'] }
      ]
    });
    
    // Send prescription email to patient
    try {
      const patient = prescriptionWithDetails.patient;
      const doctor = prescriptionWithDetails.doctor;
      
      await sendEmail({
        to: patient?.email,
        subject: '💊 New Prescription - MediCare Pro',
        html: `<h2>Your Prescription</h2>
          <p>Dear ${patient?.name},</p>
          <p>Dr. ${doctor?.name} has prescribed you medication.</p>
          <p><strong>Diagnosis:</strong> ${req.body.diagnosis}</p>
          <p><strong>Medications:</strong></p>
          <ul>${(req.body.medications || []).map(med => `<li>${med.name} - ${med.dosage}</li>`).join('')}</ul>
          <p><strong>Instructions:</strong> ${req.body.instructions || 'Take as prescribed'}</p>
          <br><p>Please login to view full details. 🏥</p>`
      });
      console.log('✅ Prescription email sent');
    } catch (e) { console.log('Prescription email failed:', e.message); }
    
    // Create notification for patient
    try {
      await Notification.create({
        userId: req.body.patientId,
        title: 'New Prescription',
        message: `Dr. ${prescriptionWithDetails.doctor?.name} has prescribed you medication for ${req.body.diagnosis}.`,
        type: 'prescription',
        link: '/patient/prescriptions'
      });
      console.log('✅ Prescription notification created');
      
      // Emit socket event for real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(req.body.patientId).emit('notification', {
          title: 'New Prescription',
          message: `Dr. ${prescriptionWithDetails.doctor?.name} has prescribed you medication.`,
          type: 'prescription'
        });
        console.log('✅ Socket notification emitted to patient');
      }
    } catch (e) {
      console.error('❌ Prescription notification failed:', e.message);
    }
    
    res.status(201).json({ success: true, prescription: prescriptionWithDetails });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get prescriptions
router.get('/', async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'patient') whereClause.patientId = req.user.id;
    if (req.user.role === 'doctor') whereClause.doctorId = req.user.id;

    const prescriptions = await Prescription.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email', 'dateOfBirth', 'gender', 'bloodGroup'] },
        { model: User, as: 'doctor', attributes: ['name'] },
        { model: Appointment, as: 'appointment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, count: prescriptions.length, prescriptions });
  } catch (err) {
    console.error('Prescriptions fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single prescription
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email', 'dateOfBirth', 'gender', 'bloodGroup', 'phone'] },
        { model: User, as: 'doctor', attributes: ['name', 'email'] },
        { model: Appointment, as: 'appointment' }
      ]
    });
    if (!prescription) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
