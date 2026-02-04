import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    ArrowRight
} from 'lucide-react'

/**
 * Status-based messages for applicant dashboard
 */
const STATUS_CONFIG = {
    applied: {
        title: 'Application Under Review',
        message: 'Your application has been received and is being reviewed by our team.',
        color: '#3b82f6', // blue-500
        bgColor: '#eff6ff', // blue-50
        icon: Clock,
    },
    qualified: {
        title: 'Qualified for Next Step',
        message: 'Congratulations! You have passed the initial screening. Please proceed to the skill tests.',
        color: '#10b981', // green-500
        bgColor: '#ecfdf5', // green-50
        icon: CheckCircle,
        showTestButton: true,
    },
    rejected: {
        title: 'Application Not Selected',
        message: 'Unfortunately, your application was not selected for this position.',
        color: '#ef4444', // red-500
        bgColor: '#fef2f2', // red-50
        icon: XCircle,
        showReapplyOption: true,
    },
    approved: {
        title: 'Application Approved',
        message: 'Your application has been approved! Please proceed to complete your assessment.',
        color: '#10b981', // green-500
        bgColor: '#ecfdf5', // green-50
        icon: CheckCircle,
        showTestButton: true,
    },
    interview: {
        title: 'Interview Stage',
        message: 'Congratulations! HR will contact you shortly to schedule an interview.',
        color: '#f59e0b', // amber-500
        bgColor: '#fffbeb', // amber-50
        icon: User,
    },
    hired: {
        title: 'Congratulations! You\'re Hired!',
        message: 'Welcome aboard! HR will reach out with your onboarding details.',
        color: '#8b5cf6', // violet-500
        bgColor: '#f5f3ff', // violet-50
        icon: Award,
    },
    // Fallback for frontend-only statuses
    uploaded: {
        title: 'Resume Uploaded',
        message: 'Your resume has been uploaded. Proceeding to screening.',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        icon: FileText,
        showScreeningButton: true,
    },
    screened: {
        title: 'Screening Passed',
        message: 'You passed the screening. Please take the skill tests.',
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: CheckCircle,
        showTestButton: true,
    },
    testing: {
        title: 'Tests In Progress',
        message: 'Please complete your skill assessments.',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: FileText,
        showTestButton: true,
    },
    complete: {
        title: 'Assessment Complete',
        message: 'Your assessments are complete. We will review and get back to you.',
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: CheckCircle,
    },
}

function ApplicantDashboard() {
    const { candidateData, resetForNewRole, STATUS } = useAuth()
    const navigate = useNavigate()

    const menuItems = [
        { label: 'My Status', path: '/applicant/dashboard', icon: LayoutDashboard },
        { label: 'Upload Resume', path: '/applicant/upload', icon: FileText },
        { label: 'Browse Jobs', path: '/applicant/jobs', icon: Briefcase }, // Placeholder path
        { label: 'My Profile', path: '/applicant/profile', icon: User },    // Placeholder path
    ]

    // If no candidate data, show loading
    if (!candidateData) {
        return (
            <DashboardLayout title="My Application" menuItems={menuItems} sidebarTitle="Candidate Portal">
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    <h2>Loading...</h2>
                    <p>Fetching your application status...</p>
                </div>
            </DashboardLayout>
        )
    }

    // Use raw status from backend for display config, fall back to mapped status
    const rawStatus = candidateData.rawStatus?.toLowerCase() || 'none'
    const mappedStatus = candidateData.status

    // Get config for the status
    const config = STATUS_CONFIG[rawStatus] || STATUS_CONFIG[mappedStatus] || {
        title: 'Application Status',
        message: 'Please select a role to begin your application.',
        color: '#64748b',
        bgColor: '#f8fafc',
        icon: Briefcase,
    }

    const StatusIcon = config.icon

    // Handle navigation buttons
    const goToTests = () => navigate('/applicant/test')
    const goToScreening = () => navigate('/applicant/screen')
    const handleReapply = () => {
        resetForNewRole()
        navigate('/applicant')
    }

    return (
        <DashboardLayout
            title="Application Status"
            subtitle="Track your hiring progress in real-time."
            menuItems={menuItems}
            sidebarTitle="Candidate Portal"
        >
            <div className="dashboard-content" style={{ maxWidth: '800px' }}>

                {/* Role Info Card */}
                {candidateData.selectedRoleName && (
                    <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            padding: '12px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: 'white'
                        }}>
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{candidateData.selectedRoleName}</h3>
                            {candidateData.appliedAt && (
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                    Applied on {new Date(candidateData.appliedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Status Card */}
                <div className="card" style={{
                    borderLeft: `5px solid ${config.color}`,
                    background: 'white',
                    padding: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{
                            padding: '16px', borderRadius: '50%',
                            background: config.bgColor,
                            color: config.color,
                            flexShrink: 0
                        }}>
                            <StatusIcon size={32} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e293b' }}>{config.title}</h2>
                            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.6, color: '#475569' }}>
                                {config.message}
                            </p>

                            {/* Resume Score if available */}
                            {candidateData.finalScore && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}>
                                    <Award size={16} />
                                    Resume Match: <span style={{ color: '#0f172a' }}>{candidateData.finalScore}%</span>
                                </div>
                            )}

                            {/* Admin Feedback */}
                            {candidateData.adminNotes && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1.25rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <strong style={{ display: 'block', color: '#334155', marginBottom: '0.5rem' }}>Feedback from Booking Team:</strong>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: '#64748b' }}>
                                        "{candidateData.adminNotes}"
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {config.showTestButton && (
                                    <button
                                        onClick={goToTests}
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        Take Skill Tests <ArrowRight size={18} />
                                    </button>
                                )}

                                {config.showScreeningButton && (
                                    <button
                                        onClick={goToScreening}
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        Continue to Screening <ArrowRight size={18} />
                                    </button>
                                )}

                                {config.showReapplyOption && (
                                    <button
                                        onClick={handleReapply}
                                        className="btn btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        Apply for a Different Role <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Instructions (Optional) */}
                {config.showReapplyOption && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '1.1rem' }}>Looking for other opportunities?</h3>
                        <p style={{ margin: 0, color: '#1e3a8a' }}>
                            We verify candidates for multiple roles. Feel free to browse our other openings or update your resume for a better match.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ApplicantDashboard
