const express = require('express');
const router = express.Router();
const { Appointment, Prescription } = require('../models');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Get patient profile
router.get('/profile', authorize('patient'), async (req, res) => {
  res.json({ success: true, patient: req.user });
});

// Get patient medical history summary
router.get('/medical-history', authorize('patient'), async (req, res) => {
  try {
    const [appointments, prescriptions] = await Promise.all([
      Appointment.findAll({
        where: { patientId: req.user.id, status: 'completed' },
        include: [
          { model: require('../models').User, as: 'doctor', attributes: ['name'] },
          { model: require('../models').Doctor, as: 'doctorProfile', attributes: ['specialization'] }
        ],
        order: [['appointmentDate', 'DESC']],
        limit: 10
      }),
      Prescription.findAll({
        where: { patientId: req.user.id },
        include: [{ model: require('../models').User, as: 'doctor', attributes: ['name'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
      })
    ]);

    res.json({ success: true, appointments, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
