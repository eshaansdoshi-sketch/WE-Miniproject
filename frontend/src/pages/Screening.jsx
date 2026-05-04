import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
    LayoutDashboard, FileText, Briefcase, User,
    CheckCircle, XCircle, ArrowRight, AlertCircle
} from 'lucide-react'

function Screening() {
    const { candidateData, updateCandidateData, resetForNewRole, STATUS } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState(null)

    const menuItems = [
        { label: 'My Status', path: '/applicant/dashboard', icon: LayoutDashboard },
        { label: 'Upload Resume', path: '/applicant/upload', icon: FileText },
        { label: 'Browse Jobs', path: '/applicant/jobs', icon: Briefcase },
        { label: 'My Profile', path: '/applicant/profile', icon: User },
    ]

    useEffect(() => {
        // Simulate screening with a short delay
        const timer = setTimeout(() => {
            const screeningResult = {
                success: true,
                qualified: true,
                match_score: 78,
                feedback: `Your profile demonstrates strong alignment with the role requirements. You matched 4 out of 5 required skills, and your experience level meets the minimum threshold. Your resume score of 78/100 exceeds the minimum cutoff. You are cleared to proceed to the skill assessment phase.`
            }
            setResult(screeningResult)
            updateCandidateData({ status: STATUS.SCREENED, qualified: true })
            setLoading(false)
        }, 1500)
        return () => clearTimeout(timer)
    }, [])

    const proceedToTests = () => {
        updateCandidateData({ status: STATUS.TESTING })
        navigate('/applicant/test')
    }

    const handleApplyDifferentRole = () => {
        resetForNewRole()
        navigate('/applicant')
    }

    // Completed state
    if (candidateData?.status === STATUS.COMPLETE) {
        return (
            <DashboardLayout title="Screening Result" menuItems={menuItems} sidebarTitle="Candidate Portal">
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ background: '#dcfce7', padding: '3rem', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                        <div style={{ background: '#10b981', width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ color: '#166534', marginTop: 0 }}>Application Submitted</h2>
                        <p style={{ fontSize: '1.1rem', color: '#15803d' }}>
                            Your assessments are complete! Our team will review your application and contact you soon.
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // Loading
    if (loading) {
        return (
            <DashboardLayout title="Screening Result" menuItems={menuItems} sidebarTitle="Candidate Portal">
                <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', border: '4px solid #e2e8f0',
                        borderTopColor: '#6366f1', animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    <h2 style={{ marginTop: '1.5rem', color: '#1e293b' }}>Evaluating Profile...</h2>
                    <p style={{ color: '#64748b' }}>AI is checking your qualifications against the job requirements.</p>
                </div>
            </DashboardLayout>
        )
    }

    const isQualified = result?.qualified
    const feedback = result?.feedback

    return (
        <DashboardLayout title="Screening Result" menuItems={menuItems} sidebarTitle="Candidate Portal">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    background: 'white', padding: '2.5rem', borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            background: isQualified ? '#dcfce7' : '#fee2e2',
                            width: 80, height: 80, borderRadius: '50%',
                            margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isQualified ? '#16a34a' : '#dc2626'
                        }}>
                            {isQualified ? <CheckCircle size={40} /> : <XCircle size={40} />}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '2rem', color: isQualified ? '#16a34a' : '#dc2626' }}>
                            {isQualified ? 'Screening Passed!' : 'Application Not Selected'}
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#64748b', marginTop: '0.5rem' }}>
                            {isQualified ? 'You have met the initial requirements for this role.' : 'Unfortunately, we cannot proceed with your application at this time.'}
                        </p>
                    </div>

                    {feedback && (
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#334155' }}>AI Screening Feedback:</h3>
                            <p style={{ margin: 0, lineHeight: 1.6, color: '#475569' }}>{feedback}</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        {isQualified ? (
                            <button onClick={proceedToTests} className="btn btn-primary"
                                style={{ padding: '12px 28px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                Proceed to Skill Tests <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button onClick={handleApplyDifferentRole} className="btn btn-secondary"
                                style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                Explore Other Roles <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Screening
