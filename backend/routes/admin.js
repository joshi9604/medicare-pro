const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Doctor, Appointment, Payment } = require('../models');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalPatients, totalAppointments, pendingDoctors] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'doctor' } }),
      User.count({ where: { role: 'patient' } }),
      Appointment.count(),
      Doctor.count({ where: { isApproved: false } })
    ]);

    // Total revenue from paid payments
    const totalRevenueResult = await Payment.findAll({
      where: { status: 'paid' },
      attributes: [[Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total']]
    });
    const totalRevenue = parseInt(totalRevenueResult[0]?.get('total') || 0);

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayAppointments = await Appointment.count({ where: { createdAt: { [Op.gte]: todayStart } } });
    
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const monthRevenueResult = await Payment.findAll({
      where: { status: 'paid', createdAt: { [Op.gte]: monthStart } },
      attributes: [[Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total']]
    });
    const monthRevenue = parseInt(monthRevenueResult[0]?.get('total') || 0);

    res.json({
      success: true,
      stats: {
        totalUsers, totalDoctors, totalPatients, totalAppointments,
        pendingDoctors, todayAppointments,
        totalRevenue,
        monthRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    let whereClause = {};
    if (role) whereClause.role = role;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    const users = await User.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve/reject doctor
router.put('/doctors/:id/approve', async (req, res) => {
  try {
    const { isApproved } = req.body;
    await Doctor.update({ isApproved }, { where: { id: req.params.id } });
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle user active status
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get pending doctors
router.get('/doctors/pending', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: { isApproved: false },
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'createdAt'] }]
    });
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get ALL doctors (for admin) - includes approved and pending
router.get('/doctors/all', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['name', 'email', 'phone', 'createdAt', 'avatar', 'isActive'] 
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
