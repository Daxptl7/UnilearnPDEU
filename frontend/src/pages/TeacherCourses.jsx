import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { fetchTeacherCourses } from '../api/teacher.api';
import { Plus, BookOpen, Clock, Users } from 'lucide-react';
import './TeacherCommunication.css'; // Reusing layout styles
import './TeacherCourses.css'; // New Aesthetic Dashboard Styles

const TeacherCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchTeacherCourses();
                if (response.success) {
                    setCourses(response.data);
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, []);

    return (
        <div className="teacher-comm-container">
            <TeacherSidebar />

            <main className="comm-main" style={{ marginLeft: '250px', width: 'calc(100% - 250px)' }}>
                {/* Inline style to override flex layout issues if necessary, or just rely on CSS */}
                {/* Actually comm-main has flex: 1, and container handles layout. */}

                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <div className="dashboard-title">
                            <h1>My Dashboard</h1>
                            <p className="dashboard-subtitle">Manage your courses and track student progress</p>
                        </div>
                        <Link to="/teacher/create-course" className="create-btn">
                            <Plus size={18} />
                            Create Course
                        </Link>
                    </header>

                    <div className="comm-content" style={{ padding: 0 }}>
                        {loading ? (
                            <div className="loading-state">Loading courses...</div>
                        ) : courses.length === 0 ? (
                            <div className="empty-state">
                                <BookOpen size={48} color="#ccc" />
                                <h3>No courses yet</h3>
                                <p>Create your first course to get started.</p>
                                <Link to="/teacher/create-course" className="create-btn" style={{ marginTop: '20px', display: 'inline-flex' }}>Create New Course</Link>
                            </div>
                        ) : (
                            <div className="courses-grid-wrapper">
                                {courses.map(course => {
                                    if (!course) return null; // Skip invalid course objects
                                    return (
                                        <Link to={`/teacher/courses/${course.slug || ''}`} key={course._id || Math.random()} className="t-course-card">
                                            <div className="t-course-thumb" style={{ backgroundImage: `url(${course.thumbnail || '/placeholder-course.jpg'})` }}>
                                                <span className="t-course-status">{course.status || 'Active'}</span>
                                            </div>
                                            <div className="t-course-info">
                                                <h3 className="t-course-title">{course.name || 'Untitled Course'}</h3>
                                                <div className="t-course-meta">
                                                    <span className="meta-item"><Users size={14} /> {course.stats?.students || 0} Students</span>
                                                    <span className="meta-item"><Clock size={14} /> {course.duration || 'Flexible'}</span>
                                                </div>
                                                <div className="t-course-footer">
                                                    <span className="t-price">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                                                    <span className="edit-text">Manage Course →</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherCourses;
