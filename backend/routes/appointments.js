// const express = require('express');
// const router = express.Router();
// const { Op } = require('sequelize');
// const { Appointment, Doctor, User, Notification } = require('../models');
// const { protect, authorize } = require('../middleware/auth');
// const { sendEmail } = require('../utils/email');

// router.use(protect);

// // Book appointment (patient)
// router.post('/', authorize('patient'), async (req, res) => {
//   try {
//     const { doctorId, appointmentDate, timeSlot, type, symptoms } = req.body;

//     // Validate required fields
//     if (!doctorId || !appointmentDate || !timeSlot) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Doctor ID, appointment date, and time slot are required' 
//       });
//     }

//     const doctorUser = await User.findByPk(doctorId);
//     const doctorProfile = await Doctor.findOne({ where: { userId: doctorId } });
//     if (!doctorProfile) return res.status(404).json({ success: false, message: 'Doctor not found' });

//     // Check for existing appointment on same date and time slot
//     const existingAppointment = await Appointment.findOne({
//       where: {
//         doctorId: doctorId,
//         appointmentDate: appointmentDate,
//         timeSlot: timeSlot,
//         status: { [Op.notIn]: ['cancelled'] } // Only check active appointments
//       }
//     });

//     if (existingAppointment) {
//       return res.status(409).json({ 
//         success: false, 
//         message: 'This time slot is already booked. Please choose another time.' 
//       });
//     }

//     const fee = type === 'telemedicine' ? doctorProfile.telemedicineFee : doctorProfile.consultationFee;

//     // Generate video link for telemedicine
//     const videoCallLink = type === 'telemedicine'
//       ? `https://meet.jit.si/MediCare-${Date.now().toString(36)}`
//       : null;

//     const appointment = await Appointment.create({
//       patientId: req.user.id,
//       doctorId: doctorId,
//       doctorProfileId: doctorProfile.id,
//       appointmentDate,
//       timeSlot,
//       type,
//       symptoms,
//       fee,
//       videoCallLink
//     });

//     const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
//       include: [
//         { model: User, as: 'patient', attributes: ['name', 'email', 'phone'] },
//         { model: User, as: 'doctor', attributes: ['name', 'email'] }
//       ]
//     });

//     // Send confirmation emails to both patient and doctor
//     try {
//       console.log('📧 Sending emails...');
//       console.log('Patient email:', req.user.email);
//       console.log('Doctor email:', doctorUser?.email);
      
//       // Email to Patient
//       if (req.user.email) {
//         await sendEmail({
//           to: req.user.email,
//           subject: '✅ Appointment Confirmed - MediCare Pro',
//           html: `<h2>Appointment Booked!</h2>
//             <p>Dear ${req.user.name},</p>
//             <p>Your appointment with Dr. ${doctorUser?.name} is confirmed.</p>
//             <p><strong>Date:</strong> ${new Date(appointmentDate).toDateString()}</p>
//             <p><strong>Time:</strong> ${timeSlot}</p>
//             <p><strong>Type:</strong> ${type}</p>
//             ${videoCallLink ? `<p><strong>Video Link:</strong> <a href="${videoCallLink}">${videoCallLink}</a></p>` : ''}
//             <p><strong>Fee:</strong> ₹${fee}</p>
//             <br><p>Thank you for choosing MediCare Pro! 🏥</p>`
//         });
//         console.log('✅ Patient email sent');
//       }
      
//       // Email to Doctor
//       if (doctorUser?.email) {
//         await sendEmail({
//           to: doctorUser.email,
//           subject: '📅 New Appointment Booked - MediCare Pro',
//           html: `<h2>New Appointment!</h2>
//             <p>Dear Dr. ${doctorUser.name},</p>
//             <p>A new appointment has been booked with you.</p>
//             <p><strong>Patient:</strong> ${req.user.name}</p>
//             <p><strong>Date:</strong> ${new Date(appointmentDate).toDateString()}</p>
//             <p><strong>Time:</strong> ${timeSlot}</p>
//             <p><strong>Type:</strong> ${type}</p>
//             ${symptoms ? `<p><strong>Symptoms:</strong> ${symptoms}</p>` : ''}
//             ${videoCallLink ? `<p><strong>Video Link:</strong> <a href="${videoCallLink}">${videoCallLink}</a></p>` : ''}
//             <br><p>Please check your dashboard for details. 🏥</p>`
//         });
//         console.log('✅ Doctor email sent');
//       }
//     } catch (e) { 
//       console.error('❌ Email failed:', e.message);
//       console.error(e.stack);
//     }

