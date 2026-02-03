import React from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Lock } from 'lucide-react'

const EmployeeFeedback = () => {
    return (
        <DashboardLayout title="Employee Dashboard" subtitle="Tasks, leave & feedback">

            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Anonymous Feedback</h2>

            <div style={{ backgroundColor: '#111115', borderRadius: '16px', border: '1px solid #222', padding: '30px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#666', fontSize: '13px' }}>
                    <Lock size={14} />
                    <span>Your feedback is completely anonymous. We value honest opinions to improve our workplace.</span>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', color: '#ccc' }}>Category</label>
                    <select style={{
                        width: '100%', padding: '12px 16px', backgroundColor: '#1a1a20',
                        border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none'
                    }}>
                        <option>General</option>
                        <option>Management</option>
                        <option>Work Environment</option>
                        <option>Benefits</option>
                    </select>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '12px', color: '#ccc' }}>Your Feedback</label>
                    <textarea
                        placeholder="Share your thoughts, concerns, or suggestions..."
                        style={{
                            width: '100%', padding: '12px 16px', backgroundColor: '#1a1a20',
                            border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none',
                            minHeight: '150px', resize: 'vertical'
                        }}
                    />
                </div>

                <button type="button" style={{
                    padding: '12px 24px', background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer'
                }}>
                    Submit Anonymously
                </button>
            </div>
        </DashboardLayout>
    )
}

export default EmployeeFeedback
