import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    FileText, Users, Briefcase, Plus, Save, CheckCircle, AlertCircle, Filter
} from 'lucide-react';

// ── Hardcoded candidates ─────────────────────────────────────
const HARDCODED_CANDIDATES = [
    { candidate_id: 'c001', name: 'Arjun Mehta', resume_score: 87, qualified: true, avg_test_score: 82, interview_readiness_score: 84, status: 'qualified', role: 'Senior Full-Stack Developer' },
    { candidate_id: 'c002', name: 'Priya Sharma', resume_score: 72, qualified: true, avg_test_score: 68, interview_readiness_score: 70, status: 'interview', role: 'ML Engineer' },
    { candidate_id: 'c003', name: 'David Wilson', resume_score: 45, qualified: false, avg_test_score: null, interview_readiness_score: 45, status: 'rejected', role: 'DevOps Engineer' },
    { candidate_id: 'c004', name: 'Lisa Chen', resume_score: 91, qualified: true, avg_test_score: 88, interview_readiness_score: 89, status: 'hired', role: 'Senior Full-Stack Developer' },
    { candidate_id: 'c005', name: 'James Brown', resume_score: 63, qualified: true, avg_test_score: 55, interview_readiness_score: 58, status: 'applied', role: 'Data Analyst' },
    { candidate_id: 'c006', name: 'Emily Park', resume_score: 78, qualified: true, avg_test_score: 75, interview_readiness_score: 76, status: 'qualified', role: 'UI/UX Designer' },
    { candidate_id: 'c007', name: 'Ravi Patel', resume_score: 55, qualified: false, avg_test_score: 40, interview_readiness_score: 46, status: 'rejected', role: 'Backend Engineer (Java)' },
    { candidate_id: 'c008', name: 'Sophie Martin', resume_score: 82, qualified: true, avg_test_score: null, interview_readiness_score: 82, status: 'applied', role: 'ML Engineer' },
];

const AdminReports = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('candidates');
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState(null);

    // Job Role Form State
    const [roleForm, setRoleForm] = useState({
        role_name: '', required_skills: '', preferred_skills: '',
        min_experience_level: 'junior', min_resume_score: 50
    });

    const handleRoleSubmit = (e) => {
        e.preventDefault();
        setSuccessMsg('Job role created successfully!');
        setRoleForm({ role_name: '', required_skills: '', preferred_skills: '', min_experience_level: 'junior', min_resume_score: 50 });
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const getStatusBadge = (status) => {
        if (!status) return <span className="badge badge-purple">Unknown</span>;
        const s = status.toLowerCase();
        if (s.includes('qualified') || s.includes('hired')) return <span className="badge badge-green">{status}</span>;
        if (s.includes('reject')) return <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>{status}</span>;
        if (s.includes('interview')) return <span className="badge badge-orange">{status}</span>;
        return <span className="badge badge-blue">{status}</span>;
    };

    return (
        <DashboardLayout
            title="Reports & Management"
            subtitle="View candidate data and manage job roles."
            sidebarTitle="Admin Console"
            menuItems={[
                { label: 'Dashboard', path: '/admin', icon: Users },
                { label: 'Reports', path: '/admin/reports', icon: FileText },
            ]}
        >
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-light">
                {['candidates', 'roles'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === tab ? '2px solid var(--primary-purple)' : 'none',
                        color: activeTab === tab ? 'var(--primary-purple)' : 'var(--text-secondary)',
                        fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer'
                    }}>
                        {tab === 'candidates' ? 'Candidate Data' : 'Create Job Role'}
                    </button>
                ))}
            </div>

            {error && (
                <div className="card" style={{ background: '#fee2e2', color: '#b91c1c', marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}
            {successMsg && (
                <div className="card" style={{ background: '#dcfce7', color: '#15803d', marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={20} /> {successMsg}
                </div>
            )}

            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
                <div className="card">
                    <div className="section-header">
                        <h3>All Candidates</h3>
                        <span className="badge badge-purple">{HARDCODED_CANDIDATES.length} Total</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>Name</th>
                                    <th style={{ padding: '12px' }}>Role</th>
                                    <th style={{ padding: '12px' }}>Resume Score</th>
                                    <th style={{ padding: '12px' }}>Qualified</th>
                                    <th style={{ padding: '12px' }}>Avg Test</th>
                                    <th style={{ padding: '12px' }}>Readiness</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {HARDCODED_CANDIDATES.map((c) => (
                                    <tr key={c.candidate_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px', fontWeight: '600' }}>{c.name}</td>
                                        <td style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem' }}>{c.role}</td>
                                        <td style={{ padding: '12px', fontWeight: '600' }}>{c.resume_score}</td>
                                        <td style={{ padding: '12px' }}>
                                            {c.qualified ?
                                                <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Yes</span> :
                                                <span style={{ color: '#94a3b8' }}>No</span>
                                            }
                                        </td>
                                        <td style={{ padding: '12px' }}>{c.avg_test_score ?? '-'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '4px' }}>
                                                    <div style={{
                                                        width: `${Math.min(c.interview_readiness_score, 100)}%`,
                                                        height: '100%',
                                                        background: c.interview_readiness_score > 70 ? '#10b981' : '#f59e0b',
                                                        borderRadius: '4px'
                                                    }} />
                                                </div>
                                                <span>{c.interview_readiness_score}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>{getStatusBadge(c.status)}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button className="btn btn-secondary"
                                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                onClick={() => navigate(`/admin/candidate/${c.candidate_id}`)}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Job Role Tab */}
            {activeTab === 'roles' && (
                <div className="card" style={{ maxWidth: '800px' }}>
                    <div className="section-header"><h3>Create New Job Role</h3></div>
                    <form onSubmit={handleRoleSubmit}>
                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                                <label className="text-sm font-bold text-secondary mb-1 block">Role Name</label>
                                <input type="text" required placeholder="e.g. Senior Backend Engineer"
                                    value={roleForm.role_name} onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-secondary mb-1 block">Required Skills (Comma separated)</label>
                                <input type="text" required placeholder="e.g. Python, FastAPI, SQL"
                                    value={roleForm.required_skills} onChange={(e) => setRoleForm({ ...roleForm, required_skills: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-secondary mb-1 block">Preferred Skills (Optional)</label>
                                <input type="text" placeholder="e.g. AWS, Docker"
                                    value={roleForm.preferred_skills} onChange={(e) => setRoleForm({ ...roleForm, preferred_skills: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-secondary mb-1 block">Experience Level</label>
                                    <select value={roleForm.min_experience_level}
                                        onChange={(e) => setRoleForm({ ...roleForm, min_experience_level: e.target.value })}>
                                        <option value="junior">Junior (0-2 yrs)</option>
                                        <option value="mid">Mid (3-5 yrs)</option>
                                        <option value="senior">Senior (5+ yrs)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-secondary mb-1 block">Min Resume Score</label>
                                    <input type="number" min="0" max="100" value={roleForm.min_resume_score}
                                        onChange={(e) => setRoleForm({ ...roleForm, min_resume_score: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('candidates')}>Cancel</button>
                            <button type="submit" className="btn btn-primary"><Save size={18} /> Create Role</button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminReports;
