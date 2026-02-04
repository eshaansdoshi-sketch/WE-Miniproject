import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getHRCandidateSummary, createJobRole } from '../api';
import {
    FileText,
    Users,
    Briefcase,
    Plus,
    Save,
    CheckCircle,
    AlertCircle,
    Search,
    Filter
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminReports = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('candidates');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Candidate Data State
    const [candidates, setCandidates] = useState([]);

    // Job Role Form State
    const [roleForm, setRoleForm] = useState({
        role_name: '',
        required_skills: '',
        preferred_skills: '',
        min_experience_level: 'junior',
        min_resume_score: 50
    });

    // Menu Items for Sidebar (Must match AdminDashboard to keep sidebar consistent if not global)
    // Actually, DashboardLayout accepts menuItems. We can reuse the same list or import it.
    // For now, I'll redefine it to ensure it renders correctly.
    const menuItems = [
        { label: 'Dashboard', path: '/admin', icon: Users }, // Redirects to main dashboard
        { label: 'Reports & Data', path: '/admin/reports', icon: FileText },
    ];

    useEffect(() => {
        if (activeTab === 'candidates') {
            fetchCandidates();
        }
    }, [activeTab]);

    const fetchCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getHRCandidateSummary();
            if (data.success) {
                setCandidates(data.candidates || []);
            } else {
                setError(data.error || 'Failed to load candidates');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg('');

        try {
            const payload = {
                role_name: roleForm.role_name,
                required_skills: roleForm.required_skills.split(',').map(s => s.trim()).filter(Boolean),
                preferred_skills: roleForm.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
                min_experience_level: roleForm.min_experience_level,
                min_resume_score: parseInt(roleForm.min_resume_score)
            };

            const res = await createJobRole(payload);
            if (res.success) {
                setSuccessMsg('Job role created successfully!');
                setRoleForm({
                    role_name: '',
                    required_skills: '',
                    preferred_skills: '',
                    min_experience_level: 'junior',
                    min_resume_score: 50
                });
            } else {
                setError(res.error || 'Failed to create job role');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return <span className="badge badge-purple">Unknown</span>;
        const s = status.toLowerCase();
        if (s.includes('qualified') || s.includes('approve') || s.includes('shortlist')) return <span className="badge badge-green">{status}</span>;
        if (s.includes('reject')) return <span className="badge badge-red">{status}</span>;
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
                <button
                    onClick={() => setActiveTab('candidates')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'candidates' ? '2px solid var(--primary-purple)' : 'none',
                        color: activeTab === 'candidates' ? 'var(--primary-purple)' : 'var(--text-secondary)',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Candidate Data
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'roles' ? '2px solid var(--primary-purple)' : 'none',
                        color: activeTab === 'roles' ? 'var(--primary-purple)' : 'var(--text-secondary)',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Create Job Role
                </button>
            </div>

            {/* Error / Success Messages */}
            {error && (
                <div className="card" style={{ background: '#fee2e2', color: '#b91c1c', marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="card" style={{ background: '#dcfce7', color: '#15803d', marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={20} />
                    {successMsg}
                </div>
            )}

            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
                <div className="card">
                    <div className="section-header">
                        <h3>All Candidates</h3>
                        <div className="flex gap-2">
                            <button className="btn btn-secondary" onClick={fetchCandidates}>
                                Refresh
                            </button>
                            <button className="btn btn-primary">
                                <Filter size={16} /> Filter
                            </button>
                        </div>
                    </div>

                    {loading ? <LoadingSpinner /> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', borderRadius: '8px 0 0 8px' }}>Candidate ID</th>
                                        <th style={{ padding: '12px' }}>Resume Score</th>
                                        <th style={{ padding: '12px' }}>Qualified</th>
                                        <th style={{ padding: '12px' }}>Avg Test Score</th>
                                        <th style={{ padding: '12px' }}>Interview Readiness</th>
                                        <th style={{ padding: '12px', borderRadius: '0 8px 8px 0' }}>Status</th>
                                        <th style={{ padding: '12px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-secondary">No candidates found.</td>
                                        </tr>
                                    ) : (
                                        candidates.map((c) => (
                                            <tr key={c.candidate_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                                                    {c.candidate_id.substring(0, 8)}...
                                                </td>
                                                <td style={{ padding: '12px', fontWeight: '600' }}>
                                                    {c.resume_score}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {c.qualified ?
                                                        <span className="text-success flex items-center gap-1"><CheckCircle size={14} /> Yes</span> :
                                                        <span className="text-muted">No</span>
                                                    }
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {c.avg_test_score ?? '-'}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div className="flex items-center gap-2">
                                                        <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '4px' }}>
                                                            <div style={{
                                                                width: `${Math.min(c.interview_readiness_score, 100)}%`,
                                                                height: '100%',
                                                                background: c.interview_readiness_score > 70 ? 'var(--success)' : 'var(--warning)',
                                                                borderRadius: '4px'
                                                            }} />
                                                        </div>
                                                        <span>{c.interview_readiness_score}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {getStatusBadge(c.status)}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                        onClick={() => navigate(`/admin/candidate/${c.candidate_id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Create Job Role Tab */}
            {activeTab === 'roles' && (
                <div className="card" style={{ maxWidth: '800px' }}>
                    <div className="section-header">
                        <h3>Create New Job Role</h3>
                    </div>

                    <form onSubmit={handleRoleSubmit}>
                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                                <label className="text-sm font-bold text-secondary mb-1 block">Role Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Senior Backend Engineer"
                                    value={roleForm.role_name}
                                    onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-secondary mb-1 block">Required Skills (Comma separated)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Python, FastAPI, SQL"
                                    value={roleForm.required_skills}
                                    onChange={(e) => setRoleForm({ ...roleForm, required_skills: e.target.value })}
                                />
                                <p className="text-xs text-muted mt-1">These skills will trigger automated test generation.</p>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-secondary mb-1 block">Preferred Skills (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AWS, Docker"
                                    value={roleForm.preferred_skills}
                                    onChange={(e) => setRoleForm({ ...roleForm, preferred_skills: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-secondary mb-1 block">Experience Level</label>
                                    <select
                                        value={roleForm.min_experience_level}
                                        onChange={(e) => setRoleForm({ ...roleForm, min_experience_level: e.target.value })}
                                    >
                                        <option value="junior">Junior (0-2 yrs)</option>
                                        <option value="mid">Mid (3-5 yrs)</option>
                                        <option value="senior">Senior (5+ yrs)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-secondary mb-1 block">Min Resume Score</label>
                                    <input
                                        type="number"
                                        min="0" max="100"
                                        value={roleForm.min_resume_score}
                                        onChange={(e) => setRoleForm({ ...roleForm, min_resume_score: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('candidates')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Creating...' : <><Save size={18} /> Create Role</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminReports;
