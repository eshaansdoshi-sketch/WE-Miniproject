import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { screenCandidate, getJobRoles } from '../api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    User,
    CheckCircle,
    XCircle,
    ArrowRight,
    AlertCircle
} from 'lucide-react'

function Screening() {
    const { candidateData, updateCandidateData, resetForNewRole, STATUS } = useAuth()
    const navigate = useNavigate()

    const [roles, setRoles] = useState([])
    const [selectedRoleId, setSelectedRoleId] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [stepComplete, setStepComplete] = useState(null)

    // Sidebar config
    const menuItems = [
        { label: 'My Status', path: '/applicant/dashboard', icon: LayoutDashboard },
        { label: 'Upload Resume', path: '/applicant/upload', icon: FileText },
        { label: 'Browse Jobs', path: '/applicant/jobs', icon: Briefcase },
        { label: 'My Profile', path: '/applicant/profile', icon: User },
    ]

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
                    setStepComplete('Screening Complete! You are qualified.')
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

    const proceedToTests = () => {
        updateCandidateData({ status: STATUS.TESTING })
        navigate('/applicant/test')
    }

    const handleApplyDifferentRole = () => {
        resetForNewRole()
        navigate('/applicant')
    }

    // Helper to render main content
    const renderContent = () => {
        // 1. Loading State
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <LoadingSpinner />
                    <h2 style={{ marginTop: '1.5rem', color: '#1e293b' }}>Evaluating Profile...</h2>
                    <p style={{ color: '#64748b' }}>AI is checking your qualifications against the job requirements.</p>
                </div>
            )
        }

        // 2. Error State
        if (error) {
            return (
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        color: '#b91c1c'
                    }}>
                        <AlertCircle size={24} />
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Screening Error</h3>
                            <p style={{ margin: 0 }}>{error}</p>
                        </div>
                    </div>
                </div>
            )
        }

        // 3. Completed Application
        if (candidateData?.status === STATUS.COMPLETE) {
            return (
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{
                        background: '#e8f5e9',
                        padding: '3rem',
                        borderRadius: '16px',
                        border: '1px solid #c8e6c9'
                    }}>
                        <div style={{
                            background: '#4caf50',
                            width: '64px', height: '64px',
                            borderRadius: '50%',
                            margin: '0 auto 1.5rem auto',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white'
                        }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ color: '#2e7d32', marginTop: 0 }}>Application Submitted</h2>
                        <p style={{ fontSize: '1.1rem', color: '#1b5e20' }}>
                            Your assessments are complete! Our team will review your application and contact you soon.
                        </p>
                    </div>
                </div>
            )
        }

        // 4. Result State (Qualified or Rejected)
        if (result || candidateData?.status === STATUS.SCREENED || candidateData?.status === STATUS.TESTING || candidateData?.status === STATUS.REJECTED) {
            const isQualified = result?.qualified || candidateData?.status === STATUS.SCREENED || candidateData?.status === STATUS.TESTING
            const feedback = result?.feedback || candidateData?.feedback

            return (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{
                        background: 'white',
                        padding: '2.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        {/* Status Header */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                background: isQualified ? '#dcfce7' : '#fee2e2',
                                width: '80px', height: '80px',
                                borderRadius: '50%',
                                margin: '0 auto 1.5rem auto',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isQualified ? '#16a34a' : '#dc2626'
                            }}>
                                {isQualified ? <CheckCircle size={40} /> : <XCircle size={40} />}
                            </div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '2rem',
                                color: isQualified ? '#16a34a' : '#dc2626'
                            }}>
                                {isQualified ? 'Screening Passed!' : 'Application Not Selected'}
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: '#64748b', marginTop: '0.5rem' }}>
                                {isQualified ? 'You have met the initial requirements for this role.' : 'Unfortunately, we cannot proceed with your application at this time.'}
                            </p>
                        </div>

                        {/* Detailed Feedback */}
                        {feedback && (
                            <div style={{
                                background: '#f8fafc',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#334155' }}>Processing Feedback:</h3>
                                <p style={{ margin: 0, lineHeight: 1.6, color: '#475569' }}>
                                    {feedback}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            {isQualified ? (
                                <button
                                    onClick={proceedToTests}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '12px 28px',
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    Proceed to Skill Tests <ArrowRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleApplyDifferentRole}
                                    className="btn btn-secondary"
                                    style={{
                                        padding: '12px 24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    Explore Other Roles <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Additional Message for Rejected Candidates */}
                    {!isQualified && (
                        <div style={{
                            marginTop: '2rem',
                            padding: '1.5rem',
                            background: '#eff6ff',
                            borderRadius: '12px',
                            border: '1px solid #dbeafe'
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>Don't be discouraged!</h4>
                            <p style={{ margin: 0, color: '#1e3a8a' }}>
                                Our hiring needs change frequently. We encourage you to check our job board regularly for new opportunities that might be a better fit for your experience.
                            </p>
                        </div>
                    )}
                </div>
            )
        }

        // Default / Initial State (should auto-loading ideally, but fallback)
        return (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <LoadingSpinner />
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Initializing screening...</p>
            </div>
        )
    }

    return (
        <DashboardLayout
            title="Screening Result"
            menuItems={menuItems}
            sidebarTitle="Candidate Portal"
        >
            {renderContent()}
        </DashboardLayout>
    )
}

export default Screening