//     // Create notifications for both patient and doctor
//     try {
//       // Notification for patient
//       await Notification.create({
//         userId: req.user.id,
//         title: 'Appointment Confirmed',
//         message: `Your appointment with Dr. ${doctorUser?.name} on ${new Date(appointmentDate).toDateString()} at ${timeSlot} has been confirmed.`,
//         type: 'appointment',
//         link: '/patient/appointments'
//       });
//       console.log('✅ Patient notification created');
      
//       // Notification for doctor
//       await Notification.create({
//         userId: doctorId,
//         title: 'New Appointment',
//         message: `New appointment booked by ${req.user.name} on ${new Date(appointmentDate).toDateString()} at ${timeSlot}.`,
//         type: 'appointment',
//         link: '/doctor/appointments'
//       });
//       console.log('✅ Doctor notification created');
      
//       // Emit socket event for real-time notification
//       const io = req.app.get('io');
//       if (io) {
//         io.to(doctorId).emit('notification', {
//           title: 'New Appointment',
//           message: `New appointment booked by ${req.user.name}`,
//           type: 'appointment'
//         });
//         console.log('✅ Socket notification emitted to doctor');
//       }
//     } catch (e) {
//       console.error('❌ Notification creation failed:', e.message);
//     }

//     res.status(201).json({ success: true, appointment: appointmentWithDetails });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });

// // Get appointments (role-based)
// router.get('/', async (req, res) => {
//   try {
//     let whereClause = {};
//     if (req.user.role === 'patient') whereClause.patientId = req.user.id;
//     else if (req.user.role === 'doctor') whereClause.doctorId = req.user.id;

//     const { status, type, date } = req.query;
//     if (status) whereClause.status = status;
//     if (type) whereClause.type = type;
//     if (date) {
//       const d = new Date(date);
//       const nextDay = new Date(d.getTime() + 86400000);
//       whereClause.appointmentDate = { [Op.gte]: d, [Op.lt]: nextDay };
//     }

//     const appointments = await Appointment.findAll({
//       where: whereClause,
//       include: [
//         { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
//         { model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'avatar'] },
//         { model: Doctor, as: 'doctorProfile', attributes: ['id', 'specialization', 'consultationFee'] }
//       ],
//       order: [['appointmentDate', 'DESC']]
//     });

//     res.json({ success: true, count: appointments.length, appointments });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Update appointment status (doctor)
// router.put('/:id/status', authorize('doctor', 'admin'), async (req, res) => {
//   try {
//     const { status, notes, cancelReason } = req.body;
    
//     await Appointment.update(
//       { status, notes, cancelReason },
//       { where: { id: req.params.id } }
//     );
    
//     const apt = await Appointment.findByPk(req.params.id, {
//       include: [
//         { model: User, as: 'patient', attributes: ['name', 'email'] },
//         { model: User, as: 'doctor', attributes: ['name'] }
//       ]
//     });

//     if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
//     res.json({ success: true, appointment: apt });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });

// // Cancel appointment (patient)
// router.put('/:id/cancel', authorize('patient'), async (req, res) => {
//   try {
//     const apt = await Appointment.findOne({ where: { id: req.params.id, patientId: req.user.id } });
//     if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
//     if (['completed','cancelled'].includes(apt.status))
//       return res.status(400).json({ success: false, message: 'Cannot cancel this appointment' });

//     apt.status = 'cancelled';
//     apt.cancelReason = req.body.reason || 'Patient cancelled';
//     await apt.save();
//     res.json({ success: true, appointment: apt });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });

// // Rate appointment
// router.put('/:id/rate', authorize('patient'), async (req, res) => {
//   try {
//     const { rating, review } = req.body;
    
//     const [updated] = await Appointment.update(
//       { rating, review },
//       { where: { id: req.params.id, patientId: req.user.id, status: 'completed' } }
//     );
    
//     if (!updated) return res.status(404).json({ success: false, message: 'Appointment not found or not completed' });
    
//     const apt = await Appointment.findByPk(req.params.id);

//     // Update doctor rating
//     const allRated = await Appointment.findAll({ 
//       where: { doctorId: apt.doctorId, rating: { [Op.not]: null } } 
//     });
//     const avgRating = allRated.reduce((sum, a) => sum + a.rating, 0) / allRated.length;
//     await Doctor.update(
//       { rating: avgRating.toFixed(1), totalReviews: allRated.length },
//       { where: { userId: apt.doctorId } }
//     );

