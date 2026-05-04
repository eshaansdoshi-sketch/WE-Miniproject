import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Users, FileText, ArrowLeft, CheckCircle, XCircle, Award, Briefcase } from 'lucide-react'

// ── Hardcoded candidate details ──────────────────────────────
const CANDIDATE_DB = {
    c001: {
        id: 'c001', name: 'Arjun Mehta', email: 'arjun@gmail.com', experience_level: 'Senior',
        status: 'qualified', resume_score: 87,
        experience_summary: 'Full-stack developer with 6+ years of experience in React, Node.js, and MongoDB. Built scalable SaaS platforms serving 50K+ users. Led a team of 4 engineers at TechCorp.',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS', 'GraphQL', 'REST APIs'],
        role: { role_name: 'Senior Full-Stack Developer' },
        applied_at: '2026-04-28T10:30:00',
        test_results: [
            { test_id: 'react_v1', score: 85, total_questions: 5, submitted_at: '2026-04-29T14:00:00' },
            { test_id: 'nodejs_v1', score: 80, total_questions: 5, submitted_at: '2026-04-29T14:30:00' },
        ],
        total_test_score: 82,
        evaluation: { qualified: true, matched_skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'REST APIs'], missing_skills: [] },
    },
    c002: {
        id: 'c002', name: 'Priya Sharma', email: 'priya@gmail.com', experience_level: 'Mid',
        status: 'interview', resume_score: 72,
        experience_summary: 'ML engineer with 3 years experience in NLP and computer vision. Published 2 papers on transformer architectures.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'NLP'],
        role: { role_name: 'ML Engineer' },
        applied_at: '2026-04-25T09:00:00',
        test_results: [{ test_id: 'python_v1', score: 70, total_questions: 5, submitted_at: '2026-04-26T11:00:00' }],
        total_test_score: 68,
        evaluation: { qualified: true, matched_skills: ['Python', 'TensorFlow', 'Scikit-learn', 'SQL'], missing_skills: [] },
    },
    c003: {
        id: 'c003', name: 'David Wilson', email: 'david@gmail.com', experience_level: 'Junior',
        status: 'rejected', resume_score: 45,
        experience_summary: 'Recent grad with basic knowledge of Linux and networking. Completed a Docker course online.',
        skills: ['Linux', 'Docker basics'],
        role: { role_name: 'DevOps Engineer' },
        applied_at: '2026-04-27T16:00:00',
        test_results: [],
        total_test_score: null,
        evaluation: { qualified: false, matched_skills: ['Docker'], missing_skills: ['Kubernetes', 'CI/CD', 'Terraform', 'Linux (advanced)'] },
    },
}

// Fallback candidate for unknown IDs
const FALLBACK = {
    id: 'unknown', name: 'Sample Candidate', email: 'sample@gmail.com', experience_level: 'Mid',
    status: 'applied', resume_score: 65,
    experience_summary: 'Experienced professional with a broad skill set in software development.',
    skills: ['JavaScript', 'Python', 'SQL'],
    role: { role_name: 'General Application' },
    applied_at: '2026-05-01T12:00:00',
    test_results: [], total_test_score: null,
    evaluation: { qualified: false, matched_skills: ['JavaScript'], missing_skills: ['React', 'Node.js'] },
}

