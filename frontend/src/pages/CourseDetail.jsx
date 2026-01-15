import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, ChevronDown, ChevronUp, Play, Lock, CheckCircle, Circle } from 'lucide-react';
import { getSimilarCourses } from '../data/courses';
import { fetchCourseBySlug } from '../api/course.api';
import { enrollInCourse, addToCart, fetchCart, fetchMyCourses, fetchCourseProgress, updateLectureProgress } from '../api/student.api';
import { useAuth } from '../context/AuthContext';
import './CourseDetail.css';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedParts, setExpandedParts] = useState({});

    // User state relative to course
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);

    // Progress State
    const [progressMap, setProgressMap] = useState({}); // lectureId -> boolean
    const [courseProgress, setCourseProgress] = useState(0); // percentage

    // Video Player State
    const [currentVideo, setCurrentVideo] = useState(null);

    useEffect(() => {
        const loadCourseData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Course Details
                const courseResponse = await fetchCourseBySlug(slug);
                if (!courseResponse.success) {
                    setError('Course not found');
                    return;
                }
                const courseData = courseResponse.data;
                setCourse(courseData);

                // 2. Check Enrollment and Cart status if user is logged in
                if (user && user.role === 'student') {
                    // Check if enrolled
                    const myCourses = await fetchMyCourses();
                    const enrolled = myCourses.success && myCourses.data.some(c => c._id === courseData._id);
                    setIsEnrolled(enrolled);

                    if (enrolled) {
                        // Fetch progress
                        try {
                            const progressRes = await fetchCourseProgress(courseData._id);
                            if (progressRes.success) {
                                setProgressMap(progressRes.data.progress || {});
                            }
                        } catch (e) {
                            console.error("Failed to fetch progress", e);
                        }
                    } else {
                        // Check if in cart
                        const myCart = await fetchCart();
                        const inCart = myCart.success && myCart.data.some(c => c._id === courseData._id);
                        setIsInCart(inCart);
                    }
                }
            } catch (err) {
                console.error('Error loading course data:', err);
                setError('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadCourseData();
        }
    }, [slug, user]);

    // Calculate progress percentage whenever progressMap or course changes
    useEffect(() => {
        if (course && isEnrolled) {
            let totalLectures = 0;
            let completedLectures = 0;

            course.parts.forEach(part => {
                part.lectures.forEach(lecture => {
                    totalLectures++;
                    if (progressMap[lecture._id]) {
                        completedLectures++;
                    }
                });
            });

            const percent = totalLectures === 0 ? 0 : Math.round((completedLectures / totalLectures) * 100);
            setCourseProgress(percent);
        }
    }, [progressMap, course, isEnrolled]);


    const togglePart = (partId) => {
        setExpandedParts(prev => ({
            ...prev,
            [partId]: !prev[partId]
        }));
    };

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            setEnrollLoading(true);
            const response = await enrollInCourse(course._id);
            if (response.success) {
                setIsEnrolled(true);
                setIsInCart(false);
                alert('Successfully enrolled! You can now watch the videos.');
                // Initialize progress
                setProgressMap({});
            }
        } catch (err) {
            console.error('Enrollment failed:', err);
            alert('Failed to enroll. Please try again.');
        } finally {
            setEnrollLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            setCartLoading(true);
            const response = await addToCart(course._id);
            if (response.success) {
                setIsInCart(true);
                alert('Added to cart!');
            }
        } catch (err) {
            console.error('Add to cart failed:', err);
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setCartLoading(false);
        }
    };

    const playVideo = (videoUrl) => {
        if (!isEnrolled) {
            alert('Please enroll in the course to watch this video.');
            return;
        }
        // Extract video ID from embed URL or watch URL if needed
        // Assuming videoUrl is like "https://www.youtube.com/embed/..."
        setCurrentVideo(videoUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleLectureCompletion = async (e, lectureId) => {
        e.stopPropagation(); // Prevent opening video when clicking checkbox
        if (!isEnrolled) return;

        try {
            // Optimistic update
            const currentStatus = !!progressMap[lectureId];
            setProgressMap(prev => ({
                ...prev,
                [lectureId]: !currentStatus
            }));

            await updateLectureProgress(course._id, lectureId);
        } catch (err) {
            console.error('Failed to update progress', err);
            // Revert on error
            setProgressMap(prev => ({
                ...prev,
                [lectureId]: !prev[lectureId]
            }));
        }
    };

    if (loading) return <div className="course-loading">Loading course details...</div>;

    if (error || !course) {
        return (
            <div className="course-not-found">
                <h2>{error || 'Course not found'}</h2>
                <Link to="/">Return to Home</Link>
            </div>
        );
    }

    const similarCourses = getSimilarCourses(course.id);

    return (
        <div className="course-detail-container">
            {/* Breadcrumb */}
            <div className="breadcrumb">{course.category}</div>

            {/* Video Player Overlay */}
            {currentVideo && (
                <div className="video-player-container">
                    <div className="video-wrapper">
                        <iframe
                            width="100%"
                            height="500"
                            src={currentVideo}
                            title="Course Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                        <button className="close-video-btn" onClick={() => setCurrentVideo(null)}>Close Video</button>
                    </div>
                </div>
            )}

            <div className="course-layout">
                {/* Main Content */}
                <div className="course-main">
                    {/* Course Header */}
                    <div className="course-header-section">
                        <div className="course-info-left">
                            {course.provider && (
                                <div className="provider-logo">
                                    {course.provider}
                                </div>
                            )}

                            <h1 className="course-title">
                                <span className="course-label">COURSE NAME:</span> {course.name}
                            </h1>

                            <p className="course-subtitle">{course.subtitle}</p>
                            <p className="course-description">{course.description}</p>
                            <p className="educator-info">Instructor: {course.instructor?.name}</p>

                            {/* Progress Bar for Enrolled Students */}
                            {isEnrolled && (
                                <div className="course-progress-section">
                                    <div className="progress-header">
                                        <span>Your Progress</span>
                                        <span>{courseProgress}% Complete</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${courseProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="course-actions">
                                <div className="price-tag">
                                    <span className="price-label">Price:</span>
                                    <span className="price-value">{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
                                </div>

                                <div className="action-buttons">
                                    {isEnrolled ? (
                                        <button className="btn-enroll enrolled" disabled>Enrolled</button>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-enroll"
                                                onClick={handleEnroll}
                                                disabled={enrollLoading}>
                                                {enrollLoading ? 'Enrolling...' : 'Enroll Now!'}
                                            </button>
                                            {!isInCart && (
                                                <button
                                                    className="btn-cart"
                                                    onClick={handleAddToCart}
                                                    disabled={cartLoading}>
                                                    {cartLoading ? 'Adding...' : 'Add to cart'}
                                                </button>
                                            )}
                                            {isInCart && (
                                                <Link to="/cart" className="btn-cart went-to-cart">Go to Cart</Link>
                                            )}
                                        </>
                                    )}

                                    <button className="btn-icon">
                                        <Heart size={24} />
                                    </button>
                                    <button className="btn-icon">
                                        <Share2 size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="course-thumbnail">
                            {course.videoPreview ? (
                                <div className="video-preview">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={course.videoPreview}
                                        title="Preview"
                                        frameBorder="0"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <img src={course.thumbnail} alt={course.name} className="thumbnail-img" />
                            )}
                        </div>
                    </div>

                    {/* Course Stats */}
                    <div className="course-stats">
                        <div className="stat-item">
                            <span className="stat-label">no. of parts in the course</span>
                            <span className="stat-value">{course.stats?.parts || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Ratings & Reviews</span>
                            <span className="stat-value">{course.stats?.rating || 0} ⭐ ({course.stats?.reviews || 0})</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Difficulty Level</span>
                            <span className="stat-value">{course.stats?.difficulty}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Total hours</span>
                            <span className="stat-value">{course.stats?.totalHours}h</span>
                        </div>
                        <div className="stat-item cert">
                            <span className="stat-label">📜 Shareable certificate</span>
                        </div>
                    </div>

                    {/* What You'll Learn */}
                    <div className="what-learn-section">
                        <h2>What you'll learn</h2>
                        <div className="learn-grid">
                            {course.whatYouLearn && course.whatYouLearn.map((item, index) => (
                                <div key={index} className="learn-item">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Content */}
                    <div className="course-content-section">
                        <h2>Course content</h2>
                        {course.parts && course.parts.map((part) => (
                            <div key={part._id || part.order} className="part-container">
                                <div className="part-header" onClick={() => togglePart(part._id || part.order)}>
                                    <div className="part-title-row">
                                        <span className="part-title">{part.title}</span>
                                        {part.resources && (
                                            <button className="btn-resources">Resources</button>
                                        )}
                                    </div>
                                    <button className="btn-expand">
                                        {expandedParts[part._id || part.order] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                </div>

                                {expandedParts[part._id || part.order] && part.lectures.length > 0 && (
                                    <div className="lectures-list">
                                        {part.lectures.map((lecture) => (
                                            <div key={lecture._id} className="lecture-item" onClick={() => playVideo(lecture.videoUrl)}>
                                                <div className="lecture-left">
                                                    {isEnrolled && (
                                                        <button
                                                            className={`btn-check ${progressMap[lecture._id] ? 'completed' : ''}`}
                                                            onClick={(e) => toggleLectureCompletion(e, lecture._id)}
                                                            title={progressMap[lecture._id] ? "Mark as incomplete" : "Mark as complete"}
                                                        >
                                                            {progressMap[lecture._id] ? <CheckCircle size={20} color="#10b981" /> : <Circle size={20} />}
                                                        </button>
                                                    )}
                                                    <span className={`lecture-title ${progressMap[lecture._id] ? 'text-muted' : ''}`}>
                                                        {lecture.title}
                                                    </span>
                                                </div>
                                                <div className="lecture-right">
                                                    {lecture.duration && (
                                                        <span className="lecture-duration">{lecture.duration}</span>
                                                    )}
                                                    <span className="lecture-status">
                                                        {isEnrolled || lecture.status === 'unlocked' ? (
                                                            <Play size={18} className="icon-play" />
                                                        ) : (
                                                            <Lock size={18} className="icon-lock" />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="course-sidebar">
                    {/* Similar Courses */}
                    <div className="similar-courses">
                        <h3>Similar courses/Other courses</h3>
                        <div className="similar-list">
                            {similarCourses.map((similarCourse) => (
                                <Link
                                    key={similarCourse.id}
                                    to={`/course/${similarCourse.slug}`}
                                    className="similar-course-card"
                                >
                                    <div className="similar-thumbnail"></div>
                                    <span className="similar-name">{similarCourse.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Instructor Details */}
                    {course.instructor && (
                        <div className="instructor-details">
                            <h3>INSTRUCTOR DETAILS</h3>
                            <div className="instructor-info">
                                <p><strong>{course.instructor.name}</strong></p>
                                <p>{course.instructor.role}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
