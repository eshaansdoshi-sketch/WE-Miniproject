const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const auth    = require('../middleware/auth');
const User    = require('../models/User');

const SECRET  = process.env.JWT_SECRET || 'hirrd_super_secret_jwt_key_2026_do_not_share';
const signTok = (id, role) => jwt.sign({ id, role }, SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'applicant' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email, password are required' });
    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Email already registered' });

    const user  = await User.create({ name, email, password, role });
    const token = signTok(user._id, user.role);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = signTok(user._id, user.role);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
