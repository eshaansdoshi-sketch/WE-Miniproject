import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
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
import LandingPage from './pages/LandingPage'

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeTasks from './pages/employee/EmployeeTasks'
import EmployeeLeave from './pages/employee/EmployeeLeave'
import EmployeeFeedback from './pages/employee/EmployeeFeedback'

// Protected route wrapper - with completed status guard for applicants
function ProtectedRoute({ children, requiredRole }) {
    const { user, userRole, loading, candidateData, STATUS } = useAuth()

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Role Validation Logic
    if (requiredRole) {
        // Strict check for admin
        if (requiredRole === 'admin' && userRole !== 'admin') {
            return <Navigate to="/applicant" replace />
        }

        // For employee/manager routes, we might ideally check userRole, 
        // but for this demo/recreation we allow mapped roles if needed. 
        // Assuming 'applicant' might act as employee if they navigate there for now, 
        // or we strictly enforce it. 
        // For simplicity: If required is 'employee', but role is 'applicant', we might BLOCK it 
        // unless we updated the backend to actually have 'employee' roles.
        // Let's assume the user is "promoted" or we are just showing the view.

        // Current Backend only supports: 'admin' and 'applicant'.
        // So 'Employee' and 'Manager' must map to one of these or be open.

        // Strategy: 
        // If route requires 'admin', strictly check 'admin'.
        // If route requires 'applicant', anyone can technically view if logged in (usually).
        // Since 'Employee' is a new concept on Frontend, we will allow 'applicant' role to view it 
        // IF they are navigating there (handled by Login redirect).
    }

    return children
}

function App() {
    const { user, userRole, loading, signOut, candidateData, STATUS } = useAuth()
    const location = useLocation()

    const handleLogout = async () => {
        // signOut now automatically clears candidate data
        await signOut()
    }

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
    }

    // Check if we are on the landing page (and user is not logged in)
    const isLandingPage = location.pathname === '/' && !user

    // Check if we are inside the Dashboard Layout (Employee/Manager pages)
    // or Admin that we might migrate later. 
    // For now, these pages handle their own Layout (DashboardLayout).
    // So we don't need the global nav for them.
    const isDashboardRoute = location.pathname.startsWith('/employee') || location.pathname.startsWith('/manager')

    return (
        <div>
            {/* Global Nav for Old Applicant Pages / Landing */}
            {!isLandingPage && !isDashboardRoute && (
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
                                    <Link to="/applicant/dashboard">My Status</Link>
                                    <Link to="/applicant">Apply</Link>
                                    <Link to="/applicant/upload">Upload</Link>
                                    {/* Temporary link to access new dashboard for demo */}
                                    <Link to="/employee" style={{ marginLeft: '20px', color: '#6366f1' }}>Switch to Employee View</Link>
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
            )}

            <div className={(isLandingPage || isDashboardRoute) ? '' : "container"}>
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

                    {/* New Employee Routes */}
                    <Route path="/employee" element={
                        <ProtectedRoute>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/employee/tasks" element={
                        <ProtectedRoute>
                            <EmployeeTasks />
                        </ProtectedRoute>
                    } />
                    <Route path="/employee/leave" element={
                        <ProtectedRoute>
                            <EmployeeLeave />
                        </ProtectedRoute>
                    } />
                    <Route path="/employee/feedback" element={
                        <ProtectedRoute>
                            <EmployeeFeedback />
                        </ProtectedRoute>
                    } />
                    {/* Placeholder for settings */}
                    <Route path="/employee/settings" element={
                        <ProtectedRoute>
                            <EmployeeDashboard /> {/* Redirect to dashboard for now */}
                        </ProtectedRoute>
                    } />


                    {/* Default redirect / Landing Page */}
                    <Route path="/" element={
                        user ? (
                            <Navigate to={userRole === 'admin' ? '/admin' : '/applicant/dashboard'} replace />
                        ) : (
                            <LandingPage />
                        )
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    )
}

export default App
