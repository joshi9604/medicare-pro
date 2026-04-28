const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { User, Doctor } = require('../models');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const sanitizeUser = (user) => {
  if (!user) return null;

  const rawUser = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const {
    password,
    resetPasswordToken,
    resetPasswordExpire,
    emailVerificationOtp,
    emailVerificationOtpExpire,
    ...safeUser
  } = rawUser;
  return safeUser;
};

// Multer configuration for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => {
    const uniqueName = `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  }
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'medicare_secret_2024', { expiresIn: '7d' });

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const buildOtpEmail = (name, otp) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
    <h2>MediCare Pro email verification</h2>
    <p>Hello ${name || 'there'},</p>
    <p>Your verification OTP is:</p>
    <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:18px 0">${otp}</div>
    <p>This OTP is valid for 10 minutes.</p>
  </div>
`;

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').isIn(['patient','doctor','admin']).withMessage('Valid role required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, role, phone, gender, dateOfBirth, bloodGroup } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const otp = generateOtp();
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      gender,
      dateOfBirth,
      bloodGroup,
      isVerified: false,
      emailVerificationOtp: otp,
      emailVerificationOtpExpire: new Date(Date.now() + 10 * 60 * 1000)
    });

    // If doctor, create doctor profile
    if (role === 'doctor' && req.body.doctorProfile) {
      await Doctor.create({ userId: user.id, ...req.body.doctorProfile });
    }

    let emailSent = false;
    try {
      emailSent = await sendEmail({
        to: user.email,
        subject: 'Verify your MediCare Pro account',
        html: buildOtpEmail(user.name, otp)
      });
    } catch (emailErr) {
      console.error('Verification OTP email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: user.email,
      message: emailSent
        ? 'Account created. Please verify OTP sent to your email.'
        : 'Account created, but email service is not configured so OTP could not be sent.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify email OTP
router.post('/verify-email', [
  body('email').isEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('6-digit OTP required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) {
      return res.json({ success: true, token: generateToken(user.id), user: sanitizeUser(user) });
    }
    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpire) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new OTP.' });
    }
    if (new Date(user.emailVerificationOtpExpire) < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP.' });
    }
    if (String(user.emailVerificationOtp) !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpire = null;
    await user.save();

    res.json({
      success: true,
      token: generateToken(user.id),
      user: sanitizeUser(user),
      message: 'Email verified successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Resend verification OTP
router.post('/resend-otp', [
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified' });

    const otp = generateOtp();
    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    let emailSent = false;
    try {
      emailSent = await sendEmail({
        to: user.email,
        subject: 'Your new MediCare Pro verification OTP',
        html: buildOtpEmail(user.name, otp)
      });
    } catch (emailErr) {
      console.error('Verification OTP email failed:', emailErr.message);
    }

    res.json({
      success: true,
      message: emailSent ? 'OTP sent successfully' : 'Email service is not configured so OTP could not be sent.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });
    
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Please verify your email before login'
      });
    }

    res.json({
      success: true,
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    console.log('👤 /api/auth/me - User:', req.user?.id, req.user?.name, req.user?.role);
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    console.error('❌ Error in /me:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, dateOfBirth, gender, bloodGroup } = req.body;
    
    const updateData = { name, phone, dateOfBirth, gender, bloodGroup };
    if (address) {
      updateData.addressStreet = address.street;
      updateData.addressCity = address.city;
      updateData.addressState = address.state;
      updateData.addressPincode = address.pincode;
    }
    
    await User.update(updateData, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire']
      }
    });
    
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Upload avatar
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.update({ avatar: avatarUrl }, { where: { id: req.user.id } });
    
    res.json({ success: true, avatar: avatarUrl, message: 'Avatar uploaded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