//     res.json({ success: true, appointment: apt });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });

// // Dashboard stats
// router.get('/stats/dashboard', async (req, res) => {
//   try {
//     let whereClause = {};
//     if (req.user.role === 'patient') whereClause.patientId = req.user.id;
//     if (req.user.role === 'doctor') whereClause.doctorId = req.user.id;

//     const [total, pending, confirmed, completed, cancelled, telemedicine] = await Promise.all([
//       Appointment.count({ where: whereClause }),
//       Appointment.count({ where: { ...whereClause, status: 'pending' } }),
//       Appointment.count({ where: { ...whereClause, status: 'confirmed' } }),
//       Appointment.count({ where: { ...whereClause, status: 'completed' } }),
//       Appointment.count({ where: { ...whereClause, status: 'cancelled' } }),
//       Appointment.count({ where: { ...whereClause, type: 'telemedicine' } }),
//     ]);

//     // Today's appointments
//     const today = new Date(); today.setHours(0,0,0,0);
//     const tomorrow = new Date(today.getTime() + 86400000);
//     const todayCount = await Appointment.count({
//       where: { ...whereClause, appointmentDate: { [Op.gte]: today, [Op.lt]: tomorrow } }
//     });

//     res.json({ success: true, stats: { total, pending, confirmed, completed, cancelled, telemedicine, today: todayCount } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Add rating and review (patient only)
// router.post('/:id/rate', authorize('patient'), async (req, res) => {
//   try {
//     const { rating, review } = req.body;
    
//     if (!rating || rating < 1 || rating > 5) {
//       return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
//     }

//     const appointment = await Appointment.findOne({
//       where: { 
//         id: req.params.id, 
//         patientId: req.user.id,
//         status: 'completed'
//       }
//     });

//     if (!appointment) {
//       return res.status(404).json({ success: false, message: 'Appointment not found or not completed' });
//     }

//     // Update appointment with rating
//     await appointment.update({ rating, review });

//     // Update doctor's average rating
//     const doctorProfile = await Doctor.findOne({ where: { userId: appointment.doctorId } });
//     if (doctorProfile) {
//       const allRatings = await Appointment.findAll({
//         where: { doctorId: appointment.doctorId, rating: { [Op.not]: null } },
//         attributes: ['rating']
//       });
      
//       const avgRating = allRatings.reduce((sum, a) => sum + a.rating, 0) / allRatings.length;
//       await doctorProfile.update({ 
//         rating: parseFloat(avgRating.toFixed(1)),
//         totalReviews: allRatings.length
//       });
//     }

//     res.json({ success: true, message: 'Rating submitted successfully' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Appointment, Doctor, User, Notification } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

router.use(protect);

// Book appointment (patient) - Creates PENDING appointment, payment required for confirmation
router.post('/', authorize('patient'), async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, type, symptoms } = req.body;

    const doctorUser = await User.findByPk(doctorId);
    const doctorProfile = await Doctor.findOne({ where: { userId: doctorId } });
    if (!doctorProfile) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // ✅ SAME DAY + SAME TIME SLOT DUPLICATE BOOKING CHECK
    const appointmentStart = new Date(appointmentDate);
    appointmentStart.setHours(0, 0, 0, 0);
    const appointmentEnd = new Date(appointmentStart.getTime() + 86400000);

    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId: doctorId,
        timeSlot: timeSlot,
        appointmentDate: {
          [Op.gte]: appointmentStart,
          [Op.lt]: appointmentEnd
        },
        status: {
          [Op.notIn]: ['cancelled'] // cancelled slots dobara book ho sakte hain
        }
      }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: `Yeh time slot (${timeSlot}) already booked hai. Koi aur time choose karein.`
      });
    }
    // ✅ CHECK KHATAM

    const fee = type === 'telemedicine' ? doctorProfile.telemedicineFee : doctorProfile.consultationFee;

    // Generate video link for telemedicine (will be sent after payment)
    const videoCallLink = type === 'telemedicine'
      ? `https://meet.jit.si/MediCare-${Date.now().toString(36)}`
      : null;

    // Create appointment with PENDING status (payment required for confirmation)
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId: doctorId,
      doctorProfileId: doctorProfile.id,
      appointmentDate,
      timeSlot,
      type,
      symptoms,
      fee,
      videoCallLink,
      status: 'pending', // Payment pending
      paymentStatus: 'pending'
    });

    const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email', 'phone'] },
        { model: User, as: 'doctor', attributes: ['name', 'email'] }
      ]
    });

    // ⚠️ NOTE: Emails will be sent AFTER payment confirmation, not now
    // Only create minimal notifications

    res.status(201).json({ 
      success: true, 
      appointment: appointmentWithDetails,
      message: 'Appointment created. Please complete payment to confirm.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get appointments (role-based)
router.get('/', async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'patient') whereClause.patientId = req.user.id;
    else if (req.user.role === 'doctor') whereClause.doctorId = req.user.id;

    const { status, type, date } = req.query;
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d.getTime() + 86400000);
      whereClause.appointmentDate = { [Op.gte]: d, [Op.lt]: nextDay };
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Doctor, as: 'doctorProfile', attributes: ['id', 'specialization', 'consultationFee'] }
      ],
      order: [['appointmentDate', 'DESC']]
    });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update appointment status (doctor)
