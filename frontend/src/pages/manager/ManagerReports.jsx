import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { TrendingUp, Users, Clock, Briefcase, Award } from 'lucide-react';

const ManagerReports = () => {
    const metrics = [
        { label: 'Team Productivity', value: '87%', change: '+5%', icon: TrendingUp, color: '#10b981', bg: '#dcfce7' },
        { label: 'Avg Attendance', value: '94%', change: '+1%', icon: Users, color: '#3b82f6', bg: '#dbeafe' },
        { label: 'Leaves This Month', value: '12', change: '-3', icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
        { label: 'Active Projects', value: '8', change: '+2', icon: Briefcase, color: '#8b5cf6', bg: '#f3e8ff' },
    ];

    const topPerformers = [
        { name: 'Emily Davis', score: 96, dept: 'Design' },
        { name: 'Sarah Johnson', score: 94, dept: 'Engineering' },
        { name: 'Priya Sharma', score: 91, dept: 'QA' },
        { name: 'James Wilson', score: 89, dept: 'DevOps' },
        { name: 'Mike Chen', score: 87, dept: 'Engineering' },
    ];

    const monthly = [
        { month: 'Jan', tasks: 42, completed: 38 }, { month: 'Feb', tasks: 55, completed: 50 },
        { month: 'Mar', tasks: 48, completed: 45 }, { month: 'Apr', tasks: 60, completed: 52 },
    ];

    return (
        <DashboardLayout title="Team Reports" subtitle="Performance analytics and insights." sidebarTitle="Manager Portal">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {metrics.map((m, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ padding: 10, borderRadius: 10, background: m.bg, color: m.color }}><m.icon size={22} /></div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{m.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.label} <span style={{ color: m.color, fontWeight: 600 }}>{m.change}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Top Performers */}
                <div className="card">
                    <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Award size={20} color="#f59e0b" /> Top Performers</h3>
                    {topPerformers.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < topPerformers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#e2e8f0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.dept}</div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: '#10b981' }}>{p.score}%</div>
                        </div>
                    ))}
                </div>

                {/* Monthly Output */}
                <div className="card">
                    <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={20} color="#6366f1" /> Monthly Output</h3>
                    {monthly.map((m, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                                <span>{m.month} 2026</span>
                                <span style={{ color: '#64748b' }}>{m.completed}/{m.tasks} tasks</span>
                            </div>
                            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }}>
                                <div style={{ width: `${(m.completed / m.tasks) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 4 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagerReports;
