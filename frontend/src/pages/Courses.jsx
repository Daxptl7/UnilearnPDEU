import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPublicCourses } from '../api/course.api';
import './Courses.css';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filters = ['All', 'SOT', 'SOET', 'SLS', 'SOL'];

    const { user } = useAuth();

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchPublicCourses();
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

    const filteredCourses = courses.filter(course => {
        // 1. School Restriction Logic
        if (user && user.role === 'student' && user.school) {
            if (course.category !== user.school) {
                return false; // Hide course if it currently belongs to broken school
            }
        }

        // 2. Existing Filter Buttons Logic
        const matchesFilter = activeFilter === 'All' || course.category === activeFilter;

        // 3. Search Logic
        const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.whatYouLearn && course.whatYouLearn.some(w => w.toLowerCase().includes(searchTerm.toLowerCase())));

        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return <div className="courses-loading">Loading courses...</div>;
    }

    return (
        <div className="courses-page">
            <header className="courses-header">
                <h1>All Courses</h1>
                <p>Explore our wide range of courses and start learning today.</p>

                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search for courses, technologies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="filter-container">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            <div className="courses-grid-container">
                {filteredCourses.length === 0 ? (
                    <p className="no-courses">No courses available for {activeFilter}.</p>
                ) : (
                    <div className="courses-grid">
                        {filteredCourses.map((course) => (
                            <Link key={course._id} to={`/course/${course.slug}`} className="course-card-item">
                                <div className="course-thumb" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
                                <div className="course-info">
                                    <h3>{course.name}</h3>
                                    <p className="instructor">By {course.instructor?.name || 'Instructor'}</p>
                                    <div className="course-meta">
                                        <span className="price">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                                        <span className="rating">★ 4.5</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
