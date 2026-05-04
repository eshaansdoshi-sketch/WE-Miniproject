const { callAI, parseJSON } = require('./aiService');

/**
 * Generate a full AI learning roadmap for missing skills.
 * @param {string[]} missingSkills
 * @param {string[]} existingSkills
 * @returns {Promise<Array>} roadmap array
 */
async function generateSkillPath(missingSkills, existingSkills = []) {
  if (!missingSkills.length) return [];

  const system = 'You are a career development expert. Generate structured learning roadmaps. Always respond with valid JSON only, no markdown.';
  const user = `A candidate has these existing skills: ${existingSkills.join(', ') || 'none'}.
They are missing these required skills: ${missingSkills.join(', ')}.

Generate a structured learning roadmap as a JSON array. Each item:
{
  "skill": "skill name",
  "priority": "Critical" | "Important" | "Nice-to-have",
  "topics": ["topic1", "topic2", "topic3"],
  "resources": ["free resource 1", "free resource 2"],
  "estimatedWeeks": number
}

Respond ONLY with the JSON array.`;

  try {
    const raw = await callAI(system, user, 0.4, 60000);
    const roadmap = parseJSON(raw);
    return Array.isArray(roadmap) ? roadmap : [];
  } catch {
    return missingSkills.map(skill => ({
      skill,
      priority: 'Critical',
      topics: [`${skill} fundamentals`, `${skill} advanced concepts`, `${skill} projects`],
      resources: [`${skill} documentation`, `freeCodeCamp ${skill} course`],
      estimatedWeeks: 4,
    }));
  }
}

module.exports = { generateSkillPath };
