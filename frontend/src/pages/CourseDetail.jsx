import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, ChevronDown, ChevronUp, Play, Lock, CheckCircle, Circle, ThumbsUp, PlusSquare, MoreHorizontal } from 'lucide-react';
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
    const [currentLecture, setCurrentLecture] = useState(null);

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

                // Expand the first part by default
                if (courseData.parts && courseData.parts.length > 0) {
                    setExpandedParts({ [courseData.parts[0]._id || courseData.parts[0].order]: true });
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

    const playVideo = (lecture) => {
        if (!isEnrolled) {
            if (lecture.status === 'unlocked') {
                // Allow preview if unlocked
            } else {
                alert('Please enroll in the course to watch this video.');
                return;
            }
        }
        setCurrentLecture(lecture);
        // Scroll to top for mobile mostly, or just ensuring visibility
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

    if (loading) return <div className="course-loading">Loading...</div>;

    if (error || !course) {
        return (
            <div className="course-not-found">
                <h2>{error || 'Course not found'}</h2>
                <Link to="/">Return to Home</Link>
            </div>
        );
    }

    const similarCourses = getSimilarCourses(course.id);
    const videoSource = currentLecture ? currentLecture.videoUrl : course.videoPreview;
    const activeTitle = currentLecture ? currentLecture.title : course.name + " (Preview)";

    return (
        <div className="course-detail-container">
            {/* Layout Grid */}
            <div className="course-layout">

                {/* LEFT: Video Player & Details */}
                <div className="course-main">

                    {/* 1. Video Player */}
                    <div className="main-video-player">
                        {videoSource ? (
                            <iframe
                                src={videoSource}
                                title={activeTitle}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="video-placeholder">
                                {course.thumbnail && <img src={course.thumbnail} alt={course.name} />}
                                <span>No video selected</span>
                            </div>
                        )}
                    </div>

                    {/* 2. Video Info & Actions */}
                    <div className="video-info-section">
                        <h1 className="video-title">{activeTitle}</h1>
                        <div className="video-meta-row">
                            <div className="video-stats">
                                <span>{course.stats?.rating || 0} ⭐ ratings</span> • <span>{course.stats?.parts || 0} parts</span>
                            </div>

                            <div className="action-buttons">
                                <button className="btn-action">
                                    <ThumbsUp size={18} /> Like
                                </button>
                                <button className="btn-action">
                                    <Share2 size={18} /> Share
                                </button>
                                <button className="btn-action">
                                    <PlusSquare size={18} /> Save
                                </button>

                                <button className="btn-action" style={{ borderRadius: '50%', padding: '0.5rem' }}>
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Channel / Instructor Row */}
                    <div className="channel-row">
                        <div className="channel-avatar">
                            {course.instructor?.name?.charAt(0) || 'I'}
                        </div>
                        <div className="channel-info">
                            <Link to="#" className="channel-name">{course.instructor?.name || 'Instructor'}</Link>
                            <div className="channel-sub">{course.instructor?.role || 'Educator'}</div>
                        </div>

                        {/* Enrollment Actions for top area */}
                        {!isEnrolled && (
                            <div className="enrollment-actions">
                                {isInCart ? (
                                    <Link to="/cart" className="btn-enroll-primary">Go to Cart</Link>
                                ) : (
                                    <button onClick={handleEnroll} className="btn-enroll-primary" disabled={enrollLoading}>
                                        {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
                                    </button>
                                )}
                            </div>
                        )}
                        {isEnrolled && (
                            <button className="btn-action" style={{ background: '#e5e5e5', color: '#111' }}>
                                Subscribed
                            </button>
                        )}
                    </div>

                    {/* 4. Description Box */}
                    <div className="description-box">
                        <h3>About this course</h3>
                        <p>{course.description}</p>

                        <div style={{ marginTop: '1rem' }}>
                            <strong>Category:</strong> {course.category} <br />
                            <strong>Level:</strong> {course.stats?.difficulty} <br />
                            <strong>Duration:</strong> {course.stats?.totalHours}h
                        </div>

                        {course.whatYouLearn && (
                            <div style={{ marginTop: '1rem' }}>
                                <strong>What you'll learn:</strong>
                                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                    {course.whatYouLearn.map((item, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT: Sidebar (Playlist) */}
                <div className="course-sidebar">
                    <div className="sidebar-header">
                        <div className="sidebar-title">Course Content</div>
                        {isEnrolled && (
                            <div className="course-progress-mini">
                                {courseProgress}% Completed
                            </div>
                        )}
                    </div>

                    {/* Lectures List */}
                    <div className="parts-list">
                        {course.parts && course.parts.map((part) => (
                            <div key={part._id || part.order} className="part-section">
                                <div className="part-header" onClick={() => togglePart(part._id || part.order)}>
                                    <span>{part.title}</span>
                                    {expandedParts[part._id || part.order] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>

                                {expandedParts[part._id || part.order] && (
                                    <div className="lectures-container">
                                        {part.lectures.map((lecture, idx) => {
                                            const isActive = currentLecture && currentLecture._id === lecture._id;
                                            const isCompleted = progressMap[lecture._id];
                                            const isLocked = !isEnrolled && lecture.status !== 'unlocked';

                                            return (
                                                <div
                                                    key={lecture._id}
                                                    className={`lecture-item ${isActive ? 'active' : ''}`}
                                                    onClick={() => !isLocked && playVideo(lecture)}
                                                >
                                                    <div className="lecture-status-icon">
                                                        {isActive ? <Play size={14} fill="currentColor" /> : <span style={{ fontSize: '0.8rem' }}>{idx + 1}</span>}
                                                    </div>
                                                    <div className="lecture-info">
                                                        <div className="lecture-title">{lecture.title}</div>
                                                        <div className="lecture-meta">
                                                            <span>{lecture.duration}</span>
                                                            {isLocked && <Lock size={12} />}
                                                        </div>
                                                    </div>
                                                    {isEnrolled && (
                                                        <button
                                                            className={`lecture-check ${isCompleted ? 'completed' : ''}`}
                                                            onClick={(e) => toggleLectureCompletion(e, lecture._id)}
                                                        >
                                                            {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Similar Courses (at bottom of sidebar) */}
                    <div className="similar-courses-section">
                        <div style={{ padding: '0 1.5rem 0.5rem', fontWeight: '700' }}>Relate Courses</div>
                        {similarCourses.map((similar) => (
                            <Link key={similar.id} to={`/course/${similar.slug}`} className="similar-item" style={{ padding: '0 1.5rem' }}>
                                <div className="similar-thumb"></div> {/* Placeholder for img */}
                                <div className="similar-info">
                                    <div className="similar-title">{similar.name}</div>
                                    <div className="similar-author">By {similar.instructor}</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CourseDetail;
