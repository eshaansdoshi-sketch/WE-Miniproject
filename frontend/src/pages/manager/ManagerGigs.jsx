import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Briefcase, Clock, DollarSign, Users } from 'lucide-react';

const GIGS = [
    { id: 'g1', title: 'Cloud Migration Sprint', budget: '$45K', duration: '6 wks', progress: 65, status: 'active', team: ['Gauri B.', 'Prisha K.'], skills: ['AWS', 'Docker'] },
    { id: 'g2', title: 'Mobile App Redesign', budget: '$28K', duration: '4 wks', progress: 40, status: 'active', team: ['Eshaan D.', 'player1'], skills: ['React Native', 'Figma'] },
    { id: 'g3', title: 'AI Chatbot Integration', budget: '$55K', duration: '8 wks', progress: 25, status: 'active', team: ['Arjun M.', 'Lisa C.'], skills: ['NLP', 'Python'] },
    { id: 'g4', title: 'Security Audit Q2', budget: '$12K', duration: '2 wks', progress: 0, status: 'pending', team: [], skills: ['OWASP', 'Pen Testing'] },
];

const sc = { active: '#10b981', pending: '#f59e0b', completed: '#6366f1' };

const ManagerGigs = () => (
    <DashboardLayout title="Team Gigs" subtitle="Track your team's project assignments." sidebarTitle="Manager Portal">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {GIGS.map(g => (
                <div key={g.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold' }}>{g.title}</h3>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: `${sc[g.status]}22`, color: sc[g.status] }}>{g.status}</span>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}><span>Progress</span><span>{g.progress}%</span></div>
                        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}><div style={{ width: `${g.progress}%`, height: '100%', background: sc[g.status], borderRadius: 3 }} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem', color: '#475569', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={14} /> {g.budget}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {g.duration}</div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {g.skills.map((s, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>{s}</span>)}
                    </div>
                    {g.team.length > 0 && <div style={{ fontSize: '0.75rem', color: '#94a3b8', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>Team: {g.team.join(', ')}</div>}
                </div>
            ))}
        </div>
    </DashboardLayout>
);

export default ManagerGigs;
