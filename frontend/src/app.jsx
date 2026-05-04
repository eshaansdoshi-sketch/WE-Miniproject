import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ResumeUpload from './pages/ResumeUpload'
import Screening from './pages/Screening'
import TestPage from './pages/TestPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminReports from './pages/AdminReports'
import AdminTasks from './pages/admin/AdminTasks'
import AdminLeavePolicies from './pages/admin/AdminLeavePolicies'
import AdminGigs from './pages/admin/AdminGigs'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRoles from './pages/admin/AdminRoles'
import AdminSettings from './pages/admin/AdminSettings'
import CandidateDetailPage from './pages/CandidateDetailPage'
import Apply from './pages/Apply'
import ApplicantDashboard from './pages/ApplicantDashboard'
import LandingPage from './pages/LandingPage'

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManagerSchedule from './pages/manager/ManagerSchedule'
import ManagerLeaveRequests from './pages/manager/ManagerLeaveRequests'
import ManagerGigs from './pages/manager/ManagerGigs'
import ManagerEmployees from './pages/manager/ManagerEmployees'
import ManagerReports from './pages/manager/ManagerReports'
import ManagerSettings from './pages/manager/ManagerSettings'

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
        if (requiredRole === 'admin' && userRole !== 'admin' && userRole !== 'hr_admin') {
            return <Navigate to="/applicant" replace />
        }
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

    // Check if we are inside the Dashboard Layout (Employee/Manager/Admin/Applicant pages)
    // These pages handle their own Layout (DashboardLayout).
    const isDashboardRoute = location.pathname.startsWith('/employee') ||
        location.pathname.startsWith('/manager') ||
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/applicant')

    return (
        <div>
            {/* Global Nav only for public pages (Login/Register) */}
            {!isLandingPage && !isDashboardRoute && !user && (
                <nav>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </nav>
            )}

            {/* Admin logout fallback if not in dashboard (rare case) */}
            {!isLandingPage && !isDashboardRoute && userRole === 'admin' && (
                <nav>
                    <Link to="/admin">HR Dashboard</Link>
                    <span style={{ float: 'right' }}>
                        <span style={{ marginRight: 15, color: '#aaa', fontSize: 12 }}>
                            {user.email} ({userRole})
                        </span>
                        <button onClick={handleLogout} style={{ padding: '4px 12px', fontSize: 12 }}>
                            Logout
                        </button>
                    </span>
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
                    <Route path="/admin/reports" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminReports />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/tasks" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminTasks />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/candidate/:candidateId" element={
                        <ProtectedRoute requiredRole="admin">
                            <CandidateDetailPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/policies" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminLeavePolicies />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/gigs" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminGigs />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminUsers />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/roles" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminRoles />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminSettings />
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

                    {/* Employee routes removed — use /manager for team management */}

                    {/* Manager Routes */}
                    <Route path="/manager" element={
                        <ProtectedRoute>
                            <ManagerDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/schedule" element={
                        <ProtectedRoute>
                            <ManagerSchedule />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/leave-requests" element={
                        <ProtectedRoute>
                            <ManagerLeaveRequests />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/gigs" element={
                        <ProtectedRoute>
                            <ManagerGigs />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/employees" element={
                        <ProtectedRoute>
                            <ManagerEmployees />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/reports" element={
                        <ProtectedRoute>
                            <ManagerReports />
                        </ProtectedRoute>
                    } />
                    <Route path="/manager/settings" element={
                        <ProtectedRoute>
                            <ManagerSettings />
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
        </div >
    )
}

export default App
