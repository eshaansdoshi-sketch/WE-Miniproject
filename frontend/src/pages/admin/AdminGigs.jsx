import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Briefcase, Clock, DollarSign, Users, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const HARDCODED_GIGS = [
    { id: 'g1', title: 'Cloud Migration Sprint', client: 'FinSecure Corp', type: 'Internal', budget: '$45,000', duration: '6 weeks', team_size: 4, skills: ['AWS', 'Terraform', 'Docker'], status: 'active', priority: 'High', progress: 65, assigned: ['Sarah J.', 'Mike C.', 'Alex K.', 'David L.'] },
    { id: 'g2', title: 'Mobile App Redesign', client: 'RetailMax', type: 'Client', budget: '$28,000', duration: '4 weeks', team_size: 3, skills: ['React Native', 'Figma', 'TypeScript'], status: 'active', priority: 'Medium', progress: 40, assigned: ['Emily D.', 'Rachel P.', 'Priya S.'] },
    { id: 'g3', title: 'Data Pipeline Optimization', client: 'Internal — Analytics', type: 'Internal', budget: '$15,000', duration: '3 weeks', team_size: 2, skills: ['Python', 'Apache Spark', 'SQL'], status: 'completed', priority: 'Low', progress: 100, assigned: ['James W.', 'Ravi P.'] },
    { id: 'g4', title: 'Security Audit Q2', client: 'Compliance Team', type: 'Internal', budget: '$12,000', duration: '2 weeks', team_size: 2, skills: ['Pen Testing', 'OWASP', 'Network Security'], status: 'pending', priority: 'High', progress: 0, assigned: [] },
    { id: 'g5', title: 'AI Chatbot Integration', client: 'SupportFirst Inc.', type: 'Client', budget: '$55,000', duration: '8 weeks', team_size: 5, skills: ['NLP', 'Python', 'React', 'Node.js'], status: 'active', priority: 'High', progress: 25, assigned: ['Arjun M.', 'Lisa C.', 'Sophie M.', 'Emily D.', 'Mike C.'] },
    { id: 'g6', title: 'HR Dashboard v3', client: 'Internal — HR', type: 'Internal', budget: '$18,000', duration: '5 weeks', team_size: 3, skills: ['React', 'D3.js', 'Node.js'], status: 'pending', priority: 'Medium', progress: 0, assigned: [] },
];

const AdminGigs = () => {
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? HARDCODED_GIGS : HARDCODED_GIGS.filter(g => g.status === filter);
    const statusColors = { active: '#10b981', completed: '#6366f1', pending: '#f59e0b' };
    const priorityColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

    return (
        <DashboardLayout title="Gigs Management" subtitle="Track internal projects and client engagements." sidebarTitle="Admin Console">
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Active Gigs', value: HARDCODED_GIGS.filter(g => g.status === 'active').length, icon: Briefcase, color: '#10b981', bg: '#dcfce7' },
                    { label: 'Pending', value: HARDCODED_GIGS.filter(g => g.status === 'pending').length, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
                    { label: 'Completed', value: HARDCODED_GIGS.filter(g => g.status === 'completed').length, icon: CheckCircle, color: '#6366f1', bg: '#e0e7ff' },
                    { label: 'Total Budget', value: '$173K', icon: DollarSign, color: '#ec4899', bg: '#fce7f3' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ padding: 10, borderRadius: 10, background: s.bg, color: s.color }}><s.icon size={22} /></div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
                {['all', 'active', 'pending', 'completed'].map(tab => (
                    <button key={tab} onClick={() => setFilter(tab)} style={{
                        padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize',
                        background: filter === tab ? '#6366f1' : '#f1f5f9',
                        color: filter === tab ? 'white' : '#64748b'
                    }}>{tab}</button>
                ))}
            </div>

            {/* Gigs Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
                {filtered.map(gig => (
                    <div key={gig.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#1e293b' }}>{gig.title}</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{gig.client} • {gig.type}</p>
                            </div>
                            <span style={{
                                padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                                textTransform: 'uppercase',
                                background: `${statusColors[gig.status]}22`,
                                color: statusColors[gig.status]
                            }}>{gig.status}</span>
                        </div>

                        {/* Progress */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>
                                <span>Progress</span><span>{gig.progress}%</span>
                            </div>
                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                                <div style={{ width: `${gig.progress}%`, height: '100%', background: statusColors[gig.status], borderRadius: 3, transition: 'width 0.3s' }} />
                            </div>
                        </div>

                        {/* Meta */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: '0.8rem', color: '#475569' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={14} /> {gig.budget}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {gig.duration}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> {gig.team_size} people</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <AlertCircle size={14} color={priorityColors[gig.priority]} /> {gig.priority}
                            </div>
                        </div>

                        {/* Skills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                            {gig.skills.map((s, i) => (
                                <span key={i} style={{
                                    padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600,
                                    background: '#f1f5f9', color: '#475569'
                                }}>{s}</span>
                            ))}
                        </div>

                        {/* Team */}
                        {gig.assigned.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                                Team: {gig.assigned.join(', ')}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default AdminGigs;
