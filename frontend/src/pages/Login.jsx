import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Sparkles, Shield, Brain, Users } from 'lucide-react'
import { useAuth } from '../AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BackgroundPaths from '../components/ui/background-paths'
import './Login.css'

const Login = () => {
    const navigate = useNavigate()
    const { signIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(null)
    const [error, setError] = useState(null)

    const roles = [
        {
            id: 'hr_admin',
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
            id: 'employee',
            name: 'Employee',
            icon: Brain,
            description: 'Tasks, leave & feedback',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
    ]

    const handleLogin = async (e) => {
        e.preventDefault()

        setLoading(true)
        setError(null)

        try {
            const result = await signIn(email, password)

            if (!result?.user?.id) throw new Error('Login failed')

            const actualRole = result.user.role || 'applicant'

            switch (actualRole) {
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

        } catch (err) {
            console.error('Login error:', err)
            setError(err.message || 'Login failed')
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
                        <span className="gradient-text" style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PeoplePilot AI</span>
                    </h1>

                    <p className="brand-subtitle">
                        Intelligent HR Platform with Explainable AI
                    </p>

                    <div className="brand-features">
                        {[
                            'AI-Powered Hiring',
                            'Wellbeing Insights',
                            'Human-Centric Decisions',
                            'Privacy First'
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

                {/* Right Side - Login Form */}
                <motion.div
                    className="login-form-container"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="glass-card login-card" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <h2>Welcome Back</h2>
                        <p className="login-subtitle">Sign in to continue to your dashboard</p>

                        {/* Role Selection */}
                        <div className="role-selection">
                            <label className="input-label">Select Your Role</label>
                            <div className="role-grid">
                                {roles.map((role) => {
                                    const Icon = role.icon
                                    return (
                                        <motion.button
                                            key={role.id}
                                            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedRole(role.id)}
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

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="login-form">
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
                                <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error}</div>
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
                                {loading ? 'Signing In...' : (
                                    <>
                                        <LogIn size={20} />
                                        Sign In
                                    </>
                                )}
                            </motion.button>
                            {loading && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                                    <LoadingSpinner />
                                </div>
                            )}
                        </form>

                        {/* Quick Links */}
                        <div className="login-footer">
                            <Link to="/register" className="link font-bold text-primary hover:text-purple-700">
                                Create Account
                            </Link>
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