router.put('/:id/status', authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { status, notes, cancelReason } = req.body;
    
    await Appointment.update(
      { status, notes, cancelReason },
      { where: { id: req.params.id } }
    );
    
    const apt = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email'] },
        { model: User, as: 'doctor', attributes: ['name'] }
      ]
    });

    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Cancel appointment (patient)
router.put('/:id/cancel', authorize('patient'), async (req, res) => {
  try {
    const apt = await Appointment.findOne({ where: { id: req.params.id, patientId: req.user.id } });
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (['completed','cancelled'].includes(apt.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel this appointment' });

    apt.status = 'cancelled';
    apt.cancelReason = req.body.reason || 'Patient cancelled';
    await apt.save();
    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Rate appointment
router.put('/:id/rate', authorize('patient'), async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    const [updated] = await Appointment.update(
      { rating, review },
      { where: { id: req.params.id, patientId: req.user.id, status: 'completed' } }
    );
    
    if (!updated) return res.status(404).json({ success: false, message: 'Appointment not found or not completed' });
    
    const apt = await Appointment.findByPk(req.params.id);

    // Update doctor rating
    const allRated = await Appointment.findAll({ 
      where: { doctorId: apt.doctorId, rating: { [Op.not]: null } } 
    });
    const avgRating = allRated.reduce((sum, a) => sum + a.rating, 0) / allRated.length;
    await Doctor.update(
      { rating: avgRating.toFixed(1), totalReviews: allRated.length },
      { where: { userId: apt.doctorId } }
    );

    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Dashboard stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'patient') whereClause.patientId = req.user.id;
    if (req.user.role === 'doctor') whereClause.doctorId = req.user.id;

    const [total, pending, confirmed, completed, cancelled, telemedicine] = await Promise.all([
      Appointment.count({ where: whereClause }),
      Appointment.count({ where: { ...whereClause, status: 'pending' } }),
      Appointment.count({ where: { ...whereClause, status: 'confirmed' } }),
      Appointment.count({ where: { ...whereClause, status: 'completed' } }),
      Appointment.count({ where: { ...whereClause, status: 'cancelled' } }),
      Appointment.count({ where: { ...whereClause, type: 'telemedicine' } }),
    ]);

    // Today's appointments
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const todayCount = await Appointment.count({
      where: { ...whereClause, appointmentDate: { [Op.gte]: today, [Op.lt]: tomorrow } }
    });

    res.json({ success: true, stats: { total, pending, confirmed, completed, cancelled, telemedicine, today: todayCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add rating and review (patient only)
router.post('/:id/rate', authorize('patient'), async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const appointment = await Appointment.findOne({
      where: { 
        id: req.params.id, 
        patientId: req.user.id,
        status: 'completed'
      }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or not completed' });
    }

    // Update appointment with rating
    await appointment.update({ rating, review });

    // Update doctor's average rating
    const doctorProfile = await Doctor.findOne({ where: { userId: appointment.doctorId } });
    if (doctorProfile) {
      const allRatings = await Appointment.findAll({
        where: { doctorId: appointment.doctorId, rating: { [Op.not]: null } },
        attributes: ['rating']
      });
      
      const avgRating = allRatings.reduce((sum, a) => sum + a.rating, 0) / allRatings.length;
      await doctorProfile.update({ 
        rating: parseFloat(avgRating.toFixed(1)),
        totalReviews: allRatings.length
      });
    }

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;