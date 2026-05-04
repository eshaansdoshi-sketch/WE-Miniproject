const express   = require('express');
const router    = express.Router();
const auth      = require('../middleware/auth');
const Schedule  = require('../models/Schedule');
const Notification = require('../models/Notification');

// POST /api/schedules
router.post('/', auth, async (req, res) => {
  try {
    const { employee_id, shift_date, start_time, end_time, work_type, notes } = req.body;
    const schedule = await Schedule.create({
      employeeId: employee_id, managerId: req.user.id,
      shiftDate: new Date(shift_date), startTime: start_time, endTime: end_time,
      workType: work_type || 'Office', notes,
    });

    await Notification.create({ userId: employee_id, message: `New Shift: ${shift_date} (${work_type})`, type: 'schedule_created' });
    const io = req.app.get('io');
    if (io) io.to(String(employee_id)).emit('notification', { type: 'schedule_created', schedule });

    res.status(201).json({ success: true, schedule });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/schedules/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find({ employeeId: req.params.userId }).sort({ shiftDate: 1 });
    res.json({ success: true, schedules });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/schedules/team/:managerId
router.get('/team/:managerId', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find({ managerId: req.params.managerId })
      .populate('employeeId', 'name email').sort({ shiftDate: 1 });
    res.json({ success: true, schedules });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
