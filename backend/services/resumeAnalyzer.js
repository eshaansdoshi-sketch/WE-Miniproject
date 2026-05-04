const { callAI, parseJSON } = require('./aiService');

/**
 * Use AI to extract structured info from resume text.
 * Returns: { skills, experience_level, experience_summary }
 */
async function analyzeResumeWithAI(resumeText) {
  const system = 'You extract job-relevant structured data for skill-based hiring. Always respond with valid JSON only, no markdown.';
  const user = `Extract structured JSON with exactly these keys:
- skills: array of technical skills
- experience_level: one of "fresher" | "junior" | "mid" | "senior"
- experience_summary: 2-3 sentence technical capability summary

Resume:
${resumeText.slice(0, 6000)}`;

  try {
    const raw = await callAI(system, user, 0.2);
    return parseJSON(raw);
  } catch (err) {
    return { error: true, message: err.message, skills: [], experience_level: 'fresher', experience_summary: '' };
  }
}

module.exports = { analyzeResumeWithAI };
