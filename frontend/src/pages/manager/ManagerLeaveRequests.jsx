import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Clock, Check, X, User } from 'lucide-react';

const REQUESTS = [
    { id: 'lr1', name: 'Sarah Johnson', type: 'Annual Leave', from: '2026-05-10', to: '2026-05-14', days: 5, reason: 'Family vacation to Goa.', status: 'pending', avatar: 'SJ' },
    { id: 'lr2', name: 'Mike Chen', type: 'Sick Leave', from: '2026-05-05', to: '2026-05-06', days: 2, reason: 'Feeling unwell, doctor appointment.', status: 'pending', avatar: 'MC' },
    { id: 'lr3', name: 'Emily Davis', type: 'Work From Home', from: '2026-05-07', to: '2026-05-09', days: 3, reason: 'Plumber visiting — need to be home.', status: 'pending', avatar: 'ED' },
    { id: 'lr4', name: 'Alex Kumar', type: 'Annual Leave', from: '2026-04-20', to: '2026-04-22', days: 3, reason: 'Personal errands.', status: 'approved', avatar: 'AK' },
    { id: 'lr5', name: 'Rachel Park', type: 'Sick Leave', from: '2026-04-15', to: '2026-04-15', days: 1, reason: 'Migraine.', status: 'approved', avatar: 'RP' },
    { id: 'lr6', name: 'David Lee', type: 'Parental Leave', from: '2026-03-01', to: '2026-05-30', days: 90, reason: 'Paternity leave.', status: 'approved', avatar: 'DL' },
    { id: 'lr7', name: 'James Wilson', type: 'Annual Leave', from: '2026-04-10', to: '2026-04-11', days: 2, reason: 'Wedding ceremony.', status: 'rejected', avatar: 'JW' },
];

const ManagerLeaveRequests = () => {
    const [requests, setRequests] = useState(REQUESTS);
    const [tab, setTab] = useState('pending');

    const handleAction = (id, action) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    };

    const filtered = requests.filter(r => tab === 'all' ? true : r.status === tab);
    const sc = { pending: { c: '#f59e0b', b: '#fef3c7' }, approved: { c: '#10b981', b: '#dcfce7' }, rejected: { c: '#ef4444', b: '#fee2e2' } };

    return (
        <DashboardLayout title="Leave Requests" subtitle="Review and approve team leave applications." sidebarTitle="Manager Portal">
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
                {['pending', 'approved', 'rejected', 'all'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                        background: tab === t ? '#6366f1' : '#f1f5f9', color: tab === t ? '#fff' : '#64748b', textTransform: 'capitalize'
                    }}>
                        {t} {t !== 'all' && `(${requests.filter(r => r.status === t).length})`}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered.map(req => (
                    <div key={req.id} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                            {req.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{req.name}</h4>
                                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: sc[req.status].b, color: sc[req.status].c }}>{req.status}</span>
                            </div>
                            <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>
                                <strong>{req.type}</strong> • {req.from} → {req.to} • <strong>{req.days} day{req.days > 1 ? 's' : ''}</strong>
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>"{req.reason}"</p>
                            {req.status === 'pending' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <button onClick={() => handleAction(req.id, 'approved')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Check size={14} /> Approve
                                    </button>
                                    <button onClick={() => handleAction(req.id, 'rejected')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <X size={14} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div className="card" style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No {tab} requests.</div>}
            </div>
        </DashboardLayout>
    );
};

export default ManagerLeaveRequests;