function CandidateDetailPage() {
    const { candidateId } = useParams()
    const navigate = useNavigate()

    const candidate = CANDIDATE_DB[candidateId] || { ...FALLBACK, id: candidateId }
    const role = candidate.role
    const testResults = candidate.test_results
    const totalTestScore = candidate.total_test_score
    const evaluation = candidate.evaluation

    const [notes, setNotes] = useState(candidate.admin_notes || '')
    const [currentStatus, setCurrentStatus] = useState(candidate.status)
    const [updateSuccess, setUpdateSuccess] = useState(null)

    const handleStatusUpdate = (newStatus) => {
        setCurrentStatus(newStatus)
        setUpdateSuccess(`Status updated to "${newStatus}"`)
        setTimeout(() => setUpdateSuccess(null), 3000)
    }

    const getStatusColor = (status) => ({
        applied: '#3b82f6', qualified: '#10b981', rejected: '#ef4444',
        approved: '#8bc34a', interview: '#f59e0b', hired: '#8b5cf6',
    }[status] || '#666')

    return (
        <DashboardLayout
            title="Candidate Review"
            subtitle={`Reviewing ${candidate.name}`}
            sidebarTitle="Admin Console"
            menuItems={[
                { label: 'Dashboard', path: '/admin', icon: Users },
                { label: 'Reports', path: '/admin/reports', icon: FileText },
            ]}
        >
            <div style={{ maxWidth: '900px' }}>
                <button onClick={() => navigate('/admin/reports')} className="btn btn-secondary mb-6"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back to Reports
                </button>

                {/* Candidate Header */}
                <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>{candidate.name}</h2>
                        <p style={{ margin: '5px 0', color: '#64748b' }}>{candidate.email} • Experience: <strong>{candidate.experience_level}</strong></p>
                        {role && <p style={{ margin: '5px 0', color: '#64748b' }}>Applied for: <strong>{role.role_name}</strong></p>}
                    </div>
                    <div style={{
                        padding: '8px 16px', background: getStatusColor(currentStatus),
                        color: '#fff', borderRadius: 20, fontWeight: 'bold', textTransform: 'uppercase',
                    }}>
                        {currentStatus}
                    </div>
                </div>

                {/* Resume Summary */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={20} color="#6366f1" /> Resume Summary
                    </h3>
                    <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '12px' }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Resume Score:</strong> {candidate.resume_score}/100</p>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{candidate.experience_summary}</p>
                    </div>
                </div>

                {/* Skills */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem 0' }}>Extracted Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {candidate.skills.map((skill, idx) => (
                            <span key={idx} className="badge badge-purple">{skill}</span>
                        ))}
                    </div>
                </div>

                {/* Test Results */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem 0' }}>Test Results</h3>
                    {testResults.length > 0 ? (
                        <>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}>Test</th>
                                        <th style={{ padding: '10px' }}>Score</th>
                                        <th style={{ padding: '10px' }}>Questions</th>
                                        <th style={{ padding: '10px' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testResults.map((r, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px' }}>{r.test_id.replace(/_/g, ' ')}</td>
                                            <td style={{ padding: '10px', fontWeight: '600' }}>{r.score}%</td>
                                            <td style={{ padding: '10px' }}>{r.total_questions}</td>
                                            <td style={{ padding: '10px', color: '#64748b' }}>
                                                {new Date(r.submitted_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalTestScore !== null && (
                                <p style={{ marginTop: 10, fontWeight: '600' }}>Average Test Score: {totalTestScore}%</p>
                            )}
                        </>
                    ) : (
                        <p style={{ color: '#94a3b8' }}>No tests taken yet</p>
                    )}
                </div>

                {/* Evaluation */}
                {evaluation && (
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0' }}>Qualification Evaluation</h3>
                        <div style={{ padding: '1rem', background: evaluation.qualified ? '#dcfce7' : '#fee2e2', borderRadius: '12px' }}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                                {evaluation.qualified ? <><CheckCircle size={18} color="#16a34a" /> Qualified</> : <><XCircle size={18} color="#dc2626" /> Not Qualified</>}
                            </p>
                            {evaluation.matched_skills?.length > 0 && (
                                <p><strong>Matched:</strong> {evaluation.matched_skills.join(', ')}</p>
                            )}
                            {evaluation.missing_skills?.length > 0 && (
                                <p><strong>Missing:</strong> {evaluation.missing_skills.join(', ')}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Admin Notes */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem 0' }}>Admin Notes</h3>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this candidate..."
                        style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', resize: 'vertical' }} />
                </div>

                {/* Action Buttons */}
                <div className="card">
                    <h3 style={{ margin: '0 0 0.75rem 0' }}>Update Status</h3>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {[
                            { s: 'approved', label: '✓ Approve', bg: '#10b981' },
                            { s: 'rejected', label: '✗ Reject', bg: '#ef4444' },
                            { s: 'interview', label: '📅 Interview', bg: '#f59e0b' },
                            { s: 'hired', label: '🎉 Hire', bg: '#8b5cf6' },
                        ].map(btn => (
                            <button key={btn.s} onClick={() => handleStatusUpdate(btn.s)}
                                className="btn" style={{ background: btn.bg, color: 'white' }}>
                                {btn.label}
                            </button>
                        ))}
                    </div>
                    {updateSuccess && (
                        <p style={{ marginTop: 12, color: '#16a34a', fontWeight: '600' }}>✓ {updateSuccess}</p>
                    )}
                </div>

                <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#94a3b8' }}>
                    <p>Candidate ID: {candidate.id}</p>
                    <p>Applied: {new Date(candidate.applied_at).toLocaleString()}</p>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default CandidateDetailPage
