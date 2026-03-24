const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Doctor, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// Get all approved doctors (public) with advanced search & filters
router.get('/', async (req, res) => {
  try {
    const { 
      specialization, 
      search, 
      minFee, 
      maxFee, 
      minRating,
      experience,
      languages,
      availableOnline,
      gender,
      hospital,
      sortBy = 'rating',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;
    
    let whereClause = { isApproved: true };
    let userWhereClause = {};
    
    // Specialization filter
    if (specialization) {
      whereClause.specialization = { [Op.iLike]: `%${specialization}%` };
    }
    
    // Fee range filter
    if (minFee || maxFee) {
      whereClause.consultationFee = {};
      if (minFee) whereClause.consultationFee[Op.gte] = Number(minFee);
      if (maxFee) whereClause.consultationFee[Op.lte] = Number(maxFee);
    }
    
    // Rating filter
    if (minRating) {
      whereClause.rating = { [Op.gte]: Number(minRating) };
    }
    
    // Experience filter
    if (experience) {
      whereClause.experience = { [Op.gte]: Number(experience) };
    }
    
    // Available online filter
    if (availableOnline === 'true') {
      whereClause.isAvailableOnline = true;
    }
    
    // Hospital filter
    if (hospital) {
      whereClause.hospital = { [Op.iLike]: `%${hospital}%` };
    }
    
    // Gender filter (on User model)
    if (gender) {
      userWhereClause.gender = gender;
    }

    // Calculate pagination
    const offset = (Number(page) - 1) * Number(limit);
    
    // Sorting
    const order = [[sortBy, sortOrder]];

    let { count, rows: doctors } = await Doctor.findAndCountAll({
      where: whereClause,
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['name', 'email', 'avatar', 'gender'],
        where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined
      }],
      order,
      limit: Number(limit),
      offset
    });

    // Post-filter for search (name, languages)
    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter(d =>
        d.user?.name?.toLowerCase().includes(searchLower) ||
        d.specialization?.toLowerCase().includes(searchLower) ||
        d.hospital?.toLowerCase().includes(searchLower)
      );
      count = doctors.length;
    }
    
    // Filter by languages
    if (languages) {
      const langArray = languages.split(',').map(l => l.trim().toLowerCase());
      doctors = doctors.filter(d => 
        d.languages?.some(lang => langArray.includes(lang.toLowerCase()))
      );
      count = doctors.length;
    }

    res.json({ 
      success: true, 
      count, 
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      doctors 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'avatar', 'gender', 'phone'] }]
    });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get doctor's own profile
router.get('/profile/me', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update doctor profile
router.put('/profile/me', protect, authorize('doctor'), async (req, res) => {
  try {
    const [updated] = await Doctor.update(req.body, { where: { userId: req.user.id } });
    if (!updated) {
      await Doctor.create({ userId: req.user.id, ...req.body });
    }
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update account information (for approved doctors)
router.put('/profile/account', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    
    if (!doctor.isApproved) {
      return res.status(403).json({ success: false, message: 'Only approved doctors can update account information' });
    }

    const { accountHolderName, accountNumber, ifscCode, bankName, branchName, upiId } = req.body;

    // Validate required fields
    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account holder name, account number, IFSC code, and bank name are required' 
      });
    }

    // Validate IFSC code format (Indian banks)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid IFSC code format. Format should be like: SBIN0001234' 
      });
    }

    // Validate account number (basic validation)
    if (accountNumber.length < 8 || accountNumber.length > 18) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid account number length' 
      });
    }

    const [updated] = await Doctor.update(
      { accountHolderName, accountNumber, ifscCode, bankName, branchName, upiId },
      { where: { userId: req.user.id } }
    );

    const updatedDoctor = await Doctor.findOne({ where: { userId: req.user.id } });
    res.json({ success: true, doctor: updatedDoctor });
  } catch (err) {
    console.error('Account update error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get specializations list
router.get('/meta/specializations', async (req, res) => {
  try {
    const specs = await Doctor.findAll({
      where: { isApproved: true },
      attributes: ['specialization'],
      group: ['specialization']
    });
    res.json({ success: true, specializations: specs.map(s => s.specialization) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
