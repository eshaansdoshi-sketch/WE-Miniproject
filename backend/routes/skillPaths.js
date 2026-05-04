const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const SkillPath  = require('../models/SkillPath');
const Candidate  = require('../models/Candidate');
const Evaluation = require('../models/Evaluation');
const { generateSkillPath } = require('../services/skillPathGenerator');

// GET /api/skill-paths/:candidateId
router.get('/:candidateId', auth, async (req, res) => {
  try {
    const existing = await SkillPath.findOne({ candidateId: req.params.candidateId }).sort({ generatedAt: -1 });
    if (existing) return res.json({ success: true, skillPath: existing });

    const candidate  = await Candidate.findById(req.params.candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const evaluation = await Evaluation.findOne({ candidateId: candidate._id });
    const missing    = evaluation?.missingSkills || [];
    const existing_s = candidate.skills || [];

    const roadmap  = await generateSkillPath(missing, existing_s);
    const skillPath = await SkillPath.create({ candidateId: candidate._id, missingSkills: missing, roadmap });

    res.json({ success: true, skillPath });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/skill-paths/regenerate/:candidateId
router.post('/regenerate/:candidateId', auth, async (req, res) => {
  try {
    await SkillPath.deleteMany({ candidateId: req.params.candidateId });
    const candidate  = await Candidate.findById(req.params.candidateId);
    const evaluation = await Evaluation.findOne({ candidateId: req.params.candidateId });
    const roadmap    = await generateSkillPath(evaluation?.missingSkills || [], candidate?.skills || []);
    const skillPath  = await SkillPath.create({ candidateId: req.params.candidateId, missingSkills: evaluation?.missingSkills || [], roadmap });
    res.json({ success: true, skillPath });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
