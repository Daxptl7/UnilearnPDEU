import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen,
    MessageCircle,
    BarChart2,
    Settings,
    ChevronDown,
    Search
} from 'lucide-react';
import './TeacherCommunication.css'; // Reusing the same CSS

const TeacherAnnouncements = () => {
    const { user } = useAuth();

    return (
        <div className="teacher-comm-container">
            {/* Sidebar - Reused */}
            <aside className="comm-sidebar">
                <div className="td-logo">
                    <h2>U</h2>
                </div>

                <nav className="comm-nav">
                    <Link to="/" className="comm-nav-item">
                        <div className="comm-nav-icon"><BookOpen size={24} /></div>
                    </Link>
                    <div className="comm-nav-item active">
                        <div className="comm-nav-icon"><MessageCircle size={24} /></div>
                    </div>
                    <Link to="#" className="comm-nav-item">
                        <div className="comm-nav-icon"><BarChart2 size={24} /></div>
                    </Link>
                    <Link to="#" className="comm-nav-item">
                        <div className="comm-nav-icon"><Settings size={24} /></div>
                    </Link>
                </nav>
            </aside>

            {/* Sub Sidebar */}
            <div className="comm-sub-sidebar">
                <Link to="/teacher/communication" className="sub-menu-item">Q n A</Link>
                <Link to="/teacher/assignments" className="sub-menu-item">Assignments</Link>
                <div className="sub-menu-item active">Announcements</div>
            </div>

            {/* Main Content */}
            <main className="comm-main">
                <header className="comm-header">
                    <div className="header-title" style={{ width: '100%', justifyContent: 'space-between' }}>
                        <h1>Announcements</h1>
                        <button className="create-course-btn" style={{ fontSize: '1rem', padding: '0.5rem 1.5rem' }}>
                            Announce !
                        </button>
                    </div>
                </header>

                <div className="comm-content">
                    <div className="announcements-placeholder" style={{
                        width: '100%',
                        height: '400px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '500'
                    }}>
                        Announcements will appear here
                    </div>
                </div>

                <footer className="comm-footer">
                    Footer
                </footer>
            </main>
        </div>
    );
};

export default TeacherAnnouncements;
