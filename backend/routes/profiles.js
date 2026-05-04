const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../models/User');

// GET /api/profiles?role=manager
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const profiles = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, profiles });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
