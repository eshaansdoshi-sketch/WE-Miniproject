const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, notifications: notifs });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
