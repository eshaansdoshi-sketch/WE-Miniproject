const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getToken = () => localStorage.getItem('hirrd_token');

// ── Core fetch helpers ───────────────────────────────────────
async function apiFetch(path, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res;
  } finally { clearTimeout(timer); }
}

async function apiJSON(path, options = {}, timeoutMs = 30000) {
  const res = await apiFetch(path, options, timeoutMs);
  return res.json();
}

// ── Resume / Candidate ───────────────────────────────────────
export async function processResume(file, userId, roleId) {
  const form = new FormData();
  form.append('file', file);
  form.append('user_id', userId);
  form.append('role_id', roleId);
  const res = await apiFetch('/api/candidates/process-resume', { method: 'POST', body: form }, 60000);
  return res.json();
}

export async function screenCandidate(candidateId, roleId) {
  return apiJSON(`/api/candidates/screen/${candidateId}/${roleId}`, { method: 'POST' }, 30000);
}

export async function getCandidateTests(candidateId, roleId) {
  return apiJSON(`/api/candidates/tests/${candidateId}/${roleId}`, {}, 120000);
}

export async function submitTest(candidateId, testId, answers) {
  return apiJSON(`/api/candidates/submit-test/${candidateId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test_id: testId, answers }),
  }, 30000);
}

export async function getCandidateByUserId(userId) {
  return apiJSON(`/api/candidates/by-user/${userId}`, {}, 10000);
}

export async function getCandidateFeedback(candidateId) {
  return apiJSON(`/api/candidates/feedback/${candidateId}`, {}, 30000);
}

// ── Job Roles ────────────────────────────────────────────────
export async function getJobRoles() {
  return apiJSON('/api/job-roles', {}, 10000);
}

export async function createJobRole(roleData) {
  return apiJSON('/api/job-roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roleData),
  }, 15000);
}

// ── Tasks ────────────────────────────────────────────────────
export async function createTask(taskData) {
  return apiJSON('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
}

export async function getUserTasks(userId) {
  return apiJSON(`/api/tasks/user/${userId}`);
}

export async function getCreatedTasks(managerId) {
  return apiJSON(`/api/tasks/created/${managerId}`);
}

export async function updateTaskStatus(taskId, status) {
  return apiJSON(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// ── Schedules ────────────────────────────────────────────────
export async function createSchedule(scheduleData) {
  return apiJSON('/api/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData),
  });
}

export async function getUserSchedules(userId) {
  return apiJSON(`/api/schedules/user/${userId}`);
}

export async function getTeamSchedules(managerId) {
  return apiJSON(`/api/schedules/team/${managerId}`);
}

// ── Notifications ────────────────────────────────────────────
export async function getUserNotifications(userId) {
  return apiJSON(`/api/notifications/${userId}`);
}

// ── Profiles ─────────────────────────────────────────────────
export async function getProfiles(role = null) {
  const url = role ? `/api/profiles?role=${role}` : '/api/profiles';
  return apiJSON(url);
}

// ── Admin ────────────────────────────────────────────────────
export async function getHRCandidateSummary() {
  return apiJSON('/api/admin/candidate-summary', {}, 15000);
}

export async function getAdminCandidateDetails(candidateId) {
  return apiJSON(`/api/admin/candidates/${candidateId}`, {}, 15000);
}

export async function updateCandidateStatus(candidateId, status, notes = null) {
  return apiJSON(`/api/admin/candidates/${candidateId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  }, 15000);
}

// ── Skill Paths (new) ────────────────────────────────────────
export async function getSkillPath(candidateId) {
  return apiJSON(`/api/skill-paths/${candidateId}`, {}, 60000);
}

export async function regenerateSkillPath(candidateId) {
  return apiJSON(`/api/skill-paths/regenerate/${candidateId}`, { method: 'POST' }, 60000);
}
