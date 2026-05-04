const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const Task     = require('../models/Task');
const Notification = require('../models/Notification');

// POST /api/tasks
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, assigned_to, deadline } = req.body;
    if (!title || !assigned_to) return res.status(400).json({ error: 'title and assigned_to required' });

    const task = await Task.create({
      title, description, priority: priority || 'Medium',
      assignedBy: req.user.id, assignedTo: assigned_to,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    // Notification + WebSocket
    await Notification.create({ userId: assigned_to, message: `New Task: ${title}`, type: 'task_assigned' });
    const io = req.app.get('io');
    if (io) io.to(String(assigned_to)).emit('notification', { type: 'task_assigned', message: `New Task: ${title}`, task });

    res.status(201).json({ success: true, task });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/tasks/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/tasks/created/:managerId
router.get('/created/:managerId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedBy: req.params.managerId }).populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/tasks/:taskId/status
router.patch('/:taskId/status', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskId, { status: req.body.status }, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
