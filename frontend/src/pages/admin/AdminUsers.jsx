import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, Search } from 'lucide-react';

const USERS = [
    { id: 'u1', name: 'Admin Master', email: 'admin@hirrd.dev', role: 'admin', dept: 'HR', status: 'active', last: '2 min ago' },
    { id: 'u2', name: 'Gauri Barve', email: 'gauri@hirrd.dev', role: 'manager', dept: 'Engineering', status: 'active', last: '1 hr ago' },
    { id: 'u3', name: 'Prisha Kulkarni', email: 'prisha@hirrd.dev', role: 'applicant', dept: 'Engineering', status: 'active', last: '3 hrs ago' },
    { id: 'u4', name: 'Eshaan Doshi', email: 'eshaan@hirrd.dev', role: 'applicant', dept: 'Design', status: 'active', last: '1 day ago' },
    { id: 'u5', name: 'Rhushiesh', email: 'rush@hirrd.dev', role: 'manager', dept: 'Data', status: 'active', last: '30 min ago' },
    { id: 'u6', name: 'player1', email: 'p1@hirrd.dev', role: 'applicant', dept: 'Product', status: 'inactive', last: '2 wks ago' },
    { id: 'u7', name: 'player2', email: 'p2@hirrd.dev', role: 'applicant', dept: 'Engineering', status: 'active', last: '5 hrs ago' },
    { id: 'u8', name: 'Priya Sharma', email: 'priya@hirrd.dev', role: 'applicant', dept: 'QA', status: 'suspended', last: '1 mo ago' },
    { id: 'u9', name: 'James Wilson', email: 'james@hirrd.dev', role: 'manager', dept: 'DevOps', status: 'active', last: '10 min ago' },
    { id: 'u10', name: 'Sophie Martin', email: 'sophie@hirrd.dev', role: 'applicant', dept: 'Marketing', status: 'active', last: '4 hrs ago' },
];

const rc = { admin: '#8b5cf6', manager: '#3b82f6', applicant: '#10b981' };
const sc = { active: { c: '#10b981', b: '#dcfce7' }, inactive: { c: '#94a3b8', b: '#f1f5f9' }, suspended: { c: '#ef4444', b: '#fee2e2' } };

const AdminUsers = () => {
    const [search, setSearch] = useState('');
    const [rf, setRf] = useState('all');
    const list = USERS.filter(u => {
        const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        return ms && (rf === 'all' || u.role === rf);
    });

    return (
        <DashboardLayout title="User Management" subtitle="View and manage all platform users." sidebarTitle="Admin Console">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[{ l: 'Total', v: USERS.length, c: '#6366f1' }, { l: 'Admins', v: 1, c: '#8b5cf6' }, { l: 'Managers', v: 3, c: '#3b82f6' }, { l: 'Applicants', v: 6, c: '#10b981' }].map((s, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: s.c }}>{s.v}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.l}</div>
                    </div>
                ))}
            </div>
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['all', 'admin', 'manager', 'applicant'].map(r => (
                        <button key={r} onClick={() => setRf(r)} style={{
                            padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem',
                            background: rf === r ? '#6366f1' : '#f1f5f9', color: rf === r ? '#fff' : '#64748b', textTransform: 'capitalize'
                        }}>{r}</button>
                    ))}
                </div>
            </div>
            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: 12 }}>User</th><th style={{ padding: 12 }}>Role</th><th style={{ padding: 12 }}>Dept</th>
                            <th style={{ padding: 12 }}>Status</th><th style={{ padding: 12 }}>Last Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${rc[u.role]},${rc[u.role]}88)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                                        {u.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div><div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{u.email}</div></div>
                                </td>
                                <td style={{ padding: 12 }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: `${rc[u.role]}22`, color: rc[u.role] }}>{u.role}</span>
                                </td>
                                <td style={{ padding: 12, color: '#64748b' }}>{u.dept}</td>
                                <td style={{ padding: 12 }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, background: sc[u.status].b, color: sc[u.status].c }}>{u.status}</span>
                                </td>
                                <td style={{ padding: 12, color: '#94a3b8', fontSize: '0.8rem' }}>{u.last}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};
export default AdminUsers;
