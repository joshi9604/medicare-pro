const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { User, Doctor } = require('../models');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => {
    const uniqueName = `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  },
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'medicare_secret_2024', {
    expiresIn: '7d',
  });

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const canExposeOtp = () => process.env.EXPOSE_OTP_IN_RESPONSE === 'true';
const emailConfigMessage = (prefix, errorMessage) =>
  `${prefix} OTP email could not be sent. ${errorMessage || 'Please check SMTP/email configuration.'}`;

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
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').isIn(['patient', 'doctor', 'admin']).withMessage('Valid role required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      logger.warn('Registration validation failed', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const {
        name,
        email,
        password,
        role,
        phone,
        gender,
        dateOfBirth,
        bloodGroup,
      } = req.body;

      const normalizedEmail = String(email || '').trim().toLowerCase();
      const otp = generateOtp();
      const existingUser = await User.findOne({ where: { email: normalizedEmail } });

      if (existingUser) {
        if (existingUser.isVerified) {
          return res.status(400).json({
            success: false,
            message: 'Email already registered',
          });
        }

        existingUser.emailVerificationOtp = otp;
        existingUser.emailVerificationOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
        await existingUser.save();

        let emailSent = false;
        let emailErrorMessage = '';

        try {
          logger.info('Sending verification OTP', { to: logger.maskEmail(existingUser.email) });
          emailSent = await sendEmail({
            to: existingUser.email,
            subject: 'Verify your MediCare Pro account',
            html: buildOtpEmail(existingUser.name, otp),
          });
        } catch (emailErr) {
          emailErrorMessage = emailErr.message;
          logger.error('Verification OTP email failed', emailErrorMessage);
        }

        if (!emailSent) {
          const response = {
            success: true,
            requiresVerification: true,
            email: existingUser.email,
            emailDeliveryFailed: true,
            message: emailConfigMessage(
              'A new OTP was generated, but',
              emailErrorMessage
            ),
          };

          if (canExposeOtp()) {
            response.otp = otp;
            response.message = `Development mode: email failed, use OTP ${otp}`;
          }

          return res.status(202).json(response);
        }

        return res.json({
          success: true,
          requiresVerification: true,
          email: existingUser.email,
          message: 'Account already exists but is not verified. A new OTP has been sent.',
        });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role,
        phone,
        gender,
        dateOfBirth,
        bloodGroup,
        isVerified: false,
        emailVerificationOtp: otp,
        emailVerificationOtpExpire: new Date(Date.now() + 10 * 60 * 1000),
      });

      if (role === 'doctor' && req.body.doctorProfile) {
        await Doctor.create({
          userId: user.id,
          ...req.body.doctorProfile,
        });
      }

      let emailSent = false;
      let emailErrorMessage = '';

      try {
        logger.info('Sending verification OTP', { to: logger.maskEmail(user.email) });
        emailSent = await sendEmail({
          to: user.email,
          subject: 'Verify your MediCare Pro account',
          html: buildOtpEmail(user.name, otp),
        });
      } catch (emailErr) {
        emailErrorMessage = emailErr.message;
        logger.error('Verification OTP email failed', emailErrorMessage);
      }

      if (!emailSent) {
        const response = {
          success: true,
          requiresVerification: true,
          email: user.email,
          emailDeliveryFailed: true,
          message: emailConfigMessage(
            'Account created, but',
            emailErrorMessage
          ),
        };

        if (canExposeOtp()) {
          response.otp = otp;
          response.message = `Development mode: email failed, use OTP ${otp}`;
        }

        return res.status(202).json(response);
      }

      return res.status(201).json({
        success: true,
        requiresVerification: true,
        email: user.email,
        message: 'Account created. Please verify OTP sent to your email.',
      });
    } catch (err) {
      logger.error('Register error', err.message);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// Verify Email OTP
router.post(
  '/verify-email',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('6-digit OTP required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { email, otp } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const user = await User.findOne({ where: { email: normalizedEmail } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isVerified) {
        return res.json({
          success: true,
          token: generateToken(user.id),
          user: sanitizeUser(user),
        });
      }

      if (!user.emailVerificationOtp || !user.emailVerificationOtpExpire) {
        return res.status(400).json({
          success: false,
          message: 'OTP not found. Please request a new OTP.',
        });
      }

      if (new Date(user.emailVerificationOtpExpire) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired. Please request a new OTP.',
        });
      }

      if (String(user.emailVerificationOtp) !== String(otp)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      user.isVerified = true;
      user.emailVerificationOtp = null;
      user.emailVerificationOtpExpire = null;
      await user.save();

      return res.json({
        success: true,
        token: generateToken(user.id),
        user: sanitizeUser(user),
        message: 'Email verified successfully',
      });
    } catch (err) {
      logger.error('Verify OTP error', err.message);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// Resend OTP
router.post(
  '/resend-otp',
  [body('email').isEmail().withMessage('Valid email required')],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { email } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const user = await User.findOne({ where: { email: normalizedEmail } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Account already verified',
        });
      }

      const otp = generateOtp();

      user.emailVerificationOtp = otp;
      user.emailVerificationOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      let emailSent = false;
      let emailErrorMessage = '';

      try {
        logger.info('Sending verification OTP', { to: logger.maskEmail(user.email) });
        emailSent = await sendEmail({
          to: user.email,
          subject: 'Your new MediCare Pro verification OTP',
          html: buildOtpEmail(user.name, otp),
        });
      } catch (emailErr) {
        emailErrorMessage = emailErr.message;
        logger.error('Verification OTP email failed', emailErrorMessage);
      }

      if (!emailSent) {
        const response = {
          success: true,
          emailDeliveryFailed: true,
          message: emailConfigMessage(
            'A new OTP was generated, but',
            emailErrorMessage
          ),
        };

        if (canExposeOtp()) {
          response.otp = otp;
          response.message = `Development mode: email failed, use OTP ${otp}`;
        }

        return res.status(202).json(response);
      }

      return res.json({
        success: true,
        message: 'OTP sent successfully',
      });
    } catch (err) {
      logger.error('Resend OTP error', err.message);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    logger.debug('Login attempt', { email: logger.maskEmail(normalizedEmail) });

    const user = await User.findOne({ where: { email: normalizedEmail } });

    logger.debug('Login user lookup completed', { found: Boolean(user) });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);

    logger.debug('Login password check completed', { matched: isMatch });

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated',
      });
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      user.emailVerificationOtp = otp;
      user.emailVerificationOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      let emailSent = false;
      let emailErrorMessage = '';

      try {
        logger.info('Sending verification OTP', { to: logger.maskEmail(user.email) });
        emailSent = await sendEmail({
          to: user.email,
          subject: 'Verify your MediCare Pro account',
          html: buildOtpEmail(user.name, otp),
        });
      } catch (emailErr) {
        emailErrorMessage = emailErr.message;
        logger.error('Verification OTP email failed', emailErrorMessage);
      }

      const response = {
        success: false,
        requiresVerification: true,
        email: user.email,
        message: emailSent
          ? 'Please verify your email before login. A new OTP has been sent.'
          : emailConfigMessage('Please verify your email before login, but', emailErrorMessage),
      };

      if (!emailSent) {
        response.emailDeliveryFailed = true;
      }

      if (!emailSent && canExposeOtp()) {
        response.otp = otp;
        response.message = `Development mode: email failed, use OTP ${otp}`;
      }

      return res.status(202).json(response);
    }

    return res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    logger.error('Login error', err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Current User
router.get('/me', protect, async (req, res) => {
  try {
    logger.debug('Current user requested', { userId: req.user?.id, role: req.user?.role });

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (err) {
    logger.error('Current user lookup failed', err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Update Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, dateOfBirth, gender, bloodGroup } = req.body;

    const updateData = {
      name,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
    };

    if (address) {
      updateData.addressStreet = address.street;
      updateData.addressCity = address.city;
      updateData.addressState = address.state;
      updateData.addressPincode = address.pincode;
    }

    await User.update(updateData, {
      where: { id: req.user.id },
    });

    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'],
      },
    });

    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    logger.error('Update profile error', err.message);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Upload Avatar
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await User.update(
      { avatar: avatarUrl },
      { where: { id: req.user.id } }
    );

    return res.json({
      success: true,
      avatar: avatarUrl,
      message: 'Avatar uploaded successfully',
    });
  } catch (err) {
    logger.error('Upload avatar error', err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
