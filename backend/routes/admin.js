const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/auth');
const Candidate    = require('../models/Candidate');
const Evaluation   = require('../models/Evaluation');
const TestAttempt  = require('../models/TestAttempt');
const JobRole      = require('../models/JobRole');

// GET /api/admin/candidate-summary
router.get('/candidate-summary', auth, async (req, res) => {
  try {
    const candidates  = await Candidate.find();
    const evaluations = await Evaluation.find();
    const tests       = await TestAttempt.find();

    const evalMap = {};
    evaluations.forEach(e => { evalMap[e.candidateId] = e.qualified; });

    const testMap = {};
    tests.forEach(t => {
      const cid = String(t.candidateId);
      if (t.score != null) {
        if (!testMap[cid]) testMap[cid] = [];
        testMap[cid].push(t.score);
      }
    });

    const summary = candidates.map(c => {
      const cid    = String(c._id);
      const scores = testMap[cid] || [];
      const avg    = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      const rs     = c.resumeScore || 0;
      const readiness = avg != null ? Math.round(rs * 0.4 + avg * 0.6) : rs;
      return {
        candidate_id:             cid,
        resume_score:             rs,
        qualified:                evalMap[cid] || false,
        avg_test_score:           avg,
        interview_readiness_score: readiness,
        status:                   c.status,
      };
    });

    res.json({ success: true, candidates: summary });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/candidates/:id
router.get('/candidates/:id', auth, async (req, res) => {
  try {
    const candidate  = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    const role       = candidate.roleId ? await JobRole.findById(candidate.roleId) : null;
    const tests      = await TestAttempt.find({ candidateId: candidate._id });
    const evaluation = await Evaluation.findOne({ candidateId: candidate._id });
    const scores     = tests.filter(t => t.score != null).map(t => t.score);
    const totalScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    res.json({ success: true, candidate, role, test_results: tests, total_test_score: totalScore, evaluation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/candidates/:id/status
router.patch('/candidates/:id/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = { status, updatedAt: new Date() };
    if (notes) update.adminNotes = notes;
    await Candidate.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true, message: `Updated to ${status}`, candidate_id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/candidates (all candidates with role names)
router.get('/candidates', auth, async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('roleId', 'roleName').populate('userId', 'name email').sort({ appliedAt: -1 });
    res.json({ success: true, candidates });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
