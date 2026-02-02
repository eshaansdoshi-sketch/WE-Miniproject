import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ResumeUpload from './pages/ResumeUpload'
import Screening from './pages/Screening'
import TestPage from './pages/TestPage'
import AdminDashboard from './pages/AdminDashboard'
import CandidateDetailPage from './pages/CandidateDetailPage'
import Apply from './pages/Apply'
import ApplicantDashboard from './pages/ApplicantDashboard'

// Protected route wrapper - with completed status guard for applicants
function ProtectedRoute({ children, requiredRole }) {
    const { user, userRole, loading, candidateData, STATUS } = useAuth()

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
    const { user, userRole, loading, signOut, candidateData, STATUS } = useAuth()

    const handleLogout = async () => {
        // signOut now automatically clears candidate data
        await signOut()
    }

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
    }

    // Check if candidate has an active application (anything beyond role selection)
    const hasApplication = candidateData?.candidateId
    // Check specific terminal statuses where no further action is needed
    const rawStatus = candidateData?.rawStatus?.toLowerCase()
    const isTerminalStatus = ['hired', 'rejected', 'interview'].includes(rawStatus)
    const isCompleted = candidateData?.status === STATUS?.COMPLETE

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
                                {/* Dashboard link - always visible when there's an application */}
                                {hasApplication && (
                                    <Link to="/applicant/dashboard">My Status</Link>
                                )}

                                {/* Only show flow tabs if NOT in terminal status */}
                                {!isTerminalStatus && !isCompleted && (
                                    <>
                                        <Link to="/applicant">Apply</Link>
                                        <Link to="/applicant/upload">Upload</Link>
                                        <Link to="/applicant/screen">Screening</Link>
                                        <Link to="/applicant/test">Tests</Link>
                                    </>
                                )}

                                {/* Show completed badge */}
                                {(isTerminalStatus || isCompleted) && (
                                    <span style={{ color: '#4caf50', fontWeight: 'bold', marginLeft: 10 }}>
                                        {rawStatus === 'hired' ? '🎉 Hired!' :
                                            rawStatus === 'interview' ? '🎯 Interview' :
                                                rawStatus === 'rejected' ? '' : '✓ Complete'}
                                    </span>
                                )}
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
                        user ? <Navigate to={userRole === 'admin' ? '/admin' : '/applicant/dashboard'} replace /> : <Login />
                    } />
                    <Route path="/register" element={
                        user ? <Navigate to={userRole === 'admin' ? '/admin' : '/applicant/dashboard'} replace /> : <Register />
                    } />

                    {/* Admin routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/candidate/:candidateId" element={
                        <ProtectedRoute requiredRole="admin">
                            <CandidateDetailPage />
                        </ProtectedRoute>
                    } />

                    {/* Applicant routes */}
                    <Route path="/applicant" element={
                        <ProtectedRoute requiredRole="applicant">
                            <Apply />
                        </ProtectedRoute>
                    } />
                    <Route path="/applicant/dashboard" element={
                        <ProtectedRoute requiredRole="applicant">
                            <ApplicantDashboard />
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
                            <Navigate to={userRole === 'admin' ? '/admin' : '/applicant/dashboard'} replace />
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
