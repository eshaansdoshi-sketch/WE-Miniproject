import React, { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { CheckSquare, Calendar, MessageSquare, BarChart2, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const EmployeeDashboard = () => {
    // Mock Data
    const stats = [
        { label: 'Active Tasks', value: '1', sub: '1 high priority', icon: CheckSquare, color: '#6366f1' },
        { label: 'Leave Balance', value: '12', sub: 'days remaining', icon: Calendar, color: '#ec4899' },
        { label: 'Pending Requests', value: '0', sub: 'Awaiting approval', icon: MessageSquare, color: '#06b6d4' },
        { label: 'This Week', value: '32h', sub: '4h remaining', icon: BarChart2, color: '#10b981' },
    ]

    const tasks = [
        { id: 1, title: 'Complete Project Documentation', check: false, priority: 'HIGH', status: 'pending' },
        // Add more tasks if needed
    ]

    return (
        <DashboardLayout title="Employee Dashboard" subtitle="Tasks, leave & feedback">
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {stats.map((stat, index) => (
                    <div key={index} style={{
                        backgroundColor: '#111115',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #222',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ color: '#888', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {stat.label}
                            </div>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <stat.icon size={16} color={stat.color} />
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{stat.value}</div>
                        <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#1a1a20', fontSize: '11px', color: '#999' }}>
                            {stat.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* My Tasks Section */}
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>My Tasks</h2>
            <div style={{ backgroundColor: '#111115', borderRadius: '16px', padding: '20px', border: '1px solid #222', minHeight: '150px', marginBottom: '30px' }}>
                {tasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderBottom: '1px solid #1a1a20' }}>
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '6px', border: '2px solid #444', cursor: 'pointer'
                        }}></div>
                        <div>
                            <div style={{ fontSize: '14px', marginBottom: '5px' }}>{task.title}</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f59e0b', color: '#000', fontWeight: 'bold' }}>HIGH</span>
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#333', color: '#aaa', fontWeight: 'bold' }}>pending</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upcoming Leave Section */}
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Upcoming Leave</h2>
            <div style={{ backgroundColor: '#111115', borderRadius: '16px', padding: '30px', border: '1px solid #222' }}>
                <div style={{ color: '#444', fontSize: '14px' }}>No upcoming approved leaves</div>
            </div>
        </DashboardLayout>
    )
}

export default EmployeeDashboard
