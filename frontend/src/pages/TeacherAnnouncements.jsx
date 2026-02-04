import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTeacherCourses } from '../api/teacher.api';
import { createAnnouncement } from '../api/announcement.api';
import {
    BookOpen,
    MessageCircle,
    BarChart2,
    Settings,
    ChevronDown,
    Send
} from 'lucide-react';
import './TeacherCommunication.css';

const TeacherAnnouncements = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchTeacherCourses();
                if (response.success) {
                    setCourses(response.data);
                    if (response.data.length > 0) {
                        setSelectedCourse(response.data[0]._id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        loadCourses();
    }, []);

    const handleAnnounce = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!selectedCourse) {
            setMessage({ type: 'error', text: 'Please select a course.' });
            return;
        }
        if (!title.trim() || !content.trim()) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        try {
            setLoading(true);
            const response = await createAnnouncement(selectedCourse, title, content);
            if (response.success) {
                setMessage({ type: 'success', text: 'Announcement posted successfully!' });
                setTitle('');
                setContent('');
            }
        } catch (error) {
            console.error("Announcement failed", error);
            setMessage({ type: 'error', text: error.message || 'Failed to post announcement.' });
        } finally {
            setLoading(false);
        }
    };

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
                    </div>
                </header>

                <div className="comm-content">
                    <div className="announcement-form-container" style={{
                        backgroundColor: 'var(--bg-card)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Make an Announcement</h2>

                        {message && (
                            <div style={{
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                borderRadius: '8px',
                                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                                color: message.type === 'success' ? '#166534' : '#991b1b',
                                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                            }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleAnnounce}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Course</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            backgroundColor: 'var(--bg-primary)',
                                            fontSize: '1rem',
                                            appearance: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" disabled>Select a course...</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>{course.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Exam Schedule Update"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-primary)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Message</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your announcement here..."
                                    rows="6"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-primary)',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        backgroundColor: 'var(--accent-color)',
                                        color: 'white',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Posting...' : (
                                        <>
                                            <Send size={18} />
                                            Post Announcement
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <footer className="comm-footer">
                    &copy; {new Date().getFullYear()} Unilearn. All rights reserved.
                </footer>
            </main>
        </div>
    );
};

export default TeacherAnnouncements;
