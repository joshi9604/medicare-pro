const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/search?q=name
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.findAll({
      where: {
        name: { [Op.iLike]: `%${q}%` },
        id: { [Op.ne]: req.user.id },
        isActive: true
      },
      attributes: ['id', 'name', 'email', 'role', 'avatar'],
      limit: 10
    });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;