import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { screenCandidate, getJobRoles } from '../api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function Screening() {
    const { candidateData, updateCandidateData, resetForNewRole, STATUS } = useAuth()
    const navigate = useNavigate()

    const [roles, setRoles] = useState([])
    const [selectedRoleId, setSelectedRoleId] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [stepComplete, setStepComplete] = useState(null)

    useEffect(() => {
        if (!candidateData || !candidateData.candidateId) return
        loadRolesAndScreen()
    }, [candidateData])

    const loadRolesAndScreen = async () => {
        try {
            const data = await getJobRoles()
            if (data.success && data.job_roles?.length > 0) {
                setRoles(data.job_roles)
                const firstRole = data.job_roles[0]
                setSelectedRoleId(firstRole.id)

                if (candidateData.status === STATUS.UPLOADED) {
                    await runScreening(firstRole.id)
                }
            } else {
                setError('No job roles available.')
            }
        } catch (err) {
            setError('Failed to load roles: ' + err.message)
        }
    }

    const runScreening = async (roleId) => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const data = await screenCandidate(candidateData.candidateId, roleId)
            setResult(data)

            if (data.success) {
                if (data.qualified) {
                    updateCandidateData({ status: STATUS.SCREENED, qualified: true, roleId })
                    setStepComplete('✓ Screening Complete! You are qualified.')
                } else {
                    updateCandidateData({ status: STATUS.REJECTED, qualified: false, feedback: data.feedback })
                }
            }
        } catch (err) {
            setError('Screening failed: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    // No tests assignment here - just navigate. Tests page handles it.
    const proceedToTests = () => {
        updateCandidateData({ status: STATUS.TESTING })
        navigate('/applicant/test')
    }

    // Handle apply for different role (only for rejected candidates)
    const handleApplyDifferentRole = () => {
        resetForNewRole()
        navigate('/applicant')
    }

    // If completed, show completion message (no navigation allowed)
    if (candidateData?.status === STATUS.COMPLETE) {
        return (
            <div>
                <h1>Application Submitted</h1>
                <div style={{ padding: 20, background: '#e8f5e9', borderRadius: 8 }}>
                    <p className="success">✓ Your assessments are complete!</p>
                    <p>Our team will review your application and contact you soon.</p>
                </div>
            </div>
        )
    }

    // No user
    if (!candidateData || !candidateData.candidateId) {
        return (
            <div>
                <h1>Screening</h1>
                <p>Please complete the previous steps first.</p>
            </div>
        )
    }

    // Rejected - show option to apply for different role
    if (candidateData.status === STATUS.REJECTED) {
        return (
            <div>
                <h1>Screening Result</h1>
                <div style={{ padding: 20, background: '#ffebee', borderRadius: 8 }}>
                    <h2 style={{ color: '#c62828' }}>✗ Not Qualified</h2>
                    <p>{candidateData.feedback}</p>
                </div>

                {/* Option to apply for a different role */}
                <div style={{ marginTop: 30, padding: 20, background: '#e3f2fd', borderRadius: 8 }}>
                    <h3>Want to try a different role?</h3>
                    <p>You can apply for a different position that better matches your skills.</p>
                    <button
                        onClick={handleApplyDifferentRole}
                        style={{ background: '#1976d2', marginTop: 10 }}
                    >
                        Apply for a Different Role →
                    </button>
                </div>
            </div>
        )
    }

    // Already passed
    if (candidateData.status === STATUS.SCREENED || candidateData.status === STATUS.TESTING) {
        return (
            <div>
                <h1>✓ Screening Passed!</h1>

                {stepComplete && (
                    <div style={{ padding: 15, background: '#c8e6c9', borderRadius: 8, marginBottom: 20 }}>
                        {stepComplete}
                    </div>
                )}

                <div style={{ padding: 20, background: '#e8f5e9', borderRadius: 8 }}>
                    <p>You have passed screening!</p>
                    <button onClick={proceedToTests} style={{ background: '#4caf50' }}>
                        Proceed to Tests →
                    </button>
                </div>

                {error && <p className="error" style={{ marginTop: 15 }}>{error}</p>}
            </div>
        )
    }

    // Loading
    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                <LoadingSpinner />
                <h2 style={{ marginTop: 20 }}>Evaluating...</h2>
                <p>🔄 Checking your qualifications...</p>
            </div>
        )
    }

    // Show result
    if (result) {
        return (
            <div>
                <h1>Screening Result</h1>

                {stepComplete && (
                    <div style={{ padding: 15, background: '#c8e6c9', borderRadius: 8, marginBottom: 20 }}>
                        {stepComplete}
                    </div>
                )}

                {result.success ? (
                    <div style={{ padding: 20, background: result.qualified ? '#e8f5e9' : '#ffebee', borderRadius: 8 }}>
                        <h2 style={{ color: result.qualified ? 'green' : '#c62828', margin: 0 }}>
                            {result.qualified ? '✓ Qualified!' : '✗ Not Qualified'}
                        </h2>

                        <p style={{ marginTop: 15 }}>{result.feedback}</p>

                        {result.qualified && (
                            <div style={{ marginTop: 20 }}>
                                <h3>Next: Skill Tests</h3>
                                <button onClick={proceedToTests} style={{ background: '#4caf50', padding: '12px 30px' }}>
                                    Take Tests →
                                </button>
                            </div>
                        )}

                        {!result.qualified && (
                            <div style={{ marginTop: 30, padding: 20, background: '#e3f2fd', borderRadius: 8 }}>
                                <h3>Want to try a different role?</h3>
                                <p>You can apply for a different position that better matches your skills.</p>
                                <button
                                    onClick={handleApplyDifferentRole}
                                    style={{ background: '#1976d2', marginTop: 10 }}
                                >
                                    Apply for a Different Role →
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <p className="error">{result.error}</p>
                    </div>
                )}
            </div>
        )
    }

    // Loading roles
    return (
        <div>
            <h1>Screening</h1>
            {error ? <p className="error">{error}</p> : (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <LoadingSpinner />
                    <p>Loading roles...</p>
                </div>
            )}
        </div>
    )
}

export default Screening
