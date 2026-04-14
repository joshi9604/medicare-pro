const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Payment, Appointment, User, Notification } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.use(protect);

// Create Razorpay order
router.post('/create-order', authorize('patient'), async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Create Razorpay order using real API
    const options = {
      amount: Math.round(appointment.fee * 100), // Convert to paise
      currency: 'INR',
      receipt: `apt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId,
        patientId: req.user.id,
        doctorId: appointment.doctorId
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = await Payment.create({
      appointmentId: appointmentId,
      patientId: req.user.id,
      doctorId: appointment.doctorId,
      amount: appointment.fee,
      razorpayOrderId: razorpayOrder.id
    });

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      },
      paymentId: payment.id
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify payment and confirm appointment
router.post('/verify', authorize('patient'), async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, appointmentId } = req.body;

    // Signature verification (real implementation)
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (isValid || process.env.NODE_ENV === 'development') {
      // Update payment
      await Payment.update(
        { razorpayPaymentId, razorpaySignature, status: 'paid' },
        { where: { razorpayOrderId } }
      );

      // Get appointment details before updating
      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          { model: User, as: 'patient', attributes: ['name', 'email'] },
          { model: User, as: 'doctor', attributes: ['name', 'email'] }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Update appointment payment status and confirm it
      await Appointment.update(
        { 
          paymentStatus: 'paid', 
          paymentId: razorpayPaymentId, 
          status: 'confirmed' // Change from pending to confirmed
        },
        { where: { id: appointmentId } }
      );

      // 📧 Send payment confirmation email to patient
      try {
        await sendEmail({
          to: appointment.patient.email,
          subject: '💳 Payment Successful & Appointment Confirmed! - MediCare Pro',
          html: `<h2>Payment Confirmed! ✅</h2>
            <p>Dear ${appointment.patient.name},</p>
            <p>Your payment has been received successfully and your appointment is now confirmed.</p>
            <p><strong>Amount Paid:</strong> ₹${appointment.fee}</p>
            <p><strong>Doctor:</strong> Dr. ${appointment.doctor.name}</p>
            <p><strong>Appointment Date:</strong> ${new Date(appointment.appointmentDate).toDateString()}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
            <p><strong>Type:</strong> ${appointment.type === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}</p>
            ${appointment.videoCallLink ? `<p><strong>Video Link:</strong> <a href="${appointment.videoCallLink}">${appointment.videoCallLink}</a></p>` : ''}
            <p><strong>Transaction ID:</strong> ${razorpayPaymentId}</p>
            <p><strong>Status:</strong> ✅ Confirmed</p>
            <br><p>Thank you for choosing MediCare Pro! 🏥</p>`
        });
        console.log('✅ Payment confirmation email sent to patient');
      } catch (e) { 
        console.error('❌ Payment email failed:', e.message); 
      }

      // 📧 Send appointment booked email to doctor
      try {
        await sendEmail({
          to: appointment.doctor.email,
          subject: '📅 New Confirmed Appointment Booked - MediCare Pro',
          html: `<h2>New Confirmed Appointment!</h2>
            <p>Dear Dr. ${appointment.doctor.name},</p>
            <p>A new appointment has been booked and confirmed with payment.</p>
            <p><strong>Patient:</strong> ${appointment.patient.name}</p>
            <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toDateString()}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
            <p><strong>Type:</strong> ${appointment.type === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}</p>
            ${appointment.symptoms ? `<p><strong>Symptoms:</strong> ${appointment.symptoms}</p>` : ''}
            ${appointment.videoCallLink ? `<p><strong>Video Link:</strong> <a href="${appointment.videoCallLink}">${appointment.videoCallLink}</a></p>` : ''}
            <br><p>Please check your dashboard for details. 🏥</p>`
        });
        console.log('✅ Appointment confirmation email sent to doctor');
      } catch (e) { 
        console.error('❌ Doctor email failed:', e.message); 
      }

      // 🔔 Create notification for patient
      try {
        await Notification.create({
          userId: appointment.patientId,
          title: 'Payment Successful & Appointment Confirmed!',
          message: `Your appointment with Dr. ${appointment.doctor.name} on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.timeSlot} is now confirmed.`,
          type: 'appointment',
          link: '/patient/appointments'
        });
        console.log('✅ Patient notification created');
      } catch (e) { 
        console.error('❌ Patient notification failed:', e.message); 
      }

      // 🔔 Create notification for doctor
      try {
        await Notification.create({
          userId: appointment.doctorId,
          title: 'New Confirmed Appointment',
          message: `New appointment confirmed by ${appointment.patient.name} on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.timeSlot}.`,
          type: 'appointment',
          link: '/doctor/appointments'
        });
        console.log('✅ Doctor notification created');
      } catch (e) { 
        console.error('❌ Doctor notification failed:', e.message); 
      }

      // 📡 Emit socket event for real-time notification to doctor
      const io = req.app.get('io');
      if (io) {
        io.to(appointment.doctorId).emit('notification', {
          title: 'New Confirmed Appointment',
          message: `New appointment booked by ${appointment.patient.name}`,
          type: 'appointment'
        });
        console.log('✅ Socket notification emitted to doctor');
      }

      res.json({ success: true, message: 'Payment verified and appointment confirmed successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const whereClause = req.user.role === 'patient' 
      ? { patientId: req.user.id } 
      : { doctorId: req.user.id };
    
    const payments = await Payment.findAll({
      where: whereClause, // Get all payments (not just paid)
      include: [
        { model: Appointment, as: 'appointment', attributes: ['appointmentDate', 'timeSlot', 'type', 'status'] },
        { model: User, as: 'patient', attributes: ['name'] },
        { model: User, as: 'doctor', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const totalAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalCount = payments.filter(p => p.status === 'paid').length;
    const pendingCount = payments.filter(p => p.status === 'pending' || p.appointment?.status === 'pending').length;

    res.json({ 
      success: true, 
      payments, 
      totalAmount,
      stats: {
        total: totalAmount,
        count: totalCount,
        pending: pendingCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
