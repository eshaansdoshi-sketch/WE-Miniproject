const EXP_RANK = { fresher: 0, junior: 1, mid: 2, senior: 3 };

/**
 * Pure logic: evaluate a candidate against a job role.
 * No AI — deterministic scoring.
 */
function evaluateCandidateForRole(candidateData, jobRole) {
  const candidateSkills = (candidateData.skills || []).map(s => s.toLowerCase().trim());
  const requiredSkills  = (jobRole.requiredSkills || []).map(s => s.toLowerCase().trim());
  const preferredSkills = (jobRole.preferredSkills || []).map(s => s.toLowerCase().trim());

  const matchedRequired = requiredSkills.filter(s => candidateSkills.includes(s));
  const missingRequired = requiredSkills.filter(s => !candidateSkills.includes(s));
  const matchedPreferred = preferredSkills.filter(s => candidateSkills.includes(s));

  const skillScore = requiredSkills.length > 0
    ? (matchedRequired.length / requiredSkills.length) * 70
    : 70;

  const bonusScore = preferredSkills.length > 0
    ? (matchedPreferred.length / preferredSkills.length) * 10
    : 0;

  const candidateExpRank = EXP_RANK[candidateData.experience_level] ?? 0;
  const requiredExpRank  = EXP_RANK[jobRole.minExperienceLevel]     ?? 0;
  const expScore = candidateExpRank >= requiredExpRank ? 20 : 0;

  const matchScore = Math.round(skillScore + bonusScore + expScore);
  const qualified  = matchScore >= (jobRole.minResumeScore || 50);

  return {
    qualified,
    matchScore,
    details: {
      matchedRequiredSkills: matchedRequired,
      missingRequiredSkills: missingRequired,
      matchedPreferredSkills: matchedPreferred,
    },
    summary: qualified
      ? `Candidate meets ${matchedRequired.length}/${requiredSkills.length} required skills with a match score of ${matchScore}/100.`
      : `Candidate is missing ${missingRequired.length} required skills: ${missingRequired.join(', ')}.`,
  };
}

module.exports = { evaluateCandidateForRole };
