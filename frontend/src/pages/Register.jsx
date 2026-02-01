import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

function Register() {
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

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
            const data = await signUp(email, password)

            if (data.user) {
                // Check if any admin exists
                const { data: adminCheck } = await supabase
                    .from('user_roles')
                    .select('id')
                    .eq('role', 'admin')
                    .limit(1)

                // First user becomes admin, others become applicant
                const assignedRole = (!adminCheck || adminCheck.length === 0) ? 'admin' : 'applicant'

                await supabase.from('user_roles').insert({
                    user_id: data.user.id,
                    role: assignedRole,
                })
            }

            setSuccess(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, textAlign: 'center' }}>
                <h1>✓ Registration Successful!</h1>
                <p>Please check your email to verify your account.</p>
                <Link to="/login">
                    <button style={{ marginTop: 20 }}>Go to Login</button>
                </Link>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 15 }}>
                    <label>Email:</label><br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: 10 }}
                    />
                </div>

                <div style={{ marginBottom: 15 }}>
                    <label>Password:</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: 10 }}
                    />
                </div>

                <div style={{ marginBottom: 15 }}>
                    <label>Confirm Password:</label><br />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: 10 }}
                    />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
                    {loading ? 'Creating account...' : 'Register'}
                </button>
            </form>

            {error && <p className="error" style={{ marginTop: 15 }}>{error}</p>}

            <p style={{ marginTop: 20, textAlign: 'center' }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    )
}

export default Register
