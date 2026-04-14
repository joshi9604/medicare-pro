const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { User, Doctor } = require('../models');
const { protect } = require('../middleware/auth');

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

    const user = await User.create({ name, email, password, role, phone, gender, dateOfBirth, bloodGroup });

    // If doctor, create doctor profile
    if (role === 'doctor' && req.body.doctorProfile) {
      await Doctor.create({ userId: user.id, ...req.body.doctorProfile });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
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
    res.json({ success: true, user: req.user });
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
    const user = await User.findByPk(req.user.id);
    
    res.json({ success: true, user });
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
