import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, MessageSquare, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../AuthContext'

const Sidebar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { signOut, userRole } = useAuth()

    const isActive = (path) => location.pathname === path

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    // Define navigation based on role
    // For now, we mainly focus on Employee as requested, but we can adapt.
    // The design shows: Dashboard, My Tasks, Leave Request, Give Feedback, Settings
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/employee' },
        { icon: CheckSquare, label: 'My Tasks', path: '/employee/tasks', badge: 8 },
        { icon: Calendar, label: 'Leave Request', path: '/employee/leave' },
        { icon: MessageSquare, label: 'Give Feedback', path: '/employee/feedback' },
        { icon: Settings, label: 'Settings', path: '/employee/settings' }, // Placeholder
    ]

    // Adjust for Admin/Manager if needed later, but sticking to the visual for now which is "Employee Dashboard-ish" 
    // or generic "PeoplePilot" sidebar.

    return (
        <div style={{
            width: '260px',
            height: '100vh',
            backgroundColor: '#111115', // Dark sidebar
            borderRight: '1px solid #222',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '10px' }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                }}>✨</div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>PeoplePilot</div>
                    <div style={{ fontSize: '10px', color: '#666', letterSpacing: '1px' }}>AI-POWERED HR</div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ flex: 1 }}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            marginBottom: '8px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            backgroundColor: isActive(item.path) ? 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)' : 'transparent',
                            background: isActive(item.path) ? 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)' : 'transparent',
                            color: isActive(item.path) ? '#fff' : '#888'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <item.icon size={20} />
                            <span style={{ fontSize: '14px', fontWeight: isActive(item.path) ? '600' : '400' }}>{item.label}</span>
                        </div>
                        {item.badge && (
                            <span style={{
                                backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : '#222',
                                color: isActive(item.path) ? '#fff' : '#666',
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontWeight: 'bold'
                            }}>
                                {item.badge}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            {/* Logout/User (Simplified for sidebar bottom) */}
            {/* Note: The design has user profile in TOP header usually, or bottom sidebar. 
                The screenshot shows specific User Profile on Top Right. 
                Sidebar is clean on bottom usually or has Settings. 
                We added Settings to nav items. 
            */}
        </div>
    )
}

export default Sidebar
