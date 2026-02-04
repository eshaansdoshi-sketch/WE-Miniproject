import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Clock,
    Briefcase,
    Users,
    FileText,
    Settings,
    Check,
    X,
    MoreHorizontal,
    TrendingUp,
    MapPin,
    ChevronRight
} from 'lucide-react';

// Note: Ensure ManagerDashboard.css is either removed or compatible. 
// We are using global utility classes now, so we might not need specific CSS if we use inline/utility styles correctly.
// import './ManagerDashboard.css' 

const ManagerDashboard = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026

    const menuItems = [
        { label: 'Dashboard', path: '/manager', icon: LayoutDashboard },
        { label: 'Team Schedule (Calendar)', path: '/manager/schedule', icon: CalendarIcon },
        { label: 'Leave Requests', path: '/manager/leave-requests', icon: Clock },
        { label: 'Team Gigs', path: '/manager/gigs', icon: Briefcase },
        { label: 'Employees', path: '/manager/employees', icon: Users },
        { label: 'Reports', path: '/manager/reports', icon: FileText },
        { label: 'Settings', path: '/manager/settings', icon: Settings },
    ];

    const teamStats = [
        { label: 'Team Size', value: '24', change: '+2 this month', icon: Users, color: '#9333ea', bg: '#f3e8ff' },
        { label: 'Active Projects', value: '8', change: '3 due this week', icon: Briefcase, color: '#3b82f6', bg: '#dbeafe' },
        { label: 'Pending Leaves', value: '5', change: 'Needs approval', icon: Clock, color: '#f59e0b', bg: '#ffedd5' },
    ];

    const leaveRequests = [
        { id: 1, employee: 'Sarah Johnson', avatar: 'SJ', type: 'Annual Leave', dates: 'Feb 10 - Feb 14', days: 5, color: '#9333ea' },
        { id: 2, employee: 'Mike Chen', avatar: 'MC', type: 'Sick Leave', dates: 'Feb 6 - Feb 7', days: 2, color: '#3b82f6' },
        { id: 3, employee: 'Emily Davis', avatar: 'ED', type: 'Work From Home', dates: 'Feb 12', days: 1, color: '#10b981' },
    ];

    const teamGigs = [
        {
            id: 1, title: 'Q1 Performance Review',
            desc: 'Annual performance assessment for Q1',
            deadline: 'Feb 28', progress: 65, priority: 'High',
            assignees: ['SJ', 'MC', 'ED']
        },
        {
            id: 2, title: 'New Hire Onboarding',
            desc: 'Onboard 3 new team members',
            deadline: 'Feb 15', progress: 40, priority: 'Medium',
            assignees: ['AK', 'RB']
        },
        {
            id: 3, title: 'Team Building Event',
            desc: 'Quarterly team activity planning',
            deadline: 'Feb 20', progress: 20, priority: 'Low',
            assignees: ['SJ', 'ED']
        }
    ];

    const priorityBadge = {
        'High': 'badge-orange',
        'Medium': 'badge-blue',
        'Low': 'badge-green'
    };

    return (
        <DashboardLayout
            title="Manager Dashboard"
            subtitle="Manage your team and projects"
            menuItems={menuItems}
            sidebarTitle="Manager Portal"
        >
            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
                {teamStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="card stat-card">
                            <div className="flex justify-between items-start mb-4">
                                <div style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '12px',
                                    background: stat.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: stat.color
                                }}>
                                    <Icon size={24} />
                                </div>
                                <TrendingUp size={18} color="#10b981" />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                {stat.value}
                            </div>
                            <div className="text-secondary text-sm font-bold">
                                {stat.label}
                            </div>
                            <div className="badge badge-purple mt-2" style={{ background: `${stat.color}10`, color: stat.color }}>
                                {stat.change}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Leave & Gigs */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Leave Requests Panel */}
                    <div className="card">
                        <div className="section-header">
                            <h3>Leave Requests</h3>
                            <a href="#" className="text-sm font-bold">View All</a>
                        </div>
                        <div className="flex flex-col gap-4">
                            {leaveRequests.map((req) => (
                                <div key={req.id} className="flex justify-between items-center p-3" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex items-center gap-3">
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: req.color, color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '0.875rem'
                                        }}>
                                            {req.avatar}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{req.employee}</div>
                                            <div className="text-xs text-secondary flex items-center gap-2">
                                                <span className="badge badge-purple" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>{req.type}</span>
                                                <span>{req.dates}</span>
                                                <span>• {req.days} days</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                                            <Check size={14} /> Accept
                                        </button>
                                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Gigs */}
                    <div className="card">
                        <div className="section-header">
                            <h3>Team Gigs & Projects</h3>
                            <a href="#" className="text-sm font-bold">View All</a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teamGigs.map((gig) => (
                                <div key={gig.id} style={{
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '1.25rem'
                                }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`badge ${priorityBadge[gig.priority]}`}>{gig.priority}</span>
                                        <MoreHorizontal size={16} className="text-secondary" />
                                    </div>
                                    <h4 className="font-bold mb-1">{gig.title}</h4>
                                    <p className="text-xs text-secondary mb-3">{gig.desc}</p>

                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-secondary">Progress</span>
                                            <span className="font-bold text-primary">{gig.progress}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#f3f4f6', borderRadius: '4px' }}>
                                            <div style={{ width: `${gig.progress}%`, height: '100%', background: 'var(--primary-purple)', borderRadius: '4px' }} />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-secondary">
                                        <div className="flex -space-x-2">
                                            {gig.assignees.map((initial, i) => (
                                                <div key={i} style={{
                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                    background: '#e5e7eb', border: '2px solid white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.65rem', fontWeight: 'bold'
                                                }}>
                                                    {initial}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon size={12} /> {gig.deadline}
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Calendar & Events */}
                <div className="lg:col-span-1">
                    <div className="card h-full">
                        <h3 className="mb-4">Calendar</h3>
                        {/* Simple month view placeholder/mock */}
                        <div style={{ textAlign: 'center', padding: '1rem 0', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>
                                <CalendarIcon size={48} style={{ display: 'inline-block' }} />
                            </div>
                            <p className="font-bold mt-2">February 2026</p>
                        </div>

                        <h4 className="text-sm font-bold text-muted mb-3">UPCOMING EVENTS</h4>
                        <div className="flex flex-col gap-3">
                            {[
                                { date: '4', day: 'Today', title: 'Team Standup', time: '10:00 AM' },
                                { date: '6', day: 'Thu', title: 'Sprint Planning', time: '2:00 PM' },
                                { date: '10', day: 'Mon', title: 'Sarah\'s Leave Starts', time: 'All Day' }
                            ].map((event, index) => (
                                <div key={index} className="flex gap-3 items-center p-2 rounded hover:bg-slate-50">
                                    <div style={{
                                        minWidth: '40px', height: '40px',
                                        borderRadius: '10px',
                                        background: index === 0 ? 'var(--primary-gradient)' : '#f3f4f6',
                                        color: index === 0 ? 'white' : 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        {event.date}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{event.title}</div>
                                        <div className="text-xs text-secondary">{event.day} • {event.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManagerDashboard;
