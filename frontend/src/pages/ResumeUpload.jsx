import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, STATUS } from '../UserContext'
import { processResume } from '../api'

function ResumeUpload() {
    const { user, updateUser, resetUser } = useUser()
    const navigate = useNavigate()

    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // If no role selected, redirect to role selection
    if (!user?.selectedRoleId) {
        return (
            <div>
                <h1>Upload Resume</h1>
                <p>You need to select a job role first.</p>
                <button onClick={() => navigate('/applicant')}>← Select Role</button>
            </div>
        )
    }

    // If user already has progress beyond upload, show continue options
    if (user?.status && user.status !== STATUS.NONE) {
        return (
            <div>
                <h1>Welcome Back!</h1>

                <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 8, marginBottom: 20 }}>
                    <p><strong>Applying for:</strong> {user.selectedRoleName}</p>
                    {user.candidateId && <p><strong>Candidate ID:</strong> <code>{user.candidateId}</code></p>}
                    <p><strong>Status:</strong> {user.status}</p>
                </div>

                {user.status === STATUS.UPLOADED && (
                    <div>
                        <p>Resume uploaded. Continue to screening:</p>
                        <button onClick={() => navigate('/applicant/screen')} style={{ background: '#4caf50' }}>
                            Continue to Screening →
                        </button>
                    </div>
                )}

                {user.status === STATUS.SCREENED && (
                    <div>
                        <p>Screening passed. Continue to tests:</p>
                        <button onClick={() => navigate('/applicant/test')} style={{ background: '#4caf50' }}>
                            Continue to Tests →
                        </button>
                    </div>
                )}

                {user.status === STATUS.TESTING && (
                    <div>
                        <p>Tests in progress:</p>
                        <button onClick={() => navigate('/applicant/test')} style={{ background: '#4caf50' }}>
                            Continue Tests →
                        </button>
                    </div>
                )}

                {user.status === STATUS.COMPLETE && (
                    <div>
                        <p className="success">✓ All assessments completed!</p>
                    </div>
                )}

                {user.status === STATUS.REJECTED && (
                    <div>
                        <p>Unfortunately, you did not qualify.</p>
                        <p style={{ color: '#666' }}>{user.feedback}</p>
                    </div>
                )}

                <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #ddd' }}>
                    <p style={{ fontSize: 12, color: '#666' }}>Want to start fresh?</p>
                    <button onClick={resetUser} style={{ background: '#f44336' }}>Start Over</button>
                </div>
            </div>
        )
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        setError(null)

        try {
            const data = await processResume(file)

            if (data.success && data.candidate_id) {
                // Save candidate ID and status, keep role info
                updateUser({
                    candidateId: data.candidate_id,
                    status: STATUS.UPLOADED,
                })
                navigate('/applicant/screen')
            } else {
                setError(data.error || 'Failed to process resume')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Upload Resume</h1>

            <div style={{ padding: 15, background: '#e8f5e9', borderRadius: 8, marginBottom: 20 }}>
                <strong>Applying for:</strong> {user.selectedRoleName}
                <button
                    onClick={() => navigate('/applicant')}
                    style={{ marginLeft: 15, padding: '4px 10px', fontSize: 12, background: '#666' }}
                >
                    Change
                </button>
            </div>

            <div style={{ padding: 20, background: '#f9f9f9', borderRadius: 8 }}>
                <h3>Upload Your Resume (PDF)</h3>

                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <div style={{ marginTop: 15 }}>
                    <button onClick={handleUpload} disabled={!file || loading}>
                        {loading ? 'Processing...' : 'Upload & Continue'}
                    </button>
                </div>

                {loading && <p style={{ color: '#666' }}>Analyzing resume with AI...</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    )
}

export default ResumeUpload
