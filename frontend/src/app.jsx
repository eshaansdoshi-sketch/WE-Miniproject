import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useUser } from './UserContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ResumeUpload from './pages/ResumeUpload'
import Screening from './pages/Screening'
import TestPage from './pages/TestPage'
import AdminDashboard from './pages/AdminDashboard'
import Apply from './pages/Apply'

// Protected route wrapper
function ProtectedRoute({ children, requiredRole }) {
    const { user, userRole, loading } = useAuth()

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole && userRole !== requiredRole) {
        // Wrong role - redirect to appropriate dashboard
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />
        }
        return <Navigate to="/applicant" replace />
    }

    return children
}

function App() {
    const { user, userRole, loading, signOut } = useAuth()
    const { resetUser } = useUser()

    const handleLogout = async () => {
        await signOut()
        resetUser()
    }

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
    }

    return (
        <div>
            <nav>
                {!user ? (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) : (
                    <>
                        {userRole === 'admin' ? (
                            <>
                                <Link to="/admin">HR Dashboard</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/applicant">Apply</Link>
                                <Link to="/applicant/upload">Upload</Link>
                                <Link to="/applicant/screen">Screening</Link>
                                <Link to="/applicant/test">Tests</Link>
                            </>
                        )}
                        <span style={{ float: 'right' }}>
                            <span style={{ marginRight: 15, color: '#aaa', fontSize: 12 }}>
                                {user.email} ({userRole})
                            </span>
                            <button onClick={handleLogout} style={{ padding: '4px 12px', fontSize: 12 }}>
                                Logout
                            </button>
                        </span>
                    </>
                )}
            </nav>

            <div className="container">
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={
                        user ? <Navigate to={userRole === 'admin' ? '/admin' : '/applicant'} replace /> : <Login />
                    } />
                    <Route path="/register" element={
                        user ? <Navigate to={userRole === 'admin' ? '/admin' : '/applicant'} replace /> : <Register />
                    } />

                    {/* Admin routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Applicant routes */}
                    <Route path="/applicant" element={
                        <ProtectedRoute requiredRole="applicant">
                            <Apply />
                        </ProtectedRoute>
                    } />
                    <Route path="/applicant/upload" element={
                        <ProtectedRoute requiredRole="applicant">
                            <ResumeUpload />
                        </ProtectedRoute>
                    } />
                    <Route path="/applicant/screen" element={
                        <ProtectedRoute requiredRole="applicant">
                            <Screening />
                        </ProtectedRoute>
                    } />
                    <Route path="/applicant/test" element={
                        <ProtectedRoute requiredRole="applicant">
                            <TestPage />
                        </ProtectedRoute>
                    } />

                    {/* Default redirect */}
                    <Route path="/" element={
                        user ? (
                            <Navigate to={userRole === 'admin' ? '/admin' : '/applicant'} replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    )
}

export default App
