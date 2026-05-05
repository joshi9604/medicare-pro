const express = require('express');
const router = express.Router();
const { User, Doctor, Appointment } = require('../models');

router.get('/stats', async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, totalVideoConsults, totalConsultations] = await Promise.all([
      User.count({ where: { role: 'patient' } }),
      User.count({ where: { role: 'doctor' } }),
      Appointment.count(),
      Appointment.count({ where: { type: 'telemedicine' } }),
      Appointment.count({ where: { type: 'in-person' } })
    ]);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalVideoConsults,
        totalConsultations
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const role = String(req.query.role || '').toLowerCase();

    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid role is required' });
    }

    const include = role === 'doctor'
      ? [{
          model: Doctor,
          as: 'doctorProfile',
          attributes: [
            'specialization',
            'experience',
            'consultationFee',
            'telemedicineFee',
            'rating',
            'isApproved'
          ]
        }]
      : [];

    const users = await User.findAll({
      where: { role, isActive: true },
      attributes: ['id', 'name', 'role', 'createdAt'],
      include,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
