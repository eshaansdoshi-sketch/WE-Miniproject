import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, Mail, MapPin, Star } from 'lucide-react';

const EMPLOYEES = [
    { id: 'e1', name: 'Sarah Johnson', email: 'sarah@hirrd.dev', role: 'Senior Dev', dept: 'Engineering', location: 'Office', rating: 4.8, projects: 5, status: 'active' },
    { id: 'e2', name: 'Mike Chen', email: 'mike@hirrd.dev', role: 'Backend Dev', dept: 'Engineering', location: 'Remote', rating: 4.5, projects: 3, status: 'active' },
    { id: 'e3', name: 'Emily Davis', email: 'emily@hirrd.dev', role: 'UI Designer', dept: 'Design', location: 'Office', rating: 4.9, projects: 4, status: 'active' },
    { id: 'e4', name: 'Alex Kumar', email: 'alex@hirrd.dev', role: 'Data Scientist', dept: 'Data', location: 'Remote', rating: 4.3, projects: 2, status: 'active' },
    { id: 'e5', name: 'Rachel Park', email: 'rachel@hirrd.dev', role: 'Product Manager', dept: 'Product', location: 'Office', rating: 4.6, projects: 6, status: 'on_leave' },
    { id: 'e6', name: 'David Lee', email: 'david@hirrd.dev', role: 'Full-Stack Dev', dept: 'Engineering', location: 'Field', rating: 4.1, projects: 3, status: 'active' },
    { id: 'e7', name: 'Priya Sharma', email: 'priya@hirrd.dev', role: 'QA Lead', dept: 'QA', location: 'Office', rating: 4.7, projects: 4, status: 'active' },
    { id: 'e8', name: 'James Wilson', email: 'james@hirrd.dev', role: 'DevOps Eng', dept: 'DevOps', location: 'Remote', rating: 4.4, projects: 5, status: 'active' },
];

const lc = { Office: '#6366f1', Remote: '#10b981', Field: '#f59e0b' };
const stc = { active: { c: '#10b981', b: '#dcfce7' }, on_leave: { c: '#f59e0b', b: '#fef3c7' } };

const ManagerEmployees = () => (
    <DashboardLayout title="Team Members" subtitle="View your team's profiles and performance." sidebarTitle="Manager Portal">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {EMPLOYEES.map(emp => (
                <div key={emp.id} className="card" style={{ textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', margin: '0 auto 12px' }}>
                        {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '1rem' }}>{emp.name}</h4>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#64748b' }}>{emp.role} • {emp.dept}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, background: `${lc[emp.location]}22`, color: lc[emp.location] }}><MapPin size={10} style={{ verticalAlign: 'middle' }} /> {emp.location}</span>
                        <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, background: stc[emp.status].b, color: stc[emp.status].c }}>{emp.status.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: '0.8rem' }}>
                        <div><div style={{ fontWeight: 'bold', color: '#1e293b' }}>{emp.rating}</div><div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Rating</div></div>
                        <div><div style={{ fontWeight: 'bold', color: '#1e293b' }}>{emp.projects}</div><div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Projects</div></div>
                    </div>
                </div>
            ))}
        </div>
    </DashboardLayout>
);

export default ManagerEmployees;
