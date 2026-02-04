import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { useAuth } from '../../AuthContext';

const Sidebar = ({ title = "HR Portal", menuItems = [] }) => {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <aside style={{
            width: '280px',
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'sticky',
            top: 0
        }}>
            {/* Brand / Logo Area */}
            <div style={{ padding: '2rem 1.5rem' }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {title}
                </h1>
            </div>

            {/* Navigation Menu */}
            <nav style={{ flex: 1, padding: '0 1rem' }}>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>
                                <NavLink
                                    to={item.path}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        color: isActive ? 'var(--primary-purple)' : 'var(--text-secondary)',
                                        background: isActive ? '#f3e8ff' : 'transparent',
                                        fontWeight: isActive ? '600' : '500',
                                        transition: 'all 0.2s',
                                    })}
                                >
                                    {Icon && <Icon size={20} />}
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User / Footer Area */}
            <div style={{
                padding: '1.5rem',
                borderTop: '1px solid var(--border-light)'
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={20} />
                    <span style={{ fontWeight: '500' }}>Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
