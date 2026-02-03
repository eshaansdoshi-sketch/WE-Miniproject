import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Sparkles, Briefcase, Mail,
    Facebook, Twitch, Youtube, Chrome, Users, CreditCard,
    Activity, MapPin, Phone, Globe, Monitor
} from 'lucide-react'
import './LandingPage.css'
import BackgroundPaths from '../components/ui/background-paths'

const LandingPage = () => {
    const navigate = useNavigate()

    return (
        <BackgroundPaths className="landing-container">

            {/* Navbar - GenZ Branding */}
            <div className="navbar-wrapper">
                <nav className="landing-nav">
                    <div className="logo-container" onClick={() => navigate('/')}>
                        <span className="logo-text">hirrd.</span>
                    </div>

                    <div className="nav-links">
                        <span className="nav-link">Home</span>
                        <span className="nav-link">Features</span>
                        <span className="nav-link">Pricing</span>
                        <span className="nav-link">About</span>
                        <span className="nav-link">Contact</span>
                    </div>

                    <div className="nav-actions">
                        <span className="btn-login" onClick={() => navigate('/login')}>Log In</span>
                        <button className="btn-get-started" onClick={() => navigate('/login')}>Get Started</button>
                    </div>
                </nav>
            </div>

            {/* Hero Section */}
            <section className="hero-section">

                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Empower Your Hiring,<br />
                    Discover Your Ideal Team
                </motion.h1>

                <motion.p
                    className="hero-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    In a dynamic world where talent is the differentiator, our platform bridges the gap between ambitious enterprises and top-tier professionals.
                </motion.p>

                <motion.div
                    className="hero-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <button className="btn-hero-primary" onClick={() => navigate('/register')}>Apply Now</button>
                    <button className="btn-hero-secondary">Learn More</button>
                </motion.div>

                {/* Hero Image */}
                <div className="hero-image-wrapper">
                    <motion.div
                        className="image-frame-organic"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <img src="/hero-meeting.png" alt="Business Meeting" className="hero-img" />
                    </motion.div>

                    <motion.div className="floating-card card-left" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
                        <div className="ui-header"><div className="icon-box orange"><Mail size={16} /></div><span>Interview Progress</span></div>
                        <div className="ui-stat"><div className="stat-label"><span>Approved</span><span>85%</span></div><div className="progress-track"><div className="progress-fill fill-orange"></div></div></div>
                        <div className="ui-stat"><div className="stat-label"><span>Rejected</span><span>22%</span></div><div className="progress-track"><div className="progress-fill fill-gray"></div></div></div>
                    </motion.div>

                    <motion.div className="floating-card card-right" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 }}>
                        <div className="ui-header"><div className="icon-box purple"><Briefcase size={16} /></div><span>New Assignment</span></div>
                        <div className="ui-stat"><div className="stat-label"><span>Analysis</span><span>70%</span></div><div className="progress-track"><div className="progress-fill fill-purple"></div></div></div>
                    </motion.div>
                </div>

                {/* Logo Strip */}
                <motion.div className="logo-strip" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.2 }}>
                    <Facebook size={24} color="#64748B" /> <Chrome size={24} color="#64748B" /> <Monitor size={24} color="#64748B" /> <Youtube size={24} color="#64748B" /> <Twitch size={24} color="#64748B" />
                </motion.div>



            </section>

            {/* Features Section (White) */}
            <section className="features-section-internal">
                <div className="features-container-centered">

                    <motion.h2 className="features-headline-lavender">
                        Everything your HR team needs in one platform
                    </motion.h2>
                    <motion.p className="features-sub-lavender">
                        Streamline your company's internal operations. From candidate screening to onboarding and performance reviews.
                    </motion.p>

                    <div className="features-grid-3">
                        {[
                            { icon: Users, title: "Candidate Screening", desc: "Manage interviews, evaluations, and final hiring decisions efficiently from a central talent pool." },
                            { icon: CreditCard, title: "Payroll & Billing", desc: "Handle internal salary processing, leave requests, and billing cycles with automated tracking." },
                            { icon: Activity, title: "Performance Analytics", desc: "Track employee productivity, reviews, and gain actionable insights into your team's growth." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className="feature-lavender-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="lavender-icon-box"><feature.icon size={26} /></div>
                                <h3 className="feature-title-lavender">{feature.title}</h3>
                                <p className="feature-desc-lavender">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Dark Footer with TOP Curve */}
            <section className="footer-info-section">
                {/* White curve on TOP of black */}
                <div className="curve-top-container">
                    <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="#ffffff" fillOpacity="1" d="M0,64L60,80C120,96,240,128,360,128C480,128,600,96,720,80C840,64,960,64,1080,85.3C1200,107,1320,149,1380,170.7L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
                    </svg>
                </div>

                <div className="footer-content">

                    {/* Pic LEFT */}
                    <div className="footer-visual">
                        <img src="/globe-graphic.png" alt="Global HR" className="footer-globe-img" />
                    </div>

                    {/* Info RIGHT */}
                    <div className="footer-text">
                        <h2 className="footer-headline">Global Reach, Local Touch</h2>
                        <p className="footer-desc">
                            Ready to transform your HR operations? Get in touch with us to see how hirrd. can streamline your workforce management.
                        </p>

                        <div className="footer-details">
                            <div className="detail-row">
                                <MapPin size={20} />
                                <span>123 Innovation Dr, Tech City, CA 94043</span>
                            </div>
                            <div className="detail-row">
                                <Phone size={20} />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="detail-row">
                                <Globe size={20} />
                                <span>hello@hirrd.io</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </BackgroundPaths>
    )
}

export default LandingPage
