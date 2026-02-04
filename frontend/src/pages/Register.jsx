import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BackgroundPaths from '../components/ui/background-paths'
import { Shield, Brain, Users, User, ArrowLeft } from 'lucide-react'
import './Login.css' // Import shared styles

const Register = () => {
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(null)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const roles = [
        {
            id: 'applicant',
            name: 'Candidate',
            icon: User,
            description: 'Apply for jobs & track status',
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        },
        {
            id: 'employee',
            name: 'Employee',
            icon: Brain,
            description: 'Manage tasks & schedule',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
            id: 'manager',
            name: 'Manager',
            icon: Users,
            description: 'Lead teams & assign shifts',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
            id: 'admin',
            name: 'HR Admin',
            icon: Shield,
            description: 'Configure platform & roles',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedRole) {
            setError('Please select a role to create an account.')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data, error: signUpError } = await signUp(email, password)
            if (signUpError) throw signUpError

            if (data.user) {
                // Ensure role is valid for database enum
                const roleEnum = ['admin', 'manager', 'employee', 'applicant'];
                let roleToInsert = selectedRole === 'hr_admin' ? 'admin' : selectedRole;

                if (!roleEnum.includes(roleToInsert)) {
                    console.warn(`Invalid role ${roleToInsert}, defaulting to applicant`);
                    roleToInsert = 'applicant';
                }

                console.log(`Creating user with role: ${roleToInsert}`);

                // Insert into user_roles
                const { error: roleError } = await supabase.from('user_roles').insert({
                    user_id: data.user.id,
                    role: roleToInsert,
                });
                if (roleError) console.error('Error inserting user_role:', roleError);

                // Insert into profiles
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                    role: roleToInsert,
                    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
                });
                if (profileError) console.error('Error inserting profile:', profileError);

                setSuccess(true)
            }

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <BackgroundPaths className="login-container">
                <div className="login-content" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Account Created!</h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Your <strong>{roles.find(r => r.id === selectedRole)?.name}</strong> account is ready.
                            Please login to continue.
                        </p>
                        <Link to="/login">
                            <button className="btn btn-primary login-btn">Go to Login</button>
                        </Link>
                    </div>
                </div>
            </BackgroundPaths>
        )
    }

    return (
        <BackgroundPaths className="login-container">
            <div className="login-content">

                {/* Back Button */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd',
                            background: 'white', cursor: 'pointer', fontWeight: '600', color: '#555'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                </div>

                {/* Left Side - Info */}
                <motion.div
                    className="login-branding"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="brand-title">
                        Create <br />
                        <span className="gradient-text" style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Account</span>
                    </h1>
                    <p className="brand-subtitle" style={{ marginTop: '1rem' }}>
                        Join the intelligent HR platform.
                        Choose your role to get started.
                    </p>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                    className="login-form-container"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="glass-card login-card" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>

                        <h2>Create Account</h2>
                        <p className="login-subtitle">Choose your role and set up your details.</p>

                        <form onSubmit={handleSubmit} className="login-form">
                            {/* Role Selection */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">I am a...</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {roles.map((role) => {
                                        const Icon = role.icon
                                        const isSelected = selectedRole === role.id
                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setSelectedRole(role.id)}
                                                className={`role-card ${isSelected ? 'selected' : ''}`}
                                                style={{
                                                    flexDirection: 'column', textAlign: 'center', padding: '15px',
                                                    background: isSelected ? '#f3e8ff' : '#f8fafc',
                                                    borderColor: isSelected ? '#9333ea' : 'transparent',
                                                    borderWidth: '2px', borderStyle: 'solid', borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background: role.gradient, padding: '8px', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'white', marginBottom: '4px'
                                                    }}
                                                >
                                                    <Icon size={20} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>{role.name}</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{role.description}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="form-group">
                                <label className="input-label">Full Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label className="input-label">Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="input-label">Confirm</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div style={{ color: 'red', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary login-btn"
                                disabled={loading}
                                style={{ marginTop: '20px' }}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </BackgroundPaths>
    )
}

export default Register
