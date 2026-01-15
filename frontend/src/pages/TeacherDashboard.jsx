import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen,
    MessageCircle,
    BarChart2,
    Settings,
    Search,
    Bell,
    Plus
} from 'lucide-react';
import './TeacherDashboard.css';

const TeacherDashboard = ({ toggleViewMode }) => {
    const { user, logout } = useAuth();

    return (
        <div className="teacher-dashboard">
            {/* Sidebar */}
            <aside className="td-sidebar">
                <div className="td-logo">
                    <h2>UniLearn</h2>
                </div>

                <nav className="td-nav">
                    <a href="#" className="td-nav-item active">
                        <div className="td-nav-icon"><BookOpen size={24} /></div>
                        <span>Courses</span>
                    </a>
                    <Link to="/teacher/communication" className="td-nav-item">
                        <div className="td-nav-icon"><MessageCircle size={24} /></div>
                        <span>Communication</span>
                    </Link>
                    <a href="#" className="td-nav-item">
                        <div className="td-nav-icon"><BarChart2 size={24} /></div>
                        <span>Performance</span>
                    </a>
                    <a href="#" className="td-nav-item">
                        <div className="td-nav-icon"><Settings size={24} /></div>
                        <span>Tools</span>
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="td-main">
                {/* Header */}
                <header className="td-header">
                    <div className="td-header-right">
                        {/* Switch to Student Button specific for teachers */}
                        <button className="switch-student-btn" onClick={toggleViewMode}>
                            Student
                        </button>

                        <button className="icon-btn">
                            <Bell size={24} />
                            <span className="notification-label">Notification</span>
                        </button>

                        <div className="user-avatar-circle">
                            {user?.name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                    </div>
                </header>

                <div className="td-content">
                    {/* Course Creation Banner */}
                    <div className="create-course-banner">
                        <div className="cc-text">
                            <h3>Jump Into Course<br />Creation</h3>
                        </div>
                        <button className="create-course-btn">
                            Create Your Course
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="course-controls">
                        <div className="td-search">
                            <input type="text" placeholder="Search your Courses" />
                        </div>
                        <button className="filter-icon-btn">
                            <Search size={20} />
                        </button>
                    </div>

                    {/* Course Grid */}
                    <div className="td-course-grid">
                        <div className="td-course-card placeholder"></div>
                        <div className="td-course-card placeholder"></div>
                        <div className="td-course-card placeholder">
                            <div className="already-created-label">Already created courses</div>
                        </div>
                    </div>
                </div>

                <footer className="td-footer">
                    Footer
                </footer>
            </main>
        </div>
    );
};

export default TeacherDashboard;
