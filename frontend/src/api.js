const API_BASE = 'http://localhost:8000';

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

export async function processResume(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithTimeout(`${API_BASE}/process-resume`, {
        method: 'POST',
        body: formData,
    }, 60000); // 60 second timeout for resume processing
    return response.json();
}

export async function screenCandidate(candidateId, roleId) {
    const response = await fetchWithTimeout(`${API_BASE}/screen-candidate/${candidateId}/${roleId}`, {
        method: 'POST',
    }, 30000);
    return response.json();
}

export async function getCandidateTests(candidateId, roleId) {
    const response = await fetchWithTimeout(`${API_BASE}/candidate-tests/${candidateId}/${roleId}`, {}, 15000);
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
    const response = await fetchWithTimeout(`${API_BASE}/job-roles`, {}, 10000);
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
