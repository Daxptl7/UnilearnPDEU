import React from 'react';
import { Link } from 'react-router-dom';
// import { courses } from '../data/courses'; // Removed static import
import TeacherDashboard from './TeacherDashboard';
import './Home.css';

const Home = ({ user, viewMode, toggleViewMode }) => {
    // If user is a teacher and looking at teacher view, show TeacherDashboard
    // This replaces the old TeacherHome component usage
    if (user?.role === 'teacher' && viewMode === 'teacher') {
        return <TeacherDashboard toggleViewMode={toggleViewMode} />;
    }

    // Mock Data
    const currentCourses = [
        { id: 1, title: 'Course 1' },
        { id: 2, title: 'Course 2' },
        { id: 3, title: 'Course 3' },
    ];

    // Fetch courses from API
    const [recommended, setRecommended] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadCourses = async () => {
            try {
                const { fetchPublicCourses } = await import('../api/course.api');
                const response = await fetchPublicCourses();
                if (response.success) {
                    setRecommended(response.data);
                }
            } catch (error) {
                console.error('Failed to load courses:', error);
            } finally {
                setLoading(false);
            }
        };
        loadCourses();
    }, []);

    const professors = Array(7).fill({ name: 'Prof' });

    return (
        <div className="home-container">
            {/* Top Section: Hero + "Continue Learning" */}
            <div className="home-top-section">
                <div className={`hero-banner ${!user ? 'full-width' : ''}`}>
                    <div className="hero-content">
                        <h2>Welcome/Featured</h2>
                        {!user && <p className="hero-note">*Without log in the window will stretch to cover the space including (Continue learning...)*</p>}
                    </div>
                </div>

                {user && (
                    <div className="continue-learning-sidebar">
                        <h3>Continue learning...</h3>
                        <div className="cl-list">
                            {currentCourses.map((c, i) => (
                                <div key={i} className="cl-card">
                                    <div className="cl-card-thumb"></div>
                                    <span>{c.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recommended Section */}
            <div className="section-container">
                <h3>Reccomended for you/ Trending/ New/ Popular Certificates</h3>
                <div className="horizontal-scroll-grid">
                    {recommended.map((course) => (
                        <Link key={course.id} to={`/course/${course.slug}`} className="course-card">
                            <div className="course-card-thumb"></div>
                            <span className="course-card-title">{course.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Professors Section */}
            <div className="section-container last-section">
                <h3>Professors</h3>
                <div className="professors-list">
                    {professors.map((p, i) => (
                        <div key={i} className="professor-circle"></div>
                    ))}
                </div>
                <div className="top-companies">
                    <p>Top Companies.......</p>
                </div>
            </div>

        </div>
    );
};

export default Home;
