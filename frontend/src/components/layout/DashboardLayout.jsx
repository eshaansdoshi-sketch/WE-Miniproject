import React from 'react'
import Sidebar from './Sidebar'
import BackgroundPaths from '../ui/background-paths'
import { useAuth } from '../../AuthContext'
import { Bell, Settings, Search, LogOut, User } from 'lucide-react'

const DashboardLayout = ({ children, title = "Dashboard", subtitle = "Welcome back" }) => {
    const { user, userRole, signOut } = useAuth()

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            <Sidebar />

            {/* Main Content Area */}
            <div style={{ flex: 1, marginLeft: '260px', position: 'relative' }}>
                {/* Background Effect */}
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                    <div style={{
                        position: 'absolute', top: '-20%', left: '20%', width: '40vw', height: '40vw',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05), transparent 70%)', filter: 'blur(100px)'
                    }}></div>
                </div>

                {/* Header */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '30px 40px',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{title}</h1>
                        <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>{subtitle}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="icon-btn"><Search size={20} color="#888" /></div>
                            <div className="icon-btn"><Bell size={20} color="#888" /></div>
                            <div className="icon-btn"><Settings size={20} color="#888" /></div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: '#1a1a20',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: '1px solid #222'
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <User size={16} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '600' }}>User</div>
                                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>{userRole}</div>
                            </div>
                            <button
                                onClick={() => signOut()}
                                style={{
                                    background: 'transparent', border: '1px solid #333',
                                    padding: '6px 10px', borderRadius: '8px',
                                    color: '#ccc', fontSize: '12px', marginLeft: '10px',
                                    display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                                }}
                            >
                                <LogOut size={12} /> Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ padding: '0 40px 40px 40px', position: 'relative', zIndex: 10 }}>
                    {children}
                </main>
            </div>

            {/* Global Styles for Icons */}
            <style>{`
                .icon-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .icon-btn:hover {
                    background: rgba(255,255,255,0.05);
                }
            `}</style>
        </div>
    )
}

export default DashboardLayout
