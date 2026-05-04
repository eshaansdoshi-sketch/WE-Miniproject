import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Settings, Bell, Save, CheckCircle } from 'lucide-react';

const ManagerSettings = () => {
    const [saved, setSaved] = useState(false);
    const [s, setS] = useState({ teamName: 'Alpha Squad', notifyLeave: true, notifyTask: true, weeklyDigest: false, autoApproveWfh: false, maxLeaveDays: 5 });

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
    const toggle = (k) => setS(p => ({ ...p, [k]: !p[k] }));

    const Toggle = ({ label, desc, field }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div><div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{label}</div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{desc}</div></div>
            <div onClick={() => toggle(field)} style={{ width: 44, height: 24, borderRadius: 12, background: s[field] ? '#6366f1' : '#cbd5e1', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: s[field] ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
        </div>
    );

    return (
        <DashboardLayout title="Settings" subtitle="Manage your team preferences." sidebarTitle="Manager Portal">
            <div style={{ maxWidth: 700 }}>
                {saved && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#dcfce7', borderRadius: 8, marginBottom: '1rem', color: '#166534', fontWeight: 600 }}><CheckCircle size={18} /> Settings saved!</div>}

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={20} color="#6366f1" /> General</h3>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Team Name</label>
                        <input value={s.teamName} onChange={e => setS({ ...s, teamName: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Max Consecutive Leave Days (auto-flag)</label>
                        <input type="number" value={s.maxLeaveDays} onChange={e => setS({ ...s, maxLeaveDays: e.target.value })} style={{ width: 120, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={20} color="#f59e0b" /> Notifications</h3>
                    <Toggle label="Leave Request Alerts" desc="Get notified when team members request leave" field="notifyLeave" />
                    <Toggle label="Task Updates" desc="Get notified when tasks are completed" field="notifyTask" />
                    <Toggle label="Weekly Digest" desc="Receive a weekly summary email" field="weeklyDigest" />
                    <Toggle label="Auto-Approve WFH" desc="Automatically approve work-from-home requests" field="autoApproveWfh" />
                </div>

                <button onClick={handleSave} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Save size={18} /> Save</button>
            </div>
        </DashboardLayout>
    );
};

export default ManagerSettings;
