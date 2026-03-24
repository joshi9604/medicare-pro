const { sequelize, User, Doctor, Appointment, Prescription, Payment } = require('./models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Payment.destroy({ where: {} });
    await Prescription.destroy({ where: {} });
    await Appointment.destroy({ where: {} });
    await Doctor.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'demo123',
      role: 'admin',
      phone: '+91 98765 43210',
      isVerified: true,
      isActive: true
    });
    console.log('✅ Admin created:', admin.email);

    // Create Patients
    const patient1 = await User.create({
      name: 'Nirmal Kumar',
      email: 'patient@demo.com',
      password: 'demo123',
      role: 'patient',
      phone: '+91 98765 43211',
      gender: 'male',
      bloodGroup: 'O+',
      dateOfBirth: '1990-05-15',
      addressStreet: '123 Main Street',
      addressCity: 'Mumbai',
      addressState: 'Maharashtra',
      addressPincode: '400001',
      isVerified: true,
      isActive: true
    });

    const patient2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@demo.com',
      password: 'demo123',
      role: 'patient',
      phone: '+91 98765 43212',
      gender: 'female',
      bloodGroup: 'A+',
      dateOfBirth: '1985-08-20',
      isVerified: true,
      isActive: true
    });
    console.log('✅ Patients created');

    // Create Doctors
    const doctorUser1 = await User.create({
      name: 'Rajesh Patel',
      email: 'doctor@demo.com',
      password: 'demo123',
      role: 'doctor',
      phone: '+91 98765 43213',
      gender: 'male',
      isVerified: true,
      isActive: true
    });

    const doctor1 = await Doctor.create({
      userId: doctorUser1.id,
      specialization: 'Cardiologist',
      experience: 15,
      licenseNumber: 'MCI-12345',
      consultationFee: 800,
      telemedicineFee: 500,
      about: 'Experienced cardiologist with 15+ years of practice in heart diseases and cardiac care.',
      hospital: 'City Heart Hospital',
      department: 'Cardiology',
      languages: ['English', 'Hindi', 'Gujarati'],
      isAvailableOnline: true,
      isApproved: true,
      rating: 4.8,
      totalReviews: 124
    });

    const doctorUser2 = await User.create({
      name: 'Anita Desai',
      email: 'anita.doctor@demo.com',
      password: 'demo123',
      role: 'doctor',
      phone: '+91 98765 43214',
      gender: 'female',
      isVerified: true,
      isActive: true
    });

    const doctor2 = await Doctor.create({
      userId: doctorUser2.id,
      specialization: 'Dermatologist',
      experience: 10,
      licenseNumber: 'MCI-67890',
      consultationFee: 600,
      telemedicineFee: 400,
      about: 'Specialist in skin conditions, hair problems, and cosmetic dermatology.',
      hospital: 'Skin Care Clinic',
      department: 'Dermatology',
      languages: ['English', 'Hindi', 'Marathi'],
      isAvailableOnline: true,
      isApproved: true,
      rating: 4.6,
      totalReviews: 89
    });

    const doctorUser3 = await User.create({
      name: 'Suresh Kumar',
      email: 'suresh@demo.com',
      password: 'demo123',
      role: 'doctor',
      phone: '+91 98765 43215',
      gender: 'male',
      isVerified: true,
      isActive: true
    });

    const doctor3 = await Doctor.create({
      userId: doctorUser3.id,
      specialization: 'General Physician',
      experience: 8,
      licenseNumber: 'MCI-11111',
      consultationFee: 400,
      telemedicineFee: 250,
      about: 'General physician providing comprehensive primary healthcare services.',
      hospital: 'Health First Clinic',
      department: 'General Medicine',
      languages: ['English', 'Hindi'],
      isAvailableOnline: true,
      isApproved: true,
      rating: 4.5,
      totalReviews: 67
    });
    console.log('✅ Doctors created');

    // Create Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const appointment1 = await Appointment.create({
      patientId: patient1.id,
      doctorId: doctorUser1.id,
      doctorProfileId: doctor1.id,
      appointmentDate: tomorrow,
      timeSlot: '10:00 - 10:30',
      type: 'in-person',
      status: 'confirmed',
      symptoms: 'Chest pain and shortness of breath',
      fee: 800,
      paymentStatus: 'paid'
    });

    const appointment2 = await Appointment.create({
      patientId: patient1.id,
      doctorId: doctorUser2.id,
      doctorProfileId: doctor2.id,
      appointmentDate: yesterday,
      timeSlot: '14:00 - 14:30',
      type: 'telemedicine',
      status: 'completed',
      symptoms: 'Skin rash and itching',
      fee: 400,
      paymentStatus: 'paid',
      videoCallLink: 'https://meet.jit.si/MediCare-12345'
    });

    const appointment3 = await Appointment.create({
      patientId: patient2.id,
      doctorId: doctorUser1.id,
      doctorProfileId: doctor1.id,
      appointmentDate: new Date(),
      timeSlot: '16:00 - 16:30',
      type: 'in-person',
      status: 'pending',
      symptoms: 'Regular heart checkup',
      fee: 800,
      paymentStatus: 'pending'
    });
    console.log('✅ Appointments created');

    // Create Prescriptions
    await Prescription.create({
      prescriptionId: 'RX-ABC123',
      appointmentId: appointment2.id,
      patientId: patient1.id,
      doctorId: doctorUser2.id,
      diagnosis: 'Acute allergic dermatitis',
      medicines: [
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days', instructions: 'Take at bedtime' },
        { name: 'Betamethasone cream', dosage: 'Apply thin layer', frequency: 'Twice daily', duration: '5 days', instructions: 'Apply on affected area' }
      ],
      advice: 'Avoid exposure to allergens. Keep skin moisturized.',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    console.log('✅ Prescriptions created');

    // Create Payments
    await Payment.create({
      appointmentId: appointment1.id,
      patientId: patient1.id,
      doctorId: doctorUser1.id,
      amount: 800,
      currency: 'INR',
      razorpayOrderId: 'order_test_001',
      razorpayPaymentId: 'pay_test_001',
      status: 'paid',
      method: 'card'
    });

    await Payment.create({
      appointmentId: appointment2.id,
      patientId: patient1.id,
      doctorId: doctorUser2.id,
      amount: 400,
      currency: 'INR',
      razorpayOrderId: 'order_test_002',
      razorpayPaymentId: 'pay_test_002',
      status: 'paid',
      method: 'upi'
    });
    console.log('✅ Payments created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nDemo Accounts:');
    console.log('  Admin:    admin@demo.com / demo123');
    console.log('  Patient:  patient@demo.com / demo123');
    console.log('  Doctor:   doctor@demo.com / demo123');
    console.log('  Doctor 2: anita.doctor@demo.com / demo123');
    console.log('  Doctor 3: suresh@demo.com / demo123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();
