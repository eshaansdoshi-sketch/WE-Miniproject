import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Briefcase, ArrowRight, CheckCircle } from 'lucide-react'

// ── Hardcoded job roles ──────────────────────────────────────
const HARDCODED_ROLES = [
    {
        id: 'role_001',
        role_name: 'Senior Full-Stack Developer',
        min_experience_level: 'Senior',
        required_skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'REST APIs'],
        preferred_skills: ['Docker', 'AWS', 'GraphQL'],
        description: 'Build and maintain our core platform using modern web technologies.'
    },
    {
        id: 'role_002',
        role_name: 'Machine Learning Engineer',
        min_experience_level: 'Mid',
        required_skills: ['Python', 'TensorFlow', 'Scikit-learn', 'SQL'],
        preferred_skills: ['PyTorch', 'MLOps', 'Kubernetes'],
        description: 'Design and deploy ML models for our AI-powered recruitment engine.'
    },
    {
        id: 'role_003',
        role_name: 'UI/UX Designer',
        min_experience_level: 'Junior',
        required_skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
        preferred_skills: ['Framer', 'Motion Design', 'CSS'],
        description: 'Craft beautiful, intuitive interfaces for our hiring platform.'
    },
    {
        id: 'role_004',
        role_name: 'DevOps Engineer',
        min_experience_level: 'Mid',
        required_skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
        preferred_skills: ['AWS', 'Monitoring', 'Ansible'],
        description: 'Manage infrastructure, pipelines, and deployments at scale.'
    },
    {
        id: 'role_005',
        role_name: 'Data Analyst',
        min_experience_level: 'Junior',
        required_skills: ['SQL', 'Python', 'Excel', 'Tableau'],
        preferred_skills: ['Power BI', 'R', 'Statistics'],
        description: 'Analyze hiring data and generate insights to improve recruitment outcomes.'
    },
    {
        id: 'role_006',
        role_name: 'Backend Engineer (Java)',
        min_experience_level: 'Senior',
        required_skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'],
        preferred_skills: ['Kafka', 'Redis', 'gRPC'],
        description: 'Architect and build high-performance backend services.'
    },
]

function Apply() {
    const { candidateData, updateCandidateData } = useAuth()
    const navigate = useNavigate()

    const [selectedRole, setSelectedRole] = useState(null)

    const menuItems = [
        { label: 'Select Role', path: '/applicant', icon: Briefcase },
    ]

    // If role already selected, skip to upload
    if (candidateData?.selectedRoleId) {
        navigate('/applicant/upload')
        return null
    }

    const handleSelect = (role) => setSelectedRole(role)

    const handleContinue = () => {
        if (!selectedRole) return
        updateCandidateData({
            selectedRoleId: selectedRole.id,
            selectedRoleName: selectedRole.role_name,
        })
        navigate('/applicant/upload')
    }

    return (
        <DashboardLayout
            title="Browse Open Roles"
            subtitle="Select a position to begin your application process."
            menuItems={menuItems}
            sidebarTitle="Careers"
        >
            <div className="dashboard-content" style={{ maxWidth: '900px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {HARDCODED_ROLES.map(role => {
                        const isSelected = selectedRole?.id === role.id
                        return (
                            <div
                                key={role.id}
                                onClick={() => handleSelect(role)}
                                className="card interactive-card"
                                style={{
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid #6366f1' : '1px solid transparent',
                                    background: isSelected ? '#f5f3ff' : 'white',
                                    transform: isSelected ? 'translateY(-2px)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{
                                        padding: '10px', borderRadius: '10px',
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
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                                    {role.description}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px',
                                        background: '#e2e8f0', color: '#475569', textTransform: 'uppercase', fontWeight: '600'
                                    }}>
                                        {role.min_experience_level}
                                    </span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: '600' }}>Required Skills:</p>
                                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: '1.4' }}>
                                        {role.required_skills.slice(0, 4).join(', ')}
                                        {role.required_skills.length > 4 && '...'}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer Action */}
                <div style={{
                    position: 'sticky', bottom: '20px', padding: '1.5rem',
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                    borderTop: '1px solid #e2e8f0', marginTop: '2rem', borderRadius: '16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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
                            padding: '12px 24px', fontSize: '1rem',
                            display: 'flex', alignItems: 'center', gap: '8px',
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
