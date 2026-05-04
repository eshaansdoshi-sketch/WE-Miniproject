const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const JobRole = require('../models/JobRole');

// GET /api/job-roles
router.get('/', async (req, res) => {
  try {
    const roles = await JobRole.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: roles.length, job_roles: roles });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/job-roles/:id
router.get('/:id', async (req, res) => {
  try {
    const role = await JobRole.findById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, job_role: role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/job-roles
router.post('/', auth, async (req, res) => {
  try {
    const { roleName, description, requiredSkills, preferredSkills, minExperienceLevel, minResumeScore } = req.body;
    if (!roleName) return res.status(400).json({ error: 'roleName is required' });
    const role = await JobRole.create({
      roleName, description,
      requiredSkills:     requiredSkills  || [],
      preferredSkills:    preferredSkills || [],
      minExperienceLevel: minExperienceLevel || 'junior',
      minResumeScore:     minResumeScore || 50,
      createdBy:          req.user.id,
    });
    res.status(201).json({ success: true, job_role_id: role._id, created: role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/job-roles/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const role = await JobRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, job_role: role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/job-roles/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await JobRole.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
