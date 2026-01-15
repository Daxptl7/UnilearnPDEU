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
import './TeacherCommunication.css';

const TeacherCommunication = () => {
    const { user } = useAuth();

    return (
        <div className="teacher-comm-container">
            {/* Sidebar - Similar to Dashboard but with Sub-menu */}
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
                <div className="sub-menu-item active">Q n A</div>
                <Link to="/teacher/assignments" className="sub-menu-item">Assignments</Link>
                <Link to="/teacher/announcements" className="sub-menu-item">Announcements</Link>
            </div>

            {/* Main Content */}
            <main className="comm-main">
                <header className="comm-header">
                    <div className="header-title">
                        <h1>Q n A</h1>
                        <div className="course-dropdown">
                            <span>All Courses</span>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </header>

                <div className="comm-content">
                    {/* Overview Panel */}
                    <div className="question-overview">
                        <h2>Question Overview</h2>
                        {/* Placeholder for chart/stats */}
                    </div>

                    {/* Filter Bar */}
                    <div className="filter-bar">
                        <h3>Q n A</h3>
                        <div className="filters">
                            <label className="checkbox-label">
                                <input type="checkbox" /> Unread (0)
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" /> No Answers (0)
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" /> No Instructor Answer (0)
                            </label>

                            <div className="sort-dropdown">
                                Sort <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="question-list">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="question-card">
                                <span>Question {item}</span>
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

export default TeacherCommunication;
