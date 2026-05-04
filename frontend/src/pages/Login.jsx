import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Sparkles, Shield, Users, User } from 'lucide-react'
import { useAuth } from '../AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BackgroundPaths from '../components/ui/background-paths'
import './Login.css'

const Login = () => {
    const navigate = useNavigate()
    const { signIn, signUp } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(null)
    const [error, setError] = useState(null)
    const [isNewUser, setIsNewUser] = useState(false)

    const roles = [
        {
            id: 'admin',
            name: 'HR / Admin',
            icon: Shield,
            description: 'Manage hiring, policies & insights',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
            id: 'manager',
            name: 'Manager',
            icon: Users,
            description: 'Lead teams & view insights',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
            id: 'applicant',
            name: 'Candidate',
            icon: User,
            description: 'Apply for jobs & track status',
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        },
    ]

    const navigateByRole = (role) => {
        switch (role) {
            case 'admin':
            case 'hr_admin':
                navigate('/admin')
                break
            case 'manager':
                navigate('/manager')
                break
            case 'applicant':
            default:
                navigate('/applicant/dashboard')
                break
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedRole) {
            setError('Please select your role first.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            if (isNewUser) {
                // Register flow
                if (!fullName.trim()) {
                    setError('Please enter your full name.')
                    setLoading(false)
                    return
                }
                try {
                    const result = await signUp(email, password, fullName, selectedRole)
                    navigateByRole(result.user.role)
                } catch (regErr) {
                    // If email already registered, switch back to login mode
                    if (regErr.message?.toLowerCase().includes('already registered')) {
                        setIsNewUser(false)
                        setError('This email is already registered. Please sign in with your password.')
                    } else {
                        throw regErr
                    }
                }
            } else {
                // Login flow
                const result = await signIn(email, password)
                if (!result?.user?.id) throw new Error('Login failed')
                navigateByRole(result.user.role)
            }
        } catch (err) {
            console.error('Auth error:', err)
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <BackgroundPaths className="login-container">

            {/* Main Content */}
            <div className="login-content">
                {/* Left Side - Branding */}
                <motion.div
                    className="login-branding"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="logo-container"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Sparkles className="logo-icon" size={48} />
                    </motion.div>

                    <h1 className="brand-title">
                        <span className="gradient-text" style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>hirrd.</span>
                    </h1>

                    <p className="brand-subtitle">
                        AI-Powered Recruitment & Workspace Ecosystem
                    </p>

                    <div className="brand-features">
                        {[
                            'AI-Powered Hiring',
                            'Intelligent Talent Matching',
                            'Real-Time Performance Evaluation',
                            'Continuous Skill Development'
                        ].map((feature, index) => (
                            <motion.div
                                key={feature}
                                className="feature-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <div className="feature-dot"></div>
                                <span>{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Side - Login/Register Form */}
                <motion.div
                    className="login-form-container"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="glass-card login-card" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <h2>{isNewUser ? 'Create Account' : 'Welcome Back'}</h2>
                        <p className="login-subtitle">
                            {isNewUser ? 'Fill in your details to get started' : 'Select your role and sign in — or create a new account'}
                        </p>

                        {/* Role Selection */}
                        <div className="role-selection">
                            <label className="input-label">I am a...</label>
                            <div className="role-grid">
                                {roles.map((role) => {
                                    const Icon = role.icon
                                    return (
                                        <motion.button
                                            key={role.id}
                                            type="button"
                                            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                                            onClick={() => { setSelectedRole(role.id); setError(null) }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                background: selectedRole === role.id ? role.gradient : 'rgba(255, 255, 255, 0.5)'
                                            }}
                                        >
                                            <Icon size={24} />
                                            <div className="role-info">
                                                <div className="role-name">{role.name}</div>
                                                <div className="role-desc">{role.description}</div>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="login-form">
                            {/* Full Name — only shown for new users */}
                            {isNewUser && (
                                <motion.div className="form-group" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                                    <label className="input-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={isNewUser}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                    />
                                </motion.div>
                            )}

                            <div className="form-group">
                                <label className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="your.email@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="input-label">Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    color: isNewUser && error.includes('Fill in') ? '#f59e0b' : '#ef4444',
                                    background: isNewUser && error.includes('Fill in') ? '#fef3c7' : '#fee2e2',
                                    padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem',
                                    fontWeight: 500, marginTop: '5px'
                                }}>{error}</div>
                            )}

                            <motion.button
                                type="submit"
                                className="btn btn-primary login-btn"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {loading ? (isNewUser ? 'Creating Account...' : 'Signing In...') : (
                                    <>
                                        <LogIn size={20} />
                                        {isNewUser ? 'Create Account & Sign In' : 'Sign In'}
                                    </>
                                )}
                            </motion.button>
                            {loading && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                                    <LoadingSpinner />
                                </div>
                            )}
                        </form>

                        {/* Toggle between modes */}
                        <div className="login-footer">
                            <span
                                className="link font-bold text-primary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => { setIsNewUser(!isNewUser); setError(null) }}
                            >
                                {isNewUser ? '← Back to Sign In' : 'New here? Create Account'}
                            </span>
                            <span className="separator">•</span>
                            <a href="#" className="link">
                                Trust & Privacy
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </BackgroundPaths>
    )
}

export default Login
