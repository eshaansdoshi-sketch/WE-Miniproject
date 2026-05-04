import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FileText, Plus, Edit2, Trash2, CheckCircle, Clock, Shield } from 'lucide-react';

const HARDCODED_POLICIES = [
    { id: 'lp1', name: 'Annual Leave', days: 24, carry_forward: true, max_carry: 5, description: 'Standard annual paid leave for all full-time employees.', applicable_to: 'All Employees', status: 'active' },
    { id: 'lp2', name: 'Sick Leave', days: 12, carry_forward: false, max_carry: 0, description: 'Paid sick leave with medical certificate required for 3+ consecutive days.', applicable_to: 'All Employees', status: 'active' },
    { id: 'lp3', name: 'Parental Leave', days: 90, carry_forward: false, max_carry: 0, description: 'Paid parental leave for primary caregivers. Secondary caregivers get 15 days.', applicable_to: 'Full-Time', status: 'active' },
    { id: 'lp4', name: 'Bereavement Leave', days: 5, carry_forward: false, max_carry: 0, description: 'Paid leave for immediate family bereavement.', applicable_to: 'All Employees', status: 'active' },
    { id: 'lp5', name: 'Work From Home', days: 60, carry_forward: false, max_carry: 0, description: 'Flexible remote work days per quarter (15/quarter).', applicable_to: 'Engineering & Design', status: 'active' },
    { id: 'lp6', name: 'Sabbatical Leave', days: 30, carry_forward: false, max_carry: 0, description: 'Unpaid sabbatical available after 3 years of service.', applicable_to: 'Senior Staff', status: 'draft' },
];

const AdminLeavePolicies = () => {
    const [policies] = useState(HARDCODED_POLICIES);

    return (
        <DashboardLayout title="Leave Policies" subtitle="Manage company-wide leave and time-off policies." sidebarTitle="Admin Console">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Active Policies', value: policies.filter(p => p.status === 'active').length, icon: CheckCircle, color: '#10b981', bg: '#dcfce7' },
                    { label: 'Draft Policies', value: policies.filter(p => p.status === 'draft').length, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
                    { label: 'Total Leave Types', value: policies.length, icon: FileText, color: '#6366f1', bg: '#e0e7ff' },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: 12, borderRadius: 12, background: stat.bg, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Policies Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {policies.map(policy => (
                    <div key={policy.id} className="card" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>{policy.name}</h3>
                                <span style={{
                                    display: 'inline-block', marginTop: 4, fontSize: '0.7rem', padding: '2px 8px',
                                    borderRadius: 999, fontWeight: 600, textTransform: 'uppercase',
                                    background: policy.status === 'active' ? '#dcfce7' : '#fef3c7',
                                    color: policy.status === 'active' ? '#166534' : '#92400e'
                                }}>
                                    {policy.status}
                                </span>
                            </div>
                            <div style={{
                                padding: '8px 16px', borderRadius: 12,
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
                            }}>
                                {policy.days}d
                            </div>
                        </div>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{policy.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                            <span>👥 {policy.applicable_to}</span>
                            <span>{policy.carry_forward ? `↻ Carry ${policy.max_carry}d` : '✕ No carry'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Edit2 size={12} /> Edit
                            </button>
                            <button className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                <Trash2 size={12} /> Remove
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <div className="card" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: '2px dashed #e2e8f0', background: '#fafafa', minHeight: 200, cursor: 'pointer'
                }}>
                    <Plus size={32} color="#94a3b8" />
                    <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontWeight: 600 }}>Add New Policy</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminLeavePolicies;
