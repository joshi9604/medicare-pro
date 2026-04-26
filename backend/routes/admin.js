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

router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: Appointment, as: 'appointment', attributes: ['appointmentDate', 'timeSlot', 'type', 'status'] },
        { model: User, as: 'patient', attributes: ['name', 'email'] },
        { model: User, as: 'doctor', attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const paidPayments = payments.filter((payment) => payment.status === 'paid');
    const refundedPayments = payments.filter((payment) => payment.status === 'refunded');
    const pendingPayments = payments.filter((payment) => ['created', 'pending'].includes(String(payment.status).toLowerCase()));
    const totalRevenue = paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalRefunds = refundedPayments.reduce((sum, payment) => sum + Number(payment.refundAmount || 0), 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRevenue = paidPayments
      .filter((payment) => new Date(payment.createdAt) >= monthStart)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const averageOrderValue = paidPayments.length ? totalRevenue / paidPayments.length : 0;
    const collectionRate = payments.length ? (paidPayments.length / payments.length) * 100 : 0;

    const monthlyMap = new Map();
    for (let index = 5; index >= 0; index -= 1) {
      const month = new Date();
      month.setMonth(month.getMonth() - index, 1);
      month.setHours(0, 0, 0, 0);
      const key = `${month.getFullYear()}-${month.getMonth()}`;
      monthlyMap.set(key, {
        label: month.toLocaleDateString('en-IN', { month: 'short' }),
        revenue: 0,
        transactions: 0
      });
    }

    paidPayments.forEach((payment) => {
      const createdAt = new Date(payment.createdAt);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (!monthlyMap.has(key)) return;
      const monthEntry = monthlyMap.get(key);
      monthEntry.revenue += Number(payment.amount || 0);
      monthEntry.transactions += 1;
    });

    res.json({
      success: true,
      payments,
      analytics: {
        totalRevenue,
        monthlyRevenue,
        totalTransactions: payments.length,
        paidTransactions: paidPayments.length,
        pendingTransactions: pendingPayments.length,
        refundedTransactions: refundedPayments.length,
        totalRefunds,
        averageOrderValue,
        collectionRate,
        monthlyBreakdown: Array.from(monthlyMap.values())
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
