import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { getJobRoles } from '../api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Briefcase, ArrowRight, CheckCircle, Search } from 'lucide-react'

function Apply() {
    const { candidateData, updateCandidateData, STATUS } = useAuth()
    const navigate = useNavigate()

    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const menuItems = [
        { label: 'Select Role', path: '/applicant', icon: Briefcase },
        // Add more if needed, but for now this is the entry point
    ]

    useEffect(() => {
        // If role already selected, skip to upload
        if (candidateData?.selectedRoleId) {
            navigate('/applicant/upload')
            return
        }
        loadRoles()
    }, [candidateData?.selectedRoleId])

    const loadRoles = async () => {
        try {
            const data = await getJobRoles()
            if (data.success && data.job_roles?.length > 0) {
                setRoles(data.job_roles)
            } else {
                setError('No job roles available. Please check back later.')
            }
        } catch (err) {
            setError('Failed to load roles: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (role) => {
        setSelectedRole(role)
    }

    const handleContinue = () => {
        if (!selectedRole) return

        // Save selected role to candidate data
        updateCandidateData({
            selectedRoleId: selectedRole.id,
            selectedRoleName: selectedRole.role_name,
        })

        navigate('/applicant/upload')
    }

    if (loading) {
        return (
            <DashboardLayout title="Open Positions" menuItems={menuItems} sidebarTitle="Apply Now">
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <LoadingSpinner />
                    <p style={{ marginTop: '1rem', color: '#666' }}>Finding the perfect role for you...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout title="Open Positions" menuItems={menuItems} sidebarTitle="Apply Now">
                <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: '#fee2e2', background: '#fef2f2' }}>
                    <h3 style={{ color: '#ef4444' }}>Unable to load jobs</h3>
                    <p style={{ color: '#b91c1c' }}>{error}</p>
                    <button onClick={loadRoles} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Try Again</button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout
            title="Browse Open Roles"
            subtitle="Select a position to begin your application process."
            menuItems={menuItems}
            sidebarTitle="Careers"
        >
            <div className="dashboard-content" style={{ maxWidth: '900px' }}>

                <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {roles.map(role => {
                        const isSelected = selectedRole?.id === role.id
                        return (
                            <div
                                key={role.id}
                                onClick={() => handleSelect(role)}
                                className="card interactive-card"
                                style={{
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid #6366f1' : '1px solid transparent', // Focus ring
                                    background: isSelected ? '#f5f3ff' : 'white',
                                    transform: isSelected ? 'translateY(-2px)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{
                                        padding: '10px',
                                        borderRadius: '10px',
                                        background: isSelected ? '#6366f1' : '#eff6ff',
                                        color: isSelected ? 'white' : '#3b82f6'
                                    }}>
                                        <Briefcase size={20} />
                                    </div>
                                    {isSelected && <CheckCircle size={20} color="#6366f1" />}
                                </div>

                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
                                    {role.role_name}
                                </h3>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: '#e2e8f0',
                                        color: '#475569',
                                        textTransform: 'uppercase',
                                        fontWeight: '600'
                                    }}>
                                        {role.min_experience_level || 'Entry Level'}
                                    </span>
                                    {role.role_level && (
                                        <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }}>
                                            {role.role_level}
                                        </span>
                                    )}
                                </div>

                                {role.required_skills && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: '600' }}>Required Skills:</p>
                                        <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: '1.4' }}>
                                            {Array.isArray(role.required_skills)
                                                ? role.required_skills.slice(0, 4).join(', ')
                                                : role.required_skills}
                                            {role.required_skills.length > 4 && '...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Footer Action */}
                <div style={{
                    position: 'sticky',
                    bottom: '20px',
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid #e2e8f0',
                    marginTop: '2rem',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
                }}>
                    <div>
                        {selectedRole ? (
                            <p style={{ margin: 0, color: '#1e293b' }}>
                                Selected: <strong>{selectedRole.role_name}</strong>
                            </p>
                        ) : (
                            <p style={{ margin: 0, color: '#64748b' }}>Please select a role to continue</p>
                        )}
                    </div>
                    <button
                        onClick={handleContinue}
                        disabled={!selectedRole}
                        className="btn btn-primary"
                        style={{
                            padding: '12px 24px',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: selectedRole ? 1 : 0.5,
                            cursor: selectedRole ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Apply Now <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Apply
