import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Briefcase,
    Users,
    Shield,
    BarChart2,
    Settings,
    MoreVertical,
    Check,
    X,
    Activity
} from 'lucide-react';

const AdminDashboard = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Tasks & Schedule', path: '/admin/tasks', icon: Calendar },
        { label: 'Leave Policies', path: '/admin/policies', icon: FileText },
        { label: 'Gigs Management', path: '/admin/gigs', icon: Briefcase },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Roles & Permissions', path: '/admin/roles', icon: Shield },
        { label: 'Reports', path: '/admin/reports', icon: BarChart2 },
        { label: 'System Settings', path: '/admin/settings', icon: Settings },
    ];

    const adminStats = [
        { label: 'Total Employees', value: '1,248', sub: '+12% from last month', color: '#8b5cf6', icon: Users },
        { label: 'Active Managers', value: '42', sub: '98% Active', color: '#10b981', icon: Shield },
        { label: 'Open Gigs', value: '18', sub: '4 Critical High Priority', color: '#f59e0b', icon: Briefcase },
        { label: 'System Load', value: '24%', sub: 'All systems operational', color: '#3b82f6', icon: Activity },
    ];

    const approvalRequests = [
        { id: 1, user: 'Sarah Connor', type: 'Role Change', from: 'Employee', to: 'Manager', date: '2 mins ago' },
        { id: 2, user: 'Kyle Reese', type: 'Access Request', from: 'None', to: 'Finance System', date: '1 hour ago' },
        { id: 3, user: 'John Doe', type: 'Account Reactivation', from: 'Inactive', to: 'Active', date: '4 hours ago' },
    ];

    const systemLogs = [
        { id: 101, action: 'Policy Updated', user: 'Admin User', time: '10:30 AM', status: 'Success' },
        { id: 102, action: 'Backup Created', user: 'System', time: '02:00 AM', status: 'Success' },
        { id: 103, action: 'Failed Login', user: 'Unknown IP', time: 'Yesterday', status: 'Warning' },
    ];

    return (
        <DashboardLayout
            title="Admin Overview"
            subtitle="System status, user management, and platform analytics."
            menuItems={menuItems}
            sidebarTitle="Admin Console"
        >
            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
                {adminStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="card stat-card">
                            <div className="flex justify-between items-start mb-4">
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    background: `${stat.color}15`,
                                    color: stat.color
                                }}>
                                    <Icon size={20} />
                                </div>
                                {index === 0 && <span className="badge badge-green text-xs">+12%</span>}
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {stat.sub}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart / Activity Area (Left Large) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Hiring / Engagement Graph Mockup */}
                    <div className="card">
                        <div className="section-header">
                            <h3>Hiring & Engagement Metrics</h3>
                            <select style={{ width: 'auto' }}>
                                <option>Last 30 Days</option>
                                <option>Q1 2026</option>
                            </select>
                        </div>
                        <div style={{
                            height: '300px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            padding: '20px 0',
                            borderBottom: '1px solid var(--border-light)'
                        }}>
                            {/* Fake bars for visualization */}
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} style={{
                                    width: '8%',
                                    height: `${h}%`,
                                    background: i % 2 === 0 ? 'var(--primary-light)' : 'var(--primary-purple)',
                                    borderRadius: '8px 8px 0 0',
                                    opacity: 0.8
                                }} />
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-sm text-secondary">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>

                    {/* System Logs */}
                    <div className="card">
                        <div className="section-header">
                            <h3>Recent Activity Logs</h3>
                            <button className="btn btn-secondary text-sm">Export Log</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                                    <th className="pb-3 text-sm font-bold text-muted">Action</th>
                                    <th className="pb-3 text-sm font-bold text-muted">User/System</th>
                                    <th className="pb-3 text-sm font-bold text-muted">Time</th>
                                    <th className="pb-3 text-sm font-bold text-muted text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {systemLogs.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td className="py-3 text-sm font-bold">{log.action}</td>
                                        <td className="py-3 text-sm text-secondary">{log.user}</td>
                                        <td className="py-3 text-sm text-secondary">{log.time}</td>
                                        <td className="py-3 text-right">
                                            <span className={`badge ${log.status === 'Success' ? 'badge-green' : 'badge-orange'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Approvals */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <div className="section-header">
                            <h3>Pending Approvals</h3>
                            <span className="badge badge-purple">3 New</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {approvalRequests.map((req) => (
                                <div key={req.id} style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px' }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold">{req.user}</span>
                                        <span className="text-xs text-muted">{req.date}</span>
                                    </div>
                                    <div className="text-sm text-secondary mb-3">
                                        Requests <span className="text-primary font-bold">{req.type}</span> from {req.from} to {req.to}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-primary" style={{ flex: 1, padding: '8px' }}>
                                            <Check size={16} /> Approve
                                        </button>
                                        <button className="btn btn-secondary" style={{ padding: '8px' }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-secondary w-100 mt-4" style={{ width: '100%' }}>View All Requests</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
