import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * Status-based messages for applicant dashboard
 */
const STATUS_CONFIG = {
    applied: {
        title: '📋 Application Under Review',
        message: 'Your application has been received and is being reviewed by our team.',
        color: '#e3f2fd',
        icon: '⏳',
    },
    qualified: {
        title: '✓ Qualified for Next Step',
        message: 'Congratulations! You have passed the initial screening. Please proceed to the skill tests.',
        color: '#e8f5e9',
        icon: '✅',
        showTestButton: true,
    },
    rejected: {
        title: '❌ Application Not Selected',
        message: 'Unfortunately, your application was not selected for this position.',
        color: '#ffebee',
        icon: '❌',
        showReapplyOption: true,
    },
    approved: {
        title: '✓ Application Approved',
        message: 'Your application has been approved! Please proceed to complete your assessment.',
        color: '#e8f5e9',
        icon: '✅',
        showTestButton: true,
    },
    interview: {
        title: '🎯 Interview Stage',
        message: 'Congratulations! HR will contact you shortly to schedule an interview.',
        color: '#fff3e0',
        icon: '📞',
    },
    hired: {
        title: '🎉 Congratulations! You\'re Hired!',
        message: 'Welcome aboard! HR will reach out with your onboarding details.',
        color: '#e8f5e9',
        icon: '🎉',
    },
    // Fallback for frontend-only statuses
    uploaded: {
        title: '📄 Resume Uploaded',
        message: 'Your resume has been uploaded. Proceeding to screening.',
        color: '#e3f2fd',
        icon: '📄',
        showScreeningButton: true,
    },
    screened: {
        title: '✓ Screening Passed',
        message: 'You passed the screening. Please take the skill tests.',
        color: '#e8f5e9',
        icon: '✅',
        showTestButton: true,
    },
    testing: {
        title: '📝 Tests In Progress',
        message: 'Please complete your skill assessments.',
        color: '#fff3e0',
        icon: '📝',
        showTestButton: true,
    },
    complete: {
        title: '✓ Assessment Complete',
        message: 'Your assessments are complete. We will review and get back to you.',
        color: '#e8f5e9',
        icon: '✓',
    },
}

function ApplicantDashboard() {
    const { candidateData, resetForNewRole, STATUS } = useAuth()
    const navigate = useNavigate()

    // If no candidate data, show loading or new applicant message
    if (!candidateData) {
        return (
            <div>
                <h1>Loading...</h1>
                <p>Fetching your application status...</p>
            </div>
        )
    }

    // Use raw status from backend for display config, fall back to mapped status
    const rawStatus = candidateData.rawStatus?.toLowerCase() || 'none'
    const mappedStatus = candidateData.status

    // Get config for the status
    const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG[mappedStatus] || {
        title: 'Application Status',
        message: 'Please select a role to begin your application.',
        color: '#f5f5f5',
        icon: '📋',
    }

    // Handle navigation buttons
    const goToTests = () => navigate('/applicant/test')
    const goToScreening = () => navigate('/applicant/screen')
    const handleReapply = () => {
        resetForNewRole()
        navigate('/applicant')
    }

    return (
        <div>
            <h1>Applicant Dashboard</h1>

            {/* Role Info */}
            {candidateData.selectedRoleName && (
                <div style={{ marginBottom: 20, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
                    <strong>Applied for:</strong> {candidateData.selectedRoleName}
                    {candidateData.appliedAt && (
                        <span style={{ marginLeft: 15, color: '#666', fontSize: 12 }}>
                            Applied: {new Date(candidateData.appliedAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
            )}

            {/* Main Status Card */}
            <div style={{
                padding: 30,
                background: config.color,
                borderRadius: 12,
                marginBottom: 20,
                border: '1px solid rgba(0,0,0,0.1)',
            }}>
                <h2 style={{ margin: 0, marginBottom: 15 }}>
                    {config.icon} {config.title}
                </h2>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
                    {config.message}
                </p>

                {/* Admin Feedback */}
                {candidateData.adminNotes && (
                    <div style={{
                        marginTop: 20,
                        padding: 15,
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: 8,
                        borderLeft: '4px solid #1976d2',
                    }}>
                        <strong>Feedback from HR:</strong>
                        <p style={{ margin: '10px 0 0', fontStyle: 'italic' }}>
                            "{candidateData.adminNotes}"
                        </p>
                    </div>
                )}

                {/* Resume Score if available */}
                {candidateData.finalScore && (
                    <p style={{ marginTop: 15, color: '#666' }}>
                        <strong>Resume Score:</strong> {candidateData.finalScore}%
                    </p>
                )}
            </div>

            {/* Action Buttons based on status */}
            {config.showTestButton && (
                <button
                    onClick={goToTests}
                    style={{ background: '#4caf50', padding: '12px 30px' }}
                >
                    Take Skill Tests →
                </button>
            )}

            {config.showScreeningButton && (
                <button
                    onClick={goToScreening}
                    style={{ background: '#4caf50', padding: '12px 30px' }}
                >
                    Continue to Screening →
                </button>
            )}

            {config.showReapplyOption && (
                <div style={{ marginTop: 30, padding: 20, background: '#e3f2fd', borderRadius: 8 }}>
                    <h3>Want to try a different role?</h3>
                    <p>You can apply for a different position that better matches your skills.</p>
                    <button
                        onClick={handleReapply}
                        style={{ background: '#1976d2', marginTop: 10 }}
                    >
                        Apply for a Different Role →
                    </button>
                </div>
            )}

            {/* Final completion message */}
            {(rawStatus === 'hired' || mappedStatus === STATUS.COMPLETE) && (
                <div style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
                    <p>Thank you for completing the application process!</p>
                </div>
            )}
        </div>
    )
}

export default ApplicantDashboard
