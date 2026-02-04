import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Briefcase,
    Users,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react'
import { useAuth } from '../../AuthContext'

const ManagerSidebar = () => {
    const location = useLocation()
    const { signOut } = useAuth()

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/manager' },
        { icon: Calendar, label: 'Calendar', path: '/manager/calendar' },
        { icon: FileText, label: 'Leave Requests', path: '/manager/leave-requests' },
        { icon: Briefcase, label: 'Team Gigs', path: '/manager/team-gigs' },
        { icon: Users, label: 'Employees', path: '/manager/employees' },
        { icon: BarChart3, label: 'Reports', path: '/manager/reports' },
        { icon: Settings, label: 'Settings', path: '/manager/settings' },
    ]

    const isActive = (path) => {
        if (path === '/manager') {
            return location.pathname === '/manager'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            boxShadow: '4px 0 24px rgba(139, 92, 246, 0.04)'
        }}>
            {/* Logo Section */}
            <div style={{
                padding: '28px 24px',
                borderBottom: '1px solid #f0f0f5'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                    }}>
                        <span style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>H</span>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1f2937',
                            letterSpacing: '-0.5px'
                        }}>
                            HR Portal
                        </div>
                        <div style={{ fontSize: '11px', color: '#9333ea', fontWeight: '500' }}>
                            Manager View
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                padding: '20px 16px',
                overflowY: 'auto'
            }}>
                <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    marginLeft: '12px'
                }}>
                    Main Menu
                </div>

                {navItems.map((item, index) => {
                    const active = isActive(item.path)
                    const Icon = item.icon

                    return (
                        <Link
                            key={index}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '14px 16px',
                                marginBottom: '6px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: active ? '#9333ea' : '#6b7280',
                                background: active
                                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%)'
                                    : 'transparent',
                                fontWeight: active ? '600' : '500',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = 'rgba(147, 51, 234, 0.05)'
                                    e.currentTarget.style.color = '#7c3aed'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = '#6b7280'
                                }
                            }}
                        >
                            {/* Active indicator */}
                            {active && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '4px',
                                    height: '24px',
                                    borderRadius: '0 4px 4px 0',
                                    background: 'linear-gradient(180deg, #9333ea, #a855f7)'
                                }} />
                            )}

                            <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: active
                                    ? 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)'
                                    : '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                boxShadow: active ? '0 4px 12px rgba(147, 51, 234, 0.25)' : 'none'
                            }}>
                                <Icon
                                    size={18}
                                    color={active ? '#ffffff' : '#6b7280'}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                            </div>
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout Section */}
            <div style={{
                padding: '20px 16px',
                borderTop: '1px solid #f0f0f5'
            }}>
                <button
                    onClick={() => signOut()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        width: '100%',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fee2e2'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fef2f2'
                    }}
                >
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LogOut size={18} color="#dc2626" />
                    </div>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default ManagerSidebar
