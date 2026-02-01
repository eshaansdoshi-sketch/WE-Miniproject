import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

function Login() {
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Sign in and get session
            const { data } = await signIn(email, password)

            if (!data?.user?.id) {
                throw new Error('Login failed - no user returned')
            }

            // Fetch role from user_roles table
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', data.user.id)
                .single()

            // Determine role (default to applicant)
            const role = roleData?.role || 'applicant'

            // Redirect based on role
            if (role === 'admin') {
                navigate('/admin')
            } else {
                navigate('/applicant')
            }
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
            <h1>Login</h1>

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

                <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {error && <p className="error" style={{ marginTop: 15 }}>{error}</p>}

            <p style={{ marginTop: 20, textAlign: 'center' }}>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}

export default Login
