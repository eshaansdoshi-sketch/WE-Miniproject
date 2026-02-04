import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ArrowLeft } from 'lucide-react';

const DashboardLayout = ({ children, title, subtitle, menuItems, sidebarTitle }) => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <Sidebar title={sidebarTitle} menuItems={menuItems} />

            <main className="main-content">
                {/* Page Header */}
                <header style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary flex items-center gap-2 mb-4 text-sm"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>{title}</h2>
                            {subtitle && <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
