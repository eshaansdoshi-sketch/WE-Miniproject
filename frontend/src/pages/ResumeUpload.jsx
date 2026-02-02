import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { processResume } from '../api'

function ResumeUpload() {
    const { user: authUser, candidateData, updateCandidateData, STATUS } = useAuth()
    const navigate = useNavigate()

    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

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

    // If no role selected, redirect to role selection
    if (!candidateData?.selectedRoleId) {
        return (
            <div>
                <h1>Upload Resume</h1>
                <p>You need to select a job role first.</p>
                <button onClick={() => navigate('/applicant')}>← Select Role</button>
            </div>
        )
    }

    // If user already has progress beyond upload, show continue options
    if (candidateData?.status && candidateData.status !== STATUS.NONE) {
        return (
            <div>
                <h1>Welcome Back!</h1>

                <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 8, marginBottom: 20 }}>
                    <p><strong>Applying for:</strong> {candidateData.selectedRoleName}</p>
                    {candidateData.candidateId && <p><strong>Candidate ID:</strong> <code>{candidateData.candidateId}</code></p>}
                    <p><strong>Status:</strong> {candidateData.status}</p>
                </div>

                {candidateData.status === STATUS.UPLOADED && (
                    <div>
                        <p>Resume uploaded. Continue to screening:</p>
                        <button onClick={() => navigate('/applicant/screen')} style={{ background: '#4caf50' }}>
                            Continue to Screening →
                        </button>
                    </div>
                )}

                {candidateData.status === STATUS.SCREENED && (
                    <div>
                        <p>Screening passed. Continue to tests:</p>
                        <button onClick={() => navigate('/applicant/test')} style={{ background: '#4caf50' }}>
                            Continue to Tests →
                        </button>
                    </div>
                )}

                {candidateData.status === STATUS.TESTING && (
                    <div>
                        <p>Tests in progress:</p>
                        <button onClick={() => navigate('/applicant/test')} style={{ background: '#4caf50' }}>
                            Continue Tests →
                        </button>
                    </div>
                )}

                {candidateData.status === STATUS.REJECTED && (
                    <div>
                        <p>Unfortunately, you did not qualify.</p>
                        <p style={{ color: '#666' }}>{candidateData.feedback}</p>
                    </div>
                )}

                {/* NO Start Over button - one-time assessment only */}
            </div>
        )
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        setError(null)

        // Debug logging - verify UUIDs are being sent correctly
        console.log('=== RESUME UPLOAD DEBUG ===')
        console.log('Sending role_id:', candidateData.selectedRoleId)
        console.log('Sending user_id:', authUser.id)
        console.log('Role ID type:', typeof candidateData.selectedRoleId)
        console.log('User ID type:', typeof authUser.id)
        console.log('Selected role name:', candidateData.selectedRoleName)
        console.log('User email:', authUser.email)
        console.log('===========================')

        try {
            const data = await processResume(file, authUser.id, candidateData.selectedRoleId, authUser.email)

            if (data.success && data.candidate_id) {
                // Save candidate ID and status
                updateCandidateData({
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
                <strong>Applying for:</strong> {candidateData.selectedRoleName}
                {/* NO Change button - role selection is final */}
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
