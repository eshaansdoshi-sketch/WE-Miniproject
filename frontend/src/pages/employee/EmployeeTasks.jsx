import React from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const EmployeeTasks = () => {
    // Mock Calendar Rendering
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    // Simple mock grid for Feb 2026 starting Sunday (Just generic structure)
    // Feb 1 2026 is actually a Sunday.
    const monthDates = Array.from({ length: 28 }, (_, i) => i + 1)

    return (
        <DashboardLayout title="Employee Dashboard" subtitle="Tasks, leave & feedback">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>My Schedule</h2>
                    <p style={{ color: '#888', fontSize: '14px' }}>Track your assigned tasks and deadlines</p>
                </div>

                <div style={{ display: 'flex', backgroundColor: '#111115', padding: '4px', borderRadius: '8px', border: '1px solid #333' }}>
                    <button style={{ padding: '8px 16px', borderRadius: '6px', background: '#6366f1', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600' }}>Calendar</button>
                    <button style={{ padding: '8px 16px', borderRadius: '6px', background: 'transparent', color: '#888', border: 'none', fontSize: '12px', fontWeight: '600' }}>List</button>
                </div>
            </div>

            <div style={{ backgroundColor: '#111115', borderRadius: '16px', border: '1px solid #222', overflow: 'hidden' }}>
                {/* Calendar Header */}
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ background: '#1a1a20', border: 'none', padding: '8px', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>February 2026</div>
                        <button style={{ background: '#1a1a20', border: 'none', padding: '8px', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                    </div>
                    <button style={{ background: '#4338ca', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#fff', fontSize: '12px' }}>Today</button>
                </div>

                {/* Days Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '15px', borderBottom: '1px solid #222' }}>
                    {days.map(day => (
                        <div key={day} style={{ textAlign: 'center', fontSize: '12px', color: '#888', fontWeight: '600' }}>{day}</div>
                    ))}
                </div>

                {/* Dates Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '500px' }}>
                    {monthDates.map(date => (
                        <div key={date} style={{
                            borderRight: '1px solid #222',
                            borderBottom: '1px solid #222',
                            padding: '10px',
                            minHeight: '100px',
                            position: 'relative'
                        }}>
                            <div style={{ fontSize: '12px', color: '#fff', marginBottom: '5px' }}>{date}</div>
                            {date === 5 && (
                                <div style={{
                                    fontSize: '10px', backgroundColor: '#1a1a20', padding: '4px 6px',
                                    borderRadius: '4px', borderLeft: '2px solid #f59e0b', color: '#ccc'
                                }}>
                                    Complete Pr...
                                </div>
                            )}
                            {/* Highlight selection mockup for 4th */}
                            {date === 4 && (
                                <div style={{
                                    position: 'absolute', inset: '2px',
                                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid #6366f1', borderRadius: '4px',
                                    zIndex: 0
                                }}></div>
                            )}
                        </div>
                    ))}
                    {/* Fill remaining empty cells for 5 weeks approx */}
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                        <div key={`next-${d}`} style={{ borderRight: '1px solid #222', borderBottom: '1px solid #222', padding: '10px', opacity: 0.3 }}>{d}</div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default EmployeeTasks
