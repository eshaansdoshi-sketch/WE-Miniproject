import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { processResume } from '../api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    User,
    UploadCloud,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    Clock,
    XCircle
} from 'lucide-react'

// Helper to map backend status
const mapBackendStatus = (backendStatus, STATUS) => {
    const statusMap = {
        'applied': STATUS.UPLOADED,
        'qualified': STATUS.SCREENED,
        'rejected': STATUS.REJECTED,
        'approved': STATUS.SCREENED,
        'interview': STATUS.TESTING,
        'hired': STATUS.COMPLETE,
        'completed': STATUS.COMPLETE,
        'uploaded': STATUS.UPLOADED,
        'screened': STATUS.SCREENED,
        'testing': STATUS.TESTING,
        'complete': STATUS.COMPLETE,
    }
    return statusMap[backendStatus?.toLowerCase()] || STATUS.NONE
}

function ResumeUpload() {
    const { user: authUser, candidateData, updateCandidateData, STATUS } = useAuth()
    const navigate = useNavigate()

    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [dragActive, setDragActive] = useState(false)

    // Sidebar config
    const menuItems = [
        { label: 'My Status', path: '/applicant/dashboard', icon: LayoutDashboard },
        { label: 'Upload Resume', path: '/applicant/upload', icon: FileText },
        { label: 'Browse Jobs', path: '/applicant/jobs', icon: Briefcase },
        { label: 'My Profile', path: '/applicant/profile', icon: User },
    ]

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        setError(null)

        try {
            const data = await processResume(file, authUser.id, candidateData.selectedRoleId, authUser.email)

            if (data.success && data.candidate_id) {
                updateCandidateData({
                    candidateId: data.candidate_id,
                    status: STATUS.UPLOADED,
                })
                navigate('/applicant/screen')
            } else {
                if (data.error && (
                    data.error.includes("already applied") ||
                    data.error.includes("already completed") ||
                    data.error.includes("previously rejected")
                )) {
                    setError(data.error)
                    if (data.existing_candidate_id) {
                        updateCandidateData({
                            candidateId: data.existing_candidate_id,
                            status: mapBackendStatus(data.current_status || 'applied', STATUS),
                        })
                        setTimeout(() => {
                            if (data.error.includes("already completed")) {
                                navigate('/applicant')
                            } else {
                                navigate('/applicant/screen')
                            }
                        }, 2000)
                    }
                } else {
                    setError(data.error || 'Failed to process resume')
                }
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile)
            } else {
                setError("Only PDF files are allowed")
            }
        }
    }, [])

    // RENDER CONTENT BASED ON STATE
    const renderContent = () => {
        // 1. Completed State
        if (candidateData?.status === STATUS.COMPLETE) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                        background: '#e8f5e9',
                        padding: '3rem',
                        borderRadius: '16px',
                        maxWidth: '600px',
                        margin: '0 auto',
                        border: '1px solid #c8e6c9'
                    }}>
                        <div style={{
                            background: '#4caf50',
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto',
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

        // 2. No Role Selected
        if (!candidateData?.selectedRoleId) {
            return (
                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxWidth: '500px',
                        textAlign: 'center',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            background: '#eff6ff',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto',
                            color: '#3b82f6'
                        }}>
                            <Briefcase size={40} />
                        </div>
                        <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>No Role Selected</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                            You need to select a job role before uploading your resume. This helps us evaluate your application correctly.
                        </p>
                        <button
                            onClick={() => navigate('/applicant')}
                            className="btn btn-primary"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px'
                            }}
                        >
                            Browse Jobs & Apply <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )
        }

        // 3. Status exists but not uploaded (Welcome Back / Continue)
        if (candidateData?.status && candidateData.status !== STATUS.NONE && candidateData.status !== STATUS.UPLOADED) {
            // ... (Logic for other statuses)
            return (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '12px' }}>
                                <User size={28} className="text-primary-600" color="#0284c7" />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Welcome Back!</h1>
                                <p style={{ margin: 0, color: '#64748b' }}>Pick up where you left off</p>
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Role</span>
                                    <strong style={{ color: '#334155' }}>{candidateData.selectedRoleName}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Status</span>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '999px',
                                        background: '#e0f2fe',
                                        color: '#0369a1',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
                                    }}>
                                        {candidateData.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons based on status */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {candidateData.status === STATUS.SCREENED && (
                                <button onClick={() => navigate('/applicant/test')} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    Continue to Skill Tests <ArrowRight size={18} />
                                </button>
                            )}
                            {candidateData.status === STATUS.TESTING && (
                                <button onClick={() => navigate('/applicant/test')} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    Resume Tests <ArrowRight size={18} />
                                </button>
                            )}
                            {candidateData.status === STATUS.REJECTED && (
                                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <XCircle size={20} />
                                    <span>Application not selected.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        }

        // 4. Default Upload UI
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    padding: '1rem',
                    background: '#eff6ff',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Briefcase size={20} color="#2563eb" />
                    <span style={{ color: '#1e40af' }}>
                        Applying for: <strong>{candidateData.selectedRoleName}</strong>
                    </span>
                </div>

                <div style={{
                    background: 'white',
                    padding: '2.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Upload Your Resume</h2>
                        <p style={{ color: '#64748b' }}>Upload your CV in PDF format to begin the AI evaluation process.</p>
                    </div>

                    <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                        <div
                            style={{
                                border: `2px dashed ${dragActive ? '#6366f1' : '#cbd5e1'}`,
                                borderRadius: '16px',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                background: dragActive ? '#f5f3ff' : '#f8fafc',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0, width: '100%', height: '100%',
                                    opacity: 0, cursor: 'pointer'
                                }}
                            />

                            <div style={{ pointerEvents: 'none' }}>
                                <div style={{
                                    background: '#e0e7ff',
                                    width: '64px', height: '64px',
                                    borderRadius: '50%',
                                    margin: '0 auto 1rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#4f46e5'
                                }}>
                                    <UploadCloud size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
                                    {dragActive ? "Drop your resume here" : "Click to upload or drag and drop"}
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>PDF only (max 5MB)</p>
                            </div>
                        </div>

                        {file && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <FileText size={20} color="#16a34a" />
                                <span style={{ color: '#15803d', fontWeight: '500' }}>{file.name}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        )}

                        {error && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: '#b91c1c'
                            }}>
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem' }}>
                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                {loading ? (
                                    <>Processing Resume...</>
                                ) : (
                                    <>Upload & Continue <ArrowRight size={20} /></>
                                )}
                            </button>
                        </div>
                    </form>

                    {loading && (
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <LoadingSpinner />
                            <p style={{ color: '#64748b', marginTop: '1rem' }}>
                                Analyzing your resume with AI... this may take a moment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <DashboardLayout
            title="Resume Upload"
            menuItems={menuItems}
            sidebarTitle="Candidate Portal"
        >
            {renderContent()}
        </DashboardLayout>
    )
}

export default ResumeUpload
