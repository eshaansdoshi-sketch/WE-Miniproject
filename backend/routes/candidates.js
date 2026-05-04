const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const auth     = require('../middleware/auth');
const Candidate   = require('../models/Candidate');
const JobRole     = require('../models/JobRole');
const Evaluation  = require('../models/Evaluation');
const TestAttempt = require('../models/TestAttempt');
const { extractTextFromPDF }       = require('../services/resumeParser');
const { analyzeResumeWithAI }      = require('../services/resumeAnalyzer');
const { evaluateCandidateForRole } = require('../services/qualificationEngine');
const { generateQuestionsForTest } = require('../services/testGenerator');
const { generateCandidateFeedback }= require('../services/feedbackGenerator');

// File upload
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── POST /api/candidates/process-resume ──────────────────────
router.post('/process-resume', auth, upload.single('file'), async (req, res) => {
  try {
    const { role_id } = req.body;
    const userId = req.user.id;
    if (!req.file || !role_id) return res.status(400).json({ error: 'file and role_id required' });

    const jobRole = await JobRole.findById(role_id);
    if (!jobRole) return res.status(404).json({ error: 'Job role not found' });

    const buffer     = fs.readFileSync(req.file.path);
    const text       = await extractTextFromPDF(buffer);
    if (!text || text.trim().length < 50)
      return res.status(400).json({ error: 'Could not extract text. Use a text-accessible PDF.' });

    const aiData     = await analyzeResumeWithAI(text);
    if (aiData.error) return res.status(500).json({ error: 'AI analysis failed: ' + aiData.message });

    const evalResult = evaluateCandidateForRole(aiData, jobRole);

    const candidate = await Candidate.create({
      userId,
      roleId:            role_id,
      resumeFilePath:    req.file.path,
      skills:            aiData.skills || [],
      experienceLevel:   aiData.experience_level || 'fresher',
      experienceSummary: aiData.experience_summary || '',
      resumeScore:       evalResult.matchScore,
      status:            evalResult.qualified ? 'qualified' : 'rejected',
    });

    await Evaluation.create({
      candidateId:   candidate._id,
      roleId:        role_id,
      qualified:     evalResult.qualified,
      matchScore:    evalResult.matchScore,
      matchedSkills: evalResult.details.matchedRequiredSkills,
      missingSkills: evalResult.details.missingRequiredSkills,
      feedback:      evalResult.summary,
    });

    res.json({
      success:      true,
      candidate_id: candidate._id,
      status:       candidate.status,
      resume_score: evalResult.matchScore,
      qualified:    evalResult.qualified,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/candidates/by-user/:userId ─────────────────────
router.get('/by-user/:userId', auth, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.params.userId });
    if (!candidate) return res.json(null);
    const role = candidate.roleId ? await JobRole.findById(candidate.roleId) : null;
    res.json({ ...candidate.toObject(), id: candidate._id, role_name: role?.roleName || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/candidates/screen/:candidateId/:roleId ────────
router.post('/screen/:candidateId/:roleId', auth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    const jobRole   = await JobRole.findById(req.params.roleId);
    if (!candidate || !jobRole) return res.status(404).json({ error: 'Not found' });

    const evalResult = evaluateCandidateForRole(
      { skills: candidate.skills, experience_level: candidate.experienceLevel, resume_score: candidate.resumeScore },
      jobRole
    );

    await Candidate.findByIdAndUpdate(candidate._id, {
      status: evalResult.qualified ? 'qualified' : 'rejected',
      resumeScore: evalResult.matchScore,
    });
    await Evaluation.create({
      candidateId:   candidate._id, roleId: req.params.roleId,
      qualified:     evalResult.qualified, matchScore: evalResult.matchScore,
      matchedSkills: evalResult.details.matchedRequiredSkills,
      missingSkills: evalResult.details.missingRequiredSkills,
      feedback:      evalResult.summary,
    });

    res.json({ success: true, qualified: evalResult.qualified, match_score: evalResult.matchScore, feedback: evalResult.summary });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/candidates/tests/:candidateId/:roleId ──────────
router.get('/tests/:candidateId/:roleId', auth, async (req, res) => {
  try {
    const existing = await TestAttempt.find({ candidateId: req.params.candidateId, status: 'assigned' });
    const valid    = existing.filter(t => t.questions?.length > 0);
    if (valid.length) return res.json({ success: true, tests: valid });

    const jobRole = await JobRole.findById(req.params.roleId);
    if (!jobRole) return res.status(404).json({ error: 'Job role not found' });

    const skills  = (jobRole.requiredSkills || []).slice(0, 3);
    const results = await Promise.all(skills.map(async skill => {
      const testId    = `${skill.toLowerCase().replace(/\s+/g, '_')}_v1`;
      const questions = await generateQuestionsForTest(skill, testId);
      if (!questions.length) return null;
      return TestAttempt.create({ candidateId: req.params.candidateId, testId, questions, status: 'assigned' });
    }));

    const tests = results.filter(Boolean);
    res.json({ success: true, tests });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/candidates/submit-test/:candidateId ───────────
router.post('/submit-test/:candidateId', auth, async (req, res) => {
  try {
    const { test_id, answers } = req.body;
    const attempt = await TestAttempt.findOne({ candidateId: req.params.candidateId, testId: test_id });
    if (!attempt) return res.status(404).json({ error: 'Test not found' });

    let correct = 0;
    attempt.questions.forEach(q => {
      const given = answers[q.testId + '_' + attempt.questions.indexOf(q)] || answers[q.questionText];
      if (given === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / attempt.questions.length) * 100);
    await TestAttempt.findByIdAndUpdate(attempt._id, { answers, score, status: 'submitted', submittedAt: new Date() });

    res.json({ success: true, score, total: attempt.questions.length, correct });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/candidates/feedback/:candidateId ───────────────
router.get('/feedback/:candidateId', auth, async (req, res) => {
  try {
    const candidate  = await Candidate.findById(req.params.candidateId);
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    const evaluation = await Evaluation.findOne({ candidateId: candidate._id });
    const tests      = await TestAttempt.find({ candidateId: candidate._id, status: 'submitted' });
    const weakAreas  = tests.filter(t => (t.score || 0) < 60).map(t => t.testId?.replace('_v1', '').replace(/_/g, ' '));

    const feedback = await generateCandidateFeedback({
      qualified:     evaluation?.qualified || false,
      matchedSkills: evaluation?.matchedSkills || [],
      missingSkills: evaluation?.missingSkills || [],
      resumeScore:   candidate.resumeScore,
      weakAreas,
    });

    res.json({ success: true, status: candidate.status, feedback_message: feedback });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
