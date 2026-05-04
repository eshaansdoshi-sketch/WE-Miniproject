const { callAI, parseJSON } = require('./aiService');

/**
 * Generate 5 MCQ questions for a skill using AI.
 * Returns array of { testId, questionText, options, correctAnswer }
 */
async function generateQuestionsForTest(skillName, testId) {
  const system = 'You are a technical assessment expert. Generate clear, practical MCQ questions. Always respond with valid JSON only, no markdown.';
  const user = `Generate exactly 5 multiple choice questions for testing practical knowledge of ${skillName}.
Each question must have exactly 4 options labeled A, B, C, D.
correct_answer must be the FULL text of one option (not just the letter).

Respond ONLY with a JSON array:
[{"question_text":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct_answer":"A. ..."}]`;

  try {
    const raw = await callAI(system, user, 0.7, 90000);
    const questions = parseJSON(raw);
    if (!Array.isArray(questions) || questions.length < 3) throw new Error('Too few questions');
    return questions.slice(0, 5).map(q => ({
      testId,
      questionText:  q.question_text,
      options:       q.options,
      correctAnswer: q.correct_answer,
    }));
  } catch (err) {
    return [];
  }
}

module.exports = { generateQuestionsForTest };
