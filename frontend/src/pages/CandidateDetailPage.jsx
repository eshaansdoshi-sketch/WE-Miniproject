import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAdminCandidateDetails, updateCandidateStatus } from '../api'

function CandidateDetailPage() {
    const { candidateId } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [candidate, setCandidate] = useState(null)
    const [role, setRole] = useState(null)
    const [testResults, setTestResults] = useState([])
    const [totalTestScore, setTotalTestScore] = useState(null)
    const [evaluation, setEvaluation] = useState(null)

    const [notes, setNotes] = useState('')
    const [updating, setUpdating] = useState(false)
    const [updateSuccess, setUpdateSuccess] = useState(null)

    useEffect(() => {
        loadCandidateDetails()
    }, [candidateId])

    const loadCandidateDetails = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await getAdminCandidateDetails(candidateId)

            if (data.success) {
                setCandidate(data.candidate)
                setRole(data.role)
                setTestResults(data.test_results || [])
                setTotalTestScore(data.total_test_score)
                setEvaluation(data.evaluation)
                setNotes(data.candidate?.admin_notes || '')
            } else {
                setError(data.detail || data.error || 'Failed to load candidate')
            }
        } catch (err) {
            setError('Failed to load candidate: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true)
        setUpdateSuccess(null)

        try {
            const data = await updateCandidateStatus(candidateId, newStatus, notes)

            if (data.success) {
                setUpdateSuccess(`Status updated to "${newStatus}"`)
                setCandidate(prev => ({ ...prev, status: newStatus, admin_notes: notes }))
            } else {
                setError(data.detail || data.error || 'Failed to update status')
            }
        } catch (err) {
            setError('Failed to update: ' + err.message)
        } finally {
            setUpdating(false)
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            applied: '#2196f3',
            qualified: '#4caf50',
            rejected: '#f44336',
            approved: '#8bc34a',
            interview: '#ff9800',
            hired: '#9c27b0',
        }
        return colors[status] || '#666'
    }

    if (loading) {
        return (
            <div>
                <h1>Candidate Details</h1>
                <p>Loading...</p>
            </div>
        )
    }

    if (error && !candidate) {
        return (
            <div>
                <h1>Candidate Details</h1>
                <p className="error">{error}</p>
                <button onClick={() => navigate('/admin')}>← Back to Dashboard</button>
            </div>
        )
    }

    return (
        <div>
            <button onClick={() => navigate('/admin')} style={{ marginBottom: 20 }}>
                ← Back to Dashboard
            </button>

            <h1>Candidate Review</h1>

            {/* Candidate Header */}
            <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>{candidate?.email || 'Anonymous Candidate'}</h2>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                            Experience: <strong>{candidate?.experience_level || 'N/A'}</strong>
                        </p>
                        {role && (
                            <p style={{ margin: '5px 0', color: '#666' }}>
                                Applied for: <strong>{role.role_name}</strong>
                            </p>
                        )}
                    </div>
                    <div
                        style={{
                            padding: '8px 16px',
                            background: getStatusColor(candidate?.status),
                            color: '#fff',
                            borderRadius: 20,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                        }}
                    >
                        {candidate?.status || 'applied'}
                    </div>
                </div>
            </div>

            {/* Resume Summary */}
            <div style={{ marginBottom: 20 }}>
                <h3>Resume Summary</h3>
                <div style={{ padding: 15, background: '#e3f2fd', borderRadius: 8 }}>
                    <p><strong>Resume Score:</strong> {candidate?.resume_score || 0}/100</p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {candidate?.experience_summary || 'No summary available'}
                    </p>
                </div>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 20 }}>
                <h3>Extracted Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {candidate?.skills?.length > 0 ? (
                        candidate.skills.map((skill, idx) => (
                            <span
                                key={idx}
                                style={{
                                    padding: '4px 12px',
                                    background: '#e0e0e0',
                                    borderRadius: 16,
                                    fontSize: 14,
                                }}
                            >
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span style={{ color: '#666' }}>No skills extracted</span>
                    )}
                </div>
            </div>

            {/* Test Results */}
            <div style={{ marginBottom: 20 }}>
                <h3>Test Results</h3>
                {testResults.length > 0 ? (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Test</th>
                                    <th>Score</th>
                                    <th>Questions</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testResults.map((result, idx) => (
                                    <tr key={idx}>
                                        <td>{result.test_id}</td>
                                        <td><strong>{result.score}%</strong></td>
                                        <td>{result.total_questions}</td>
                                        <td>{result.submitted_at ? new Date(result.submitted_at).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalTestScore !== null && (
                            <p style={{ marginTop: 10 }}>
                                <strong>Average Test Score: {totalTestScore}%</strong>
                            </p>
                        )}
                    </>
                ) : (
                    <p style={{ color: '#666' }}>No tests taken yet</p>
                )}
            </div>

            {/* Evaluation Result */}
            {evaluation && (
                <div style={{ marginBottom: 20 }}>
                    <h3>Qualification Evaluation</h3>
                    <div style={{ padding: 15, background: evaluation.qualified ? '#e8f5e9' : '#ffebee', borderRadius: 8 }}>
                        <p>
                            <strong>Status:</strong>{' '}
                            {evaluation.qualified ? '✓ Qualified' : '✗ Not Qualified'}
                        </p>
                        {evaluation.matched_skills?.length > 0 && (
                            <p>
                                <strong>Matched Skills:</strong> {evaluation.matched_skills.join(', ')}
                            </p>
                        )}
                        {evaluation.missing_skills?.length > 0 && (
                            <p>
                                <strong>Missing Skills:</strong> {evaluation.missing_skills.join(', ')}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Notes */}
            <div style={{ marginBottom: 20 }}>
                <h3>Admin Notes</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this candidate..."
                    style={{
                        width: '100%',
                        minHeight: 100,
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        resize: 'vertical',
                    }}
                />
            </div>

            {/* Action Buttons */}
            <div style={{ marginBottom: 20 }}>
                <h3>Update Status</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={updating}
                        style={{ background: '#4caf50' }}
                    >
                        ✓ Approve
                    </button>
                    <button
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={updating}
                        style={{ background: '#f44336' }}
                    >
                        ✗ Reject
                    </button>
                    <button
                        onClick={() => handleStatusUpdate('interview')}
                        disabled={updating}
                        style={{ background: '#ff9800' }}
                    >
                        📅 Move to Interview
                    </button>
                    <button
                        onClick={() => handleStatusUpdate('hired')}
                        disabled={updating}
                        style={{ background: '#9c27b0' }}
                    >
                        🎉 Mark as Hired
                    </button>
                </div>
            </div>

            {/* Feedback Messages */}
            {error && <p className="error">{error}</p>}
            {updateSuccess && <p className="success">{updateSuccess}</p>}

            {/* Metadata */}
            <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #ddd', fontSize: 12, color: '#666' }}>
                <p>Candidate ID: {candidate?.id}</p>
                <p>Applied: {candidate?.applied_at ? new Date(candidate.applied_at).toLocaleString() : 'Unknown'}</p>
            </div>
        </div>
    )
}

export default CandidateDetailPage
