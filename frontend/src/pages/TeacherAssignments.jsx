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

const TeacherAssignments = () => {
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
                <div className="sub-menu-item active">Assignments</div>
                <Link to="/teacher/announcements" className="sub-menu-item">Announcements</Link>
            </div>

            {/* Main Content */}
            <main className="comm-main">
                <header className="comm-header">
                    <div className="header-title">
                        <h1>Assignments</h1>
                        <div className="course-dropdown">
                            <span>All Courses</span>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </header>

                <div className="comm-content">
                    {/* Filter Bar */}
                    <div className="filter-bar">
                        <div className="filters">
                            <label className="checkbox-label">
                                <input type="checkbox" /> Unread (0)
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" /> Feedback type
                            </label>

                            <div className="sort-dropdown">
                                Sort <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Assignment List */}
                    <div className="question-list">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="question-card">
                                <span>Assignment {item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="comm-footer">
                    Footer
                </footer>
            </main>
        </div>
    );
};

export default TeacherAssignments;
