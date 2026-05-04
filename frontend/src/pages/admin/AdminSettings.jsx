import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Settings, Bell, Shield, Globe, Database, Save, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'hirrd.',
        tagline: 'AI-Powered Recruitment Ecosystem',
        timezone: 'Asia/Kolkata',
        language: 'English',
        emailNotifications: true,
        slackIntegration: false,
        autoScreening: true,
        testTimeLimit: 30,
        minResumeScore: 50,
        maxApplicationsPerUser: 3,
        maintenanceMode: false,
        twoFactor: true,
        sessionTimeout: 60,
        dataRetentionDays: 365,
    });

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
    const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

    const Toggle = ({ label, desc, field }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div><div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{label}</div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{desc}</div></div>
            <div onClick={() => toggle(field)} style={{
                width: 44, height: 24, borderRadius: 12, background: settings[field] ? '#6366f1' : '#cbd5e1',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
            }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings[field] ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
        </div>
    );

    return (
        <DashboardLayout title="System Settings" subtitle="Configure platform behavior and preferences." sidebarTitle="Admin Console">
            <div style={{ maxWidth: 800 }}>
                {saved && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#dcfce7', borderRadius: 8, marginBottom: '1rem', color: '#166534', fontWeight: 600 }}>
                        <CheckCircle size={18} /> Settings saved successfully!
                    </div>
                )}

                {/* General */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={20} color="#6366f1" /> General</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Site Name</label>
                            <input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Tagline</label>
                            <input value={settings.tagline} onChange={e => setSettings({ ...settings, tagline: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Timezone</label>
                            <select value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <option>Asia/Kolkata</option><option>America/New_York</option><option>Europe/London</option><option>Asia/Tokyo</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Language</label>
                            <select value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <option>English</option><option>Hindi</option><option>Spanish</option><option>French</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={20} color="#f59e0b" /> Notifications</h3>
                    <Toggle label="Email Notifications" desc="Send email alerts for important events" field="emailNotifications" />
                    <Toggle label="Slack Integration" desc="Post updates to your Slack workspace" field="slackIntegration" />
                </div>

                {/* AI & Recruitment */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={20} color="#8b5cf6" /> AI & Recruitment</h3>
                    <Toggle label="Auto-Screening" desc="Automatically screen candidates after resume upload" field="autoScreening" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Test Time Limit (min)</label>
                            <input type="number" value={settings.testTimeLimit} onChange={e => setSettings({ ...settings, testTimeLimit: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Min Resume Score</label>
                            <input type="number" value={settings.minResumeScore} onChange={e => setSettings({ ...settings, minResumeScore: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={20} color="#ef4444" /> Security</h3>
                    <Toggle label="Two-Factor Auth" desc="Require 2FA for admin accounts" field="twoFactor" />
                    <Toggle label="Maintenance Mode" desc="Take the platform offline for maintenance" field="maintenanceMode" />
                </div>

                <button onClick={handleSave} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;
