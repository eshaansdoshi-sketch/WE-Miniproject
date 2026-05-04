import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Shield, CheckCircle, Edit2, Lock } from 'lucide-react';

const ROLES = [
    { id: 'r1', name: 'Admin', permissions: ['manage_users', 'manage_roles', 'manage_policies', 'manage_gigs', 'view_reports', 'system_settings', 'manage_candidates'], users: 1, color: '#8b5cf6' },
    { id: 'r2', name: 'Manager', permissions: ['view_team', 'assign_tasks', 'approve_leave', 'manage_schedule', 'view_reports'], users: 3, color: '#3b82f6' },
    { id: 'r3', name: 'Applicant', permissions: ['apply_jobs', 'upload_resume', 'take_tests', 'view_status'], users: 6, color: '#10b981' },
];

const ALL_PERMS = [
    { id: 'manage_users', label: 'Manage Users', category: 'Administration' },
    { id: 'manage_roles', label: 'Manage Roles', category: 'Administration' },
    { id: 'manage_policies', label: 'Manage Policies', category: 'Administration' },
    { id: 'manage_gigs', label: 'Manage Gigs', category: 'Operations' },
    { id: 'manage_candidates', label: 'Manage Candidates', category: 'Recruitment' },
    { id: 'view_reports', label: 'View Reports', category: 'Analytics' },
    { id: 'system_settings', label: 'System Settings', category: 'Administration' },
    { id: 'view_team', label: 'View Team', category: 'Operations' },
    { id: 'assign_tasks', label: 'Assign Tasks', category: 'Operations' },
    { id: 'approve_leave', label: 'Approve Leave', category: 'Operations' },
    { id: 'manage_schedule', label: 'Manage Schedule', category: 'Operations' },
    { id: 'apply_jobs', label: 'Apply for Jobs', category: 'Recruitment' },
    { id: 'upload_resume', label: 'Upload Resume', category: 'Recruitment' },
    { id: 'take_tests', label: 'Take Tests', category: 'Recruitment' },
    { id: 'view_status', label: 'View Status', category: 'Recruitment' },
];

const AdminRoles = () => {
    const [selected, setSelected] = useState(ROLES[0]);

    return (
        <DashboardLayout title="Roles & Permissions" subtitle="Configure role-based access control." sidebarTitle="Admin Console">
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
                {/* Role List */}
                <div>
                    {ROLES.map(role => (
                        <div key={role.id} onClick={() => setSelected(role)} className="card"
                            style={{ marginBottom: 12, cursor: 'pointer', border: selected.id === role.id ? `2px solid ${role.color}` : '2px solid transparent', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${role.color}22`, color: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{role.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{role.users} users • {role.permissions.length} perms</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Permission Matrix */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, color: selected.color }}>{selected.name} Permissions</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{selected.permissions.length} of {ALL_PERMS.length} permissions enabled</p>
                        </div>
                        <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: '0.8rem' }}>
                            <Edit2 size={14} /> Edit Role
                        </button>
                    </div>

                    {['Administration', 'Operations', 'Recruitment', 'Analytics'].map(cat => {
                        const perms = ALL_PERMS.filter(p => p.category === cat);
                        return (
                            <div key={cat} style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 1 }}>{cat}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                                    {perms.map(perm => {
                                        const has = selected.permissions.includes(perm.id);
                                        return (
                                            <div key={perm.id} style={{
                                                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
                                                background: has ? '#dcfce7' : '#f8fafc', border: `1px solid ${has ? '#bbf7d0' : '#f1f5f9'}`
                                            }}>
                                                {has ? <CheckCircle size={16} color="#10b981" /> : <Lock size={16} color="#cbd5e1" />}
                                                <span style={{ fontSize: '0.8rem', color: has ? '#166534' : '#94a3b8', fontWeight: has ? 600 : 400 }}>{perm.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminRoles;
