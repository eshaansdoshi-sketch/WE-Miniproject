import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { getJobRoles } from '../api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function Apply() {
    const { candidateData, updateCandidateData, STATUS } = useAuth()
    const navigate = useNavigate()

    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                <h1>Apply for a Position</h1>
                <LoadingSpinner />
                <p style={{ marginTop: 20 }}>Loading available positions...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <h1>Apply for a Position</h1>
                <p className="error">{error}</p>
            </div>
        )
    }

    return (
        <div>
            <h1>Apply for a Position</h1>
            <p>Select a role you'd like to apply for:</p>

            <div style={{ marginTop: 20 }}>
                {roles.map(role => (
                    <div
                        key={role.id}
                        onClick={() => handleSelect(role)}
                        style={{
                            padding: 20,
                            marginBottom: 15,
                            border: selectedRole?.id === role.id ? '2px solid #4caf50' : '1px solid #ddd',
                            borderRadius: 8,
                            cursor: 'pointer',
                            background: selectedRole?.id === role.id ? '#e8f5e9' : '#fff',
                        }}
                    >
                        <h3 style={{ margin: 0 }}>{role.role_name}</h3>
                        <p style={{ margin: '10px 0 0', color: '#666', fontSize: 14 }}>
                            Level: {role.role_level || role.min_experience_level || 'Any'}
                        </p>
                        {role.required_skills && (
                            <p style={{ margin: '5px 0 0', fontSize: 12, color: '#888' }}>
                                Skills: {Array.isArray(role.required_skills)
                                    ? role.required_skills.slice(0, 5).join(', ')
                                    : role.required_skills}
                                {role.required_skills.length > 5 && '...'}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleContinue}
                disabled={!selectedRole}
                style={{ marginTop: 20, padding: '12px 30px' }}
            >
                Continue with {selectedRole?.role_name || 'Selected Role'} →
            </button>
        </div>
    )
}

export default Apply
