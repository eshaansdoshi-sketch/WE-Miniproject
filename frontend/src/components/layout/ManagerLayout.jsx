import React from 'react'
import ManagerSidebar from './ManagerSidebar'
import { useAuth } from '../../AuthContext'
import { Bell, Search, User, ChevronDown } from 'lucide-react'

const ManagerLayout = ({ children, title = "Dashboard", subtitle = "Welcome back" }) => {
    const { user, userRole } = useAuth()

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f8f9fc',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            <ManagerSidebar />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                marginLeft: '260px',
                position: 'relative',
                minHeight: '100vh'
            }}>
                {/* Subtle Background Pattern */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: '260px',
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    background: `
                        radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.02) 0%, transparent 50%)
                    `
                }}>
                    {/* Dot pattern overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                        opacity: 0.4
                    }} />
                </div>

                {/* Header */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 32px',
                    position: 'relative',
                    zIndex: 10,
                    background: 'rgba(248, 249, 252, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(229, 231, 235, 0.6)'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '26px',
                            fontWeight: '700',
                            margin: 0,
                            color: '#1f2937',
                            letterSpacing: '-0.5px'
                        }}>
                            {title}
                        </h1>
                        <p style={{
                            color: '#6b7280',
                            marginTop: '6px',
                            fontSize: '14px',
                            fontWeight: '400'
                        }}>
                            {subtitle}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Search Bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 16px',
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                        }}>
                            <Search size={18} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: '#374151',
                                    background: 'transparent',
                                    width: '180px'
                                }}
                            />
                        </div>

                        {/* Notification Bell */}
                        <button style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                            transition: 'all 0.2s ease'
                        }}>
                            <Bell size={20} color="#6b7280" />
                            {/* Notification dot */}
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                border: '2px solid #ffffff'
                            }} />
                        </button>

                        {/* User Profile */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px 8px 8px',
                            background: '#ffffff',
                            borderRadius: '14px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                            cursor: 'pointer'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(147, 51, 234, 0.25)'
                            }}>
                                <User size={18} color="#ffffff" />
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                }}>
                                    Manager
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#9333ea',
                                    fontWeight: '500'
                                }}>
                                    {userRole || 'Admin'}
                                </div>
                            </div>
                            <ChevronDown size={16} color="#9ca3af" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{
                    padding: '24px 32px 40px 32px',
                    position: 'relative',
                    zIndex: 10
                }}>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default ManagerLayout
