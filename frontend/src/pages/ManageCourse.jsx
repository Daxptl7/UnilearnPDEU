import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { fetchCourseBySlug } from '../api/course.api';
import { addSection, addLecture } from '../api/teacher.api';
import { Plus, Video, MonitorPlay, ChevronDown, ChevronUp, Bookmark, Share2, MoreVertical, Copy } from 'lucide-react';
import './TeacherCommunication.css';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

const ManageCourse = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});

    // Dropdown state
    const [manageDropdownOpen, setManageDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Modal states
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showLectureModal, setShowLectureModal] = useState(false);
    const [showGoLiveModal, setShowGoLiveModal] = useState(false);
    const [meetingCode, setMeetingCode] = useState('');
    const [activeSectionId, setActiveSectionId] = useState(null);

    const { user } = useAuth();
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(config.SOCKET_URL);
        return () => socketRef.current.disconnect();
    }, []);

    // Form states
    const [sectionTitle, setSectionTitle] = useState('');
    const [lectureData, setLectureData] = useState({
        title: '',
        videoUrl: '',
        description: '',
        summary: '',
        notes: '',
        thumbnail: '',
        duration: ''
    });

    const loadCourse = async () => {
        try {
            const response = await fetchCourseBySlug(slug);
            if (response.success) {
                setCourse(response.data);
                // Expand all sections by default
                const initialExpanded = {};
                response.data.parts.forEach(part => initialExpanded[part._id] = true);
                setExpandedSections(initialExpanded);
            }
        } catch (error) {
            console.error("Error loading course:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourse();
    }, [slug]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setManageDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!sectionTitle.trim()) return;

        try {
            const response = await addSection(course._id, { title: sectionTitle, order: course.parts.length + 1 });
            if (response.success) {
                setCourse(response.data); // Update course data
                setSectionTitle('');
                setShowSectionModal(false);
            }
        } catch (error) {
            console.error("Failed to add section", error);
        }
    };

    const handleAddLecture = async (e) => {
        e.preventDefault();
        if (!lectureData.title || !activeSectionId) return;

        try {
            const response = await addLecture(course._id, activeSectionId, { ...lectureData, order: 0 }); // Order logic needed
            if (response.success) {
                setCourse(response.data);
                setLectureData({ title: '', videoUrl: '', description: '', summary: '', notes: '', thumbnail: '', duration: '' });
                setShowLectureModal(false);
                setActiveSectionId(null);
            }
        } catch (error) {
            console.error("Failed to add lecture", error);
        }
    };

    const openLectureModal = (sectionId) => {
        setActiveSectionId(sectionId);
        setShowLectureModal(true);
    };

    if (loading) return <div className="teacher-comm-container"><TeacherSidebar /><main className="comm-main">Loading...</main></div>;
    if (!course) return <div className="teacher-comm-container"><TeacherSidebar /><main className="comm-main">Course not found</main></div>;

    return (
        <div className="teacher-comm-container">
            <TeacherSidebar />

            <main className="comm-main" style={{ padding: '0', overflowY: 'auto' }}>
                <div className="playlist-page-container">

                    {/* Left Sidebar - Playlist Info */}
                    <div className="playlist-sidebar">
                        <div className="playlist-cover-container">
                            <img
                                src={course.thumbnail || "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                                alt={course.name}
                                className="playlist-cover-img"
                            />
                        </div>

                        <h1 className="playlist-title">{course.name}</h1>

                        <div className="playlist-stats">
                            <div className="playlist-author">by DxCode</div>
                            <div className="playlist-meta">
                                <span>{course.parts.reduce((acc, part) => acc + part.lectures.length, 0)} videos</span>
                                <span> • </span>
                                <span>296,103 views</span>
                                <span> • </span>
                                <span>Last updated today</span>
                            </div>
                        </div>

                        <div className="playlist-description">
                            <p>{course.subtitle || "A complete playlist to master this subject."} ...more</p>
                        </div>

                        {/* Action Row */}
                        <div className="playlist-actions-row">
                            {/* Create Button (Primary) */}
                            <div className="create-btn-wrapper" ref={dropdownRef} style={{ flex: 1 }}>
                                <button
                                    className="playlist-play-btn"
                                    onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
                                >
                                    <Plus size={20} className="text-white dark:text-black" /> Create
                                </button>

                                {manageDropdownOpen && (
                                    <div className="manage-dropdown" style={{ top: '110%', left: 0, width: '200px' }}>
                                        <button
                                            className="manage-dropdown-item"
                                            onClick={() => {
                                                setShowSectionModal(true);
                                                setManageDropdownOpen(false);
                                            }}
                                        >
                                            <MonitorPlay size={18} /> Add Section
                                        </button>
                                        <button
                                            className="manage-dropdown-item"
                                            onClick={() => {
                                                setMeetingCode(uuidv4());
                                                setShowGoLiveModal(true);
                                                setManageDropdownOpen(false);
                                            }}
                                        >
                                            <Video size={18} /> Go Live
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Secondary Actions */}
                            <button className="playlist-icon-btn"><Bookmark size={20} /></button>
                            <button className="playlist-icon-btn"><Share2 size={20} /></button>
                            <button className="playlist-icon-btn"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Right Column - Video List */}
                    <div className="playlist-content">
                        <div className="sections-list-dark">
                            {course.parts.map((section, index) => (
                                <div key={section._id} className="section-item-dark">
                                    <div
                                        onClick={() => toggleSection(section._id)}
                                        className="section-header-dark"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                                            {expandedSections[section._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            Section {index + 1}: {section.title}
                                        </div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            {section.lectures.length} Lectures
                                        </div>
                                    </div>

                                    {expandedSections[section._id] && (
                                        <div className="section-content-dark">
                                            {section.lectures.map((lecture, lIndex) => (
                                                <div
                                                    key={lecture._id}
                                                    className="yt-video-row dark-mode"
                                                    onClick={() => window.open(lecture.videoUrl || '#', '_blank')}
                                                >
                                                    <div className="yt-index dark-text">{lIndex + 1}</div>

                                                    <div className="yt-thumbnail-container">
                                                        <img
                                                            src={lecture.thumbnail || "https://i.ytimg.com/vi/tVzUXW6siu0/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCiK3WfJ5H5_qD3qWbcK4w_9o_c_g"}
                                                            alt={lecture.title}
                                                            className="yt-thumbnail"
                                                        />
                                                        <span className="yt-duration">{lecture.duration || "10:05"}</span>
                                                    </div>

                                                    <div className="yt-video-info">
                                                        <h4 className="yt-video-title dark-text">{lecture.title}</h4>
                                                        <div className="yt-video-meta dark-meta">
                                                            <span>DxCode • 10K views • 2 days ago</span>
                                                        </div>
                                                    </div>

                                                    <div className="yt-actions">
                                                        <button className="yt-action-btn dark-btn"><Bookmark size={20} /></button>
                                                        <button className="yt-action-btn dark-btn"><Share2 size={20} /></button>
                                                        <button className="yt-action-btn dark-btn"><MoreVertical size={20} /></button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={(e) => { e.stopPropagation(); openLectureModal(section._id); }}
                                                className="add-video-btn-dark"
                                            >
                                                <Plus size={20} /> Add Video Lecture
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showSectionModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div className="modal-content" style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', width: '400px' }}>
                            <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Add New Section</h3>
                            <input
                                type="text"
                                placeholder="Section Title (e.g. Introduction)"
                                value={sectionTitle}
                                onChange={(e) => setSectionTitle(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginTop: '15px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            />
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowSectionModal(false)} style={{ padding: '8px 16px', border: 'none', background: 'var(--bg-hover)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' }}>Cancel</button>
                                <button onClick={handleAddSection} style={{ padding: '8px 16px', border: 'none', background: 'var(--accent-color)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Add Section</button>
                            </div>
                        </div>
                    </div>
                )}

                {showLectureModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div className="modal-content" style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Add Video Lecture</h3>
                            <form onSubmit={handleAddLecture} style={{ display: 'grid', gap: '15px' }}>
                                <input type="text" placeholder="Lecture Title" required value={lectureData.title} onChange={e => setLectureData({ ...lectureData, title: e.target.value })} className="modal-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                                <input type="text" placeholder="Video URL" value={lectureData.videoUrl} onChange={e => setLectureData({ ...lectureData, videoUrl: e.target.value })} className="modal-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                                <input type="text" placeholder="Duration (e.g. 10:05)" value={lectureData.duration} onChange={e => setLectureData({ ...lectureData, duration: e.target.value })} className="modal-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                                <textarea placeholder="Description" value={lectureData.description} onChange={e => setLectureData({ ...lectureData, description: e.target.value })} className="modal-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}></textarea>
                                <textarea placeholder="Summary" value={lectureData.summary} onChange={e => setLectureData({ ...lectureData, summary: e.target.value })} className="modal-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}></textarea>
                                <input type="text" placeholder="Thumbnail URL" value={lectureData.thumbnail} onChange={e => setLectureData({ ...lectureData, thumbnail: e.target.value })} className="modal-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                                <input type="text" placeholder="Notes URL (PDF/Doc)" value={lectureData.notes} onChange={e => setLectureData({ ...lectureData, notes: e.target.value })} className="modal-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />

                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowLectureModal(false)} style={{ padding: '8px 16px', border: 'none', background: 'var(--bg-hover)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '8px 16px', border: 'none', background: 'var(--accent-color)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Upload Video</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Go Live Modal */}
                {showGoLiveModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
                        <div className="bg-white dark:bg-[#1e1e2e] p-8 rounded-2xl w-[450px] border border-gray-200 dark:border-white/10 shadow-2xl transition-colors duration-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/20 flex items-center justify-center">
                                    <Video size={24} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="m-0 text-gray-900 dark:text-white text-2xl font-bold mb-1">Go Live</h3>
                                    <p className="m-0 text-gray-500 dark:text-gray-400 text-sm">Start a live session for your students</p>
                                </div>
                            </div>

                            <div className="bg-gray-100 dark:bg-[#0f0f1a] p-4 rounded-xl border border-gray-200 dark:border-white/5 mb-6">
                                <label className="block text-gray-600 dark:text-gray-400 text-xs font-semibold mb-2 tracking-wide">MEETING CODE</label>
                                <div className="flex gap-2 items-center">
                                    <code className="flex-1 bg-transparent text-indigo-600 dark:text-indigo-400 text-lg font-mono font-bold">
                                        {meetingCode}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(meetingCode);
                                            const btn = document.getElementById('copy-live-code-btn');
                                            if (btn) {
                                                const originalContent = btn.innerHTML;
                                                btn.innerHTML = '✓';
                                                setTimeout(() => btn.innerHTML = originalContent, 2000);
                                            }
                                        }}
                                        id="copy-live-code-btn"
                                        className="bg-white dark:bg-white/10 border border-gray-300 dark:border-none text-gray-700 dark:text-white p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-all w-8 h-8 flex items-center justify-center"
                                        title="Copy Code"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                Share this code with your students via announcements or chat. They can join the live session using this code.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowGoLiveModal(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (socketRef.current) {
                                            socketRef.current.emit('start-live-session',
                                                { roomId: meetingCode, teacherId: user?.name || 'Teacher', courseId: course._id },
                                                (response) => {
                                                    if (response && response.success) {
                                                        navigate(`/live/${meetingCode}`);
                                                    } else {
                                                        // Fallback if no ack (old server) or error, but give it a tiny delay
                                                        navigate(`/live/${meetingCode}`);
                                                    }
                                                }
                                            );
                                            // Fallback timeout in case server doesn't respond
                                            setTimeout(() => {
                                                navigate(`/live/${meetingCode}`);
                                            }, 2000);
                                        }
                                    }}
                                    className="flex-1 py-3 px-4 bg-indigo-600 dark:bg-gradient-to-r dark:from-pink-500 dark:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 dark:shadow-pink-500/30 hover:opacity-90 transition-opacity border-none"
                                >
                                    Start Meeting
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManageCourse;
