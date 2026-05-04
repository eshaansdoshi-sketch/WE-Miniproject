const { callAI } = require('./aiService');

/**
 * Generate personalized AI feedback for a candidate.
 */
async function generateCandidateFeedback(candidateData) {
  const { qualified, matchedSkills, missingSkills, resumeScore, weakAreas } = candidateData;

  const context = qualified
    ? `Generate encouraging feedback for a QUALIFIED candidate.
Skills matched: ${matchedSkills.join(', ') || 'N/A'}
Resume score: ${resumeScore}/100
Include: congratulations, their strengths, and next steps (interview scheduling). 2-3 sentences max.`
    : `Generate constructive feedback for a candidate who did NOT qualify.
Missing skills: ${missingSkills.join(', ') || 'none'}
Weak test areas: ${(weakAreas || []).join(', ') || 'none'}
Resume score: ${resumeScore}/100
Include: thank them, explain gaps professionally, encourage improvement. 2-3 sentences max.`;

  try {
    const content = await callAI(
      'You are an HR professional writing personalized, empathetic candidate feedback. No markdown.',
      context,
      0.5,
      30000
    );
    return content.trim();
  } catch {
    return qualified
      ? 'Congratulations! You have qualified. Our HR team will contact you shortly.'
      : `Thank you for applying. We encourage you to strengthen: ${missingSkills.join(', ')}.`;
  }
}

module.exports = { generateCandidateFeedback };
