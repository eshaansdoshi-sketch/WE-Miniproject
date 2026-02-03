import React from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'

const EmployeeLeave = () => {
    return (
        <DashboardLayout title="Employee Dashboard" subtitle="Tasks, leave & feedback">

            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Request Leave</h2>

            <div style={{ backgroundColor: '#111115', borderRadius: '16px', border: '1px solid #222', padding: '30px', maxWidth: '800px' }}>
                <form>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', color: '#ccc' }}>Leave Type</label>
                        <select style={{
                            width: '100%', padding: '12px 16px', backgroundColor: '#1a1a20',
                            border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none'
                        }}>
                            <option>Vacation</option>
                            <option>Sick Leave</option>
                            <option>Personal</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', color: '#ccc' }}>Start Date</label>
                            <input type="date" style={{
                                width: '100%', padding: '12px 16px', backgroundColor: '#1a1a20',
                                border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none'
                            }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', color: '#ccc' }}>End Date</label>
                            <input type="date" style={{
                                width: '100%', padding: '12px 16px', backgroundColor: '#1a1a20',
                                border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none'
                            }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', color: '#ccc' }}>Reason</label>
                        <textarea
                            placeholder="Optional: Provide reason for leave..."
                            style={{
                                width: '100%', padding: '12px 16px', backgroundColor: '#1a1a20',
                                border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none',
                                minHeight: '100px', resize: 'vertical'
                            }}
                        />
                    </div>

                    <button type="button" style={{
                        padding: '12px 24px', background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                        border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer'
                    }}>
                        Submit Request
                    </button>
                </form>
            </div>

        </DashboardLayout>
    )
}

export default EmployeeLeave
