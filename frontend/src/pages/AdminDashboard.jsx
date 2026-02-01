import { useState, useEffect } from 'react'
import { getJobRoles, createJobRole, getHRCandidateSummary } from '../api'

function AdminDashboard() {
    const [roles, setRoles] = useState([])
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        role_name: '',
        required_skills: '',
        preferred_skills: '',
        min_experience_level: 'junior',
        min_resume_score: 50,
    })

    useEffect(() => {
        loadRoles()
        loadCandidates()
    }, [])

    const loadRoles = async () => {
        try {
            const data = await getJobRoles()
            if (data.success) {
                setRoles(data.job_roles || [])
            }
        } catch (err) {
            console.error('Failed to load roles:', err)
        }
    }

    const loadCandidates = async () => {
        try {
            const data = await getHRCandidateSummary()
            if (data.success) {
                setCandidates(data.candidates || [])
            }
        } catch (err) {
            console.error('Failed to load candidates:', err)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        // Parse skills from comma-separated string
        const requiredSkills = formData.required_skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s)

        const preferredSkills = formData.preferred_skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s)

        const payload = {
            role_name: formData.role_name,
            required_skills: requiredSkills,
            preferred_skills: preferredSkills,
            min_experience_level: formData.min_experience_level,
            min_resume_score: parseInt(formData.min_resume_score),
        }

        try {
            const data = await createJobRole(payload)

            if (data.success) {
                setSuccess('Job role created successfully!')
                setFormData({
                    role_name: '',
                    required_skills: '',
                    preferred_skills: '',
                    min_experience_level: 'junior',
                    min_resume_score: 50,
                })
                loadRoles()
            } else {
                setError(data.error || data.message || 'Failed to create role')
            }
        } catch (err) {
            setError('Failed to create role: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Admin Dashboard</h1>

            {/* Create Job Role Form */}
            <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 8, marginBottom: 30 }}>
                <h2>Create Job Role</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 15 }}>
                        <label><strong>Role Name:</strong></label><br />
                        <input
                            type="text"
                            name="role_name"
                            value={formData.role_name}
                            onChange={handleInputChange}
                            placeholder="e.g., Backend Developer"
                            required
                            style={{ width: '100%', maxWidth: 400, padding: 10 }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label><strong>Required Skills:</strong> (comma-separated)</label><br />
                        <input
                            type="text"
                            name="required_skills"
                            value={formData.required_skills}
                            onChange={handleInputChange}
                            placeholder="e.g., Python, FastAPI, PostgreSQL"
                            required
                            style={{ width: '100%', maxWidth: 400, padding: 10 }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label><strong>Preferred Skills:</strong> (comma-separated)</label><br />
                        <input
                            type="text"
                            name="preferred_skills"
                            value={formData.preferred_skills}
                            onChange={handleInputChange}
                            placeholder="e.g., Docker, AWS, Redis"
                            style={{ width: '100%', maxWidth: 400, padding: 10 }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label><strong>Minimum Experience Level:</strong></label><br />
                        <select
                            name="min_experience_level"
                            value={formData.min_experience_level}
                            onChange={handleInputChange}
                            style={{ padding: 10, width: 200 }}
                        >
                            <option value="junior">Junior</option>
                            <option value="mid">Mid-level</option>
                            <option value="senior">Senior</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label><strong>Minimum Resume Score:</strong></label><br />
                        <input
                            type="number"
                            name="min_resume_score"
                            value={formData.min_resume_score}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            style={{ padding: 10, width: 100 }}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{ padding: '10px 30px' }}>
                        {loading ? 'Creating...' : 'Create Role'}
                    </button>
                </form>

                {error && <p className="error" style={{ marginTop: 15 }}>{error}</p>}
                {success && <p className="success" style={{ marginTop: 15 }}>{success}</p>}
            </div>

            {/* Existing Roles */}
            <div style={{ marginBottom: 30 }}>
                <h2>Existing Job Roles</h2>
                {roles.length === 0 ? (
                    <p style={{ color: '#666' }}>No job roles created yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Level</th>
                                <th>Required Skills</th>
                                <th>Min Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id}>
                                    <td><strong>{role.role_name}</strong></td>
                                    <td>{role.role_level || role.min_experience_level}</td>
                                    <td style={{ fontSize: 12 }}>
                                        {Array.isArray(role.required_skills)
                                            ? role.required_skills.join(', ')
                                            : JSON.stringify(role.required_skills)}
                                    </td>
                                    <td>{role.min_resume_score || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Candidates Summary */}
            <div>
                <h2>Candidates Overview</h2>
                <button onClick={loadCandidates} style={{ marginBottom: 15 }}>Refresh</button>

                {candidates.length === 0 ? (
                    <p style={{ color: '#666' }}>No candidates yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Resume Score</th>
                                <th>Qualified</th>
                                <th>Test Score</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map(c => (
                                <tr key={c.candidate_id}>
                                    <td style={{ fontSize: 11 }}>{c.candidate_id?.slice(0, 8)}...</td>
                                    <td>{c.resume_score}</td>
                                    <td>{c.qualified ? '✓' : '✗'}</td>
                                    <td>{c.avg_test_score ?? '-'}</td>
                                    <td className={`status-${c.status?.toLowerCase()}`}>
                                        <strong>{c.status}</strong>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
