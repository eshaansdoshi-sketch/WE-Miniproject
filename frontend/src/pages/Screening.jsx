import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, STATUS } from '../UserContext'
import { screenCandidate, getJobRoles } from '../api'

function Screening() {
    const { user, updateUser } = useUser()
    const navigate = useNavigate()

    const [roles, setRoles] = useState([])
    const [selectedRoleId, setSelectedRoleId] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [stepComplete, setStepComplete] = useState(null)

    useEffect(() => {
        if (!user || !user.candidateId) return
        loadRolesAndScreen()
    }, [user])

    const loadRolesAndScreen = async () => {
        try {
            const data = await getJobRoles()
            if (data.success && data.job_roles?.length > 0) {
                setRoles(data.job_roles)
                const firstRole = data.job_roles[0]
                setSelectedRoleId(firstRole.id)

                if (user.status === STATUS.UPLOADED) {
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
            const data = await screenCandidate(user.candidateId, roleId)
            setResult(data)

            if (data.success) {
                if (data.qualified) {
                    updateUser({ status: STATUS.SCREENED, qualified: true, roleId })
                    setStepComplete('✓ Screening Complete! You are qualified.')
                } else {
                    updateUser({ status: STATUS.REJECTED, qualified: false, feedback: data.feedback })
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
        updateUser({ status: STATUS.TESTING })
        navigate('/test')
    }

    // No user
    if (!user || !user.candidateId) {
        return (
            <div>
                <h1>Screening</h1>
                <p>Upload your resume first.</p>
                <button onClick={() => navigate('/')}>← Upload</button>
            </div>
        )
    }

    // Rejected
    if (user.status === STATUS.REJECTED) {
        return (
            <div>
                <h1>Screening Result</h1>
                <div style={{ padding: 20, background: '#ffebee', borderRadius: 8 }}>
                    <h2 style={{ color: '#c62828' }}>✗ Not Qualified</h2>
                    <p>{user.feedback}</p>
                </div>
                <button onClick={() => navigate('/')} style={{ marginTop: 20 }}>← Start Over</button>
            </div>
        )
    }

    // Already passed
    if (user.status === STATUS.SCREENED || user.status === STATUS.TESTING || user.status === STATUS.COMPLETE) {
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
            <div>
                <h1>Evaluating...</h1>
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
                    </div>
                ) : (
                    <div>
                        <p className="error">{result.error}</p>
                        <button onClick={() => runScreening(selectedRoleId)}>Retry</button>
                    </div>
                )}
            </div>
        )
    }

    // Loading roles
    return (
        <div>
            <h1>Screening</h1>
            {error ? <p className="error">{error}</p> : <p>Loading...</p>}
        </div>
    )
}

export default Screening
