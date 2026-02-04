const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeout);
    }
}

export async function processResume(file, userId, roleId, email = null) {
    // Debug logging
    console.log('=== PROCESS RESUME DEBUG ===');
    console.log('Sending user_id:', userId);
    console.log('Sending role_id:', roleId);
    console.log('Sending email:', email);
    console.log('File:', file?.name, file?.size, 'bytes');
    console.log('============================');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('role_id', roleId);
    if (email) {
        formData.append('email', email);
    }

    const response = await fetchWithTimeout(`${API_BASE}/process-resume`, {
        method: 'POST',
        body: formData,
    }, 60000); // 60 second timeout for resume processing

    const data = await response.json();
    console.log('Process resume response:', data);
    return data;
}

// =============================================================================
// TASK & SCHEDULE API
// =============================================================================

// Tasks
export async function createTask(taskData) {
    const response = await fetchWithTimeout(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    return response.json();
}

export async function getUserTasks(userId) {
    const response = await fetchWithTimeout(`${API_BASE}/tasks/${userId}`);
    return response.json();
}

export async function getCreatedTasks(managerId) {
    const response = await fetchWithTimeout(`${API_BASE}/admin/tasks/created/${managerId}`);
    return response.json();
}

export async function updateTaskStatus(taskId, status) {
    const response = await fetchWithTimeout(`${API_BASE}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    return response.json();
}

// Schedules
export async function createSchedule(scheduleData) {
    const response = await fetchWithTimeout(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
    });
    return response.json();
}

export async function getUserSchedules(userId) {
    const response = await fetchWithTimeout(`${API_BASE}/schedules/${userId}`);
    return response.json();
}

export async function getTeamSchedules(managerId) {
    const response = await fetchWithTimeout(`${API_BASE}/schedules/team/${managerId}`);
    return response.json();
}

// Notifications
export async function getUserNotifications(userId) {
    const response = await fetchWithTimeout(`${API_BASE}/notifications/${userId}`);
    return response.json();
}

// Users & Profiles
export async function getProfiles(role = null) {
    const url = role ? `${API_BASE}/profiles?role=${role}` : `${API_BASE}/profiles`;
    const response = await fetchWithTimeout(url);
    return response.json();
}

// =============================================================================
// RESUME & CANDIDATE API (Existing)
// =============================================================================


export async function screenCandidate(candidateId, roleId) {
    const response = await fetchWithTimeout(`${API_BASE}/screen-candidate/${candidateId}/${roleId}`, {
        method: 'POST',
    }, 30000);
    return response.json();
}

export async function getCandidateTests(candidateId, roleId) {
    const response = await fetchWithTimeout(`${API_BASE}/candidate-tests/${candidateId}/${roleId}`, {}, 120000); // 120s timeout for generation
    return response.json();
}

export async function submitTest(candidateId, testId, answers) {
    const response = await fetchWithTimeout(`${API_BASE}/submit-test/${candidateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: testId, answers }),
    }, 30000);
    return response.json();
}

export async function getHRCandidateSummary() {
    const response = await fetchWithTimeout(`${API_BASE}/hr/candidate-summary`, {}, 15000);
    return response.json();
}

export async function getJobRoles() {
    const response = await fetchWithTimeout(`${API_BASE}/job-roles`, {
        headers: { 'Accept': 'application/json' }
    }, 10000);
    return response.json();
}

export async function assignTests(candidateId, roleId) {
    // Assigns tests based on job role's required_skills (role-driven)
    const response = await fetchWithTimeout(`${API_BASE}/assign-tests/${candidateId}/${roleId}`, {
        method: 'POST',
    }, 120000); // 2 minute timeout for AI test generation
    return response.json();
}

export async function createJobRole(roleData) {
    const response = await fetchWithTimeout(`${API_BASE}/job-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData),
    }, 15000);
    return response.json();
}

// =============================================================================
// ADMIN API FUNCTIONS
// =============================================================================

export async function getAdminCandidateDetails(candidateId) {
    const response = await fetchWithTimeout(`${API_BASE}/admin/candidate/${candidateId}`, {}, 15000);
    return response.json();
}

export async function updateCandidateStatus(candidateId, status, notes = null) {
    const response = await fetchWithTimeout(`${API_BASE}/admin/candidate-status/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
    }, 15000);
    return response.json();
}

// =============================================================================
// CANDIDATE SESSION API
// =============================================================================

export async function getCandidateByUserId(userId) {
    const response = await fetchWithTimeout(`${API_BASE}/candidate/by-user/${userId}`, {}, 10000);
    return response.json();
}
