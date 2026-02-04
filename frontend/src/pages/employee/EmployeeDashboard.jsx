import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Clock,
    Briefcase,
    FileCheck,
    User,
    Settings,
    Plus,
    ChevronRight,
    MapPin,
    Calendar
} from 'lucide-react';

const EmployeeDashboard = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const menuItems = [
        { label: 'Dashboard', path: '/employee', icon: LayoutDashboard },
        { label: 'My Schedule (Calendar)', path: '/employee/schedule', icon: CalendarIcon },
        { label: 'My Leave Requests', path: '/employee/leave', icon: Clock },
        { label: 'Available Gigs', path: '/employee/gigs', icon: Briefcase },
        { label: 'My Applications', path: '/employee/applications', icon: FileCheck },
        { label: 'Profile', path: '/employee/profile', icon: User },
        { label: 'Settings', path: '/employee/settings', icon: Settings },
    ];

    const summaryCards = [
        { label: 'Leave Balance', value: '12 Days', sub: 'Annual Leave', color: 'var(--primary-purple)', icon: Clock },
        { label: 'Assigned Gigs', value: '2 Active', sub: '1 Pending Review', color: 'var(--info)', icon: Briefcase },
        { label: 'Upcoming Events', value: '3 Events', sub: 'This Week', color: 'var(--success)', icon: CalendarIcon },
    ];

    const availableGigs = [
        {
            id: 1,
            title: 'Frontend Developer for Internal Tool',
            department: 'Engineering',
            duration: '3 Months',
            type: 'Remote',
            tags: ['React', 'UI/UX']
        },
        {
            id: 2,
            title: 'Content Writer for HR Blog',
            department: 'Marketing',
            duration: '1 Month',
            type: 'Hybrid',
            tags: ['Writing', 'SEO']
        },
        {
            id: 3,
            title: 'Data Analysis Support',
            department: 'Sales',
            duration: '2 Weeks',
            type: 'Remote',
            tags: ['Excel', 'Data Entry']
        }
    ];

    return (
        <DashboardLayout
            title="Welcome back, Alex!"
            subtitle="Here's what's happening with your work today."
            menuItems={menuItems}
            sidebarTitle="My Portal"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
                {summaryCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="card stat-card">
                            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: `${card.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: card.color
                                }}>
                                    <Icon size={24} />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                {card.value}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {card.label} • <span style={{ color: card.color, fontWeight: '500' }}>{card.sub}</span>
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Gigs & Leave */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Quick Actions / Leave Request */}
                    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Need time off?</h3>
                            <p style={{ margin: 0 }}>Plan your leave in advance to keep the team synced.</p>
                        </div>
                        <button className="btn btn-primary">
                            <Plus size={18} />
                            New Leave Request
                        </button>
                    </div>

                    {/* Available Gigs */}
                    <div className="card">
                        <div className="section-header">
                            <h3>Available Gigs</h3>
                            <a href="#" className="text-sm font-bold">View All</a>
                        </div>
                        <div className="flex flex-col gap-4">
                            {availableGigs.map((gig) => (
                                <div key={gig.id} style={{
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '1rem',
                                    transition: 'background 0.2s'
                                }}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{gig.title}</h4>
                                            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                <span>{gig.department}</span>
                                                <span>•</span>
                                                <span>{gig.duration}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} /> {gig.type}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="btn btn-secondary text-sm">Apply Now</button>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {gig.tags.map((tag, i) => (
                                            <span key={i} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Calendar */}
                <div className="lg:col-span-1">
                    <div className="card h-full">
                        <h3 style={{ marginBottom: '1.5rem' }}>Calendar</h3>
                        {/* Simple month view placeholder/mock */}
                        <div style={{ textAlign: 'center', padding: '2rem 0', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '4rem', color: 'var(--text-muted)' }}>
                                <Calendar size={64} style={{ display: 'inline-block' }} />
                            </div>
                            <p>Calendar Widget</p>
                            <p className="text-sm">(Interactive calendar coming soon)</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-muted">UPCOMING</h4>
                            {[
                                { date: 'Feb 12', title: 'Team Sync', time: '10:00 AM' },
                                { date: 'Feb 14', title: 'Project Deadline', time: '5:00 PM' },
                                { date: 'Feb 20', title: 'Company Holiday', time: 'All Day' }
                            ].map((event, i) => (
                                <div key={i} className="flex gap-4 items-center p-2 rounded hover:bg-slate-50">
                                    <div style={{
                                        minWidth: '48px',
                                        textAlign: 'center',
                                        background: '#f1f5f9',
                                        padding: '0.5rem',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-purple)' }}>
                                            {event.date.split(' ')[0].toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                            {event.date.split(' ')[1]}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{event.title}</div>
                                        <div className="text-sm text-muted">{event.time}</div>
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

export default EmployeeDashboard;
