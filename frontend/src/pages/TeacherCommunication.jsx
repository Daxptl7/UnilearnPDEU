import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChevronDown,
    Search,
    MessageCircle,
    CheckCircle,
    XCircle,
    Send,
    ChevronUp
} from 'lucide-react';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { fetchTeacherCourses } from '../api/teacher.api';
import { getQuestions, addAnswer, toggleStatus } from '../api/question.api';
import { config } from '../config';
import './TeacherCommunication.css';

const BASE_URL = config.API_URL.replace('/api', '');

const TeacherCommunication = () => {
    const { user } = useAuth();

    // Data State
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [questions, setQuestions] = useState([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [expandedQuestions, setExpandedQuestions] = useState({});
    const [replyContent, setReplyContent] = useState({}); // questionId -> string
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'open', 'completed'

    // Fetch Courses on Mount
    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchTeacherCourses();
                if (response.success && response.data.length > 0) {
                    setCourses(response.data);
                    setSelectedCourseId(response.data[0]._id);
                }
            } catch (error) {
                console.error("Failed to load courses", error);
            }
        };
        loadCourses();
    }, []);

    // Fetch Questions
    useEffect(() => {
        if (selectedCourseId) {
            const loadQuestions = async () => {
                setLoading(true);
                try {
                    const response = await getQuestions(selectedCourseId);
                    if (response.success) {
                        setQuestions(response.data);
                    }
                } catch (error) {
                    console.error("Failed to load questions", error);
                } finally {
                    setLoading(false);
                }
            };
            loadQuestions();
        }
    }, [selectedCourseId]);

    const handleCourseChange = (e) => {
        setSelectedCourseId(e.target.value);
    };

    const toggleQuestion = (qId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [qId]: !prev[qId]
        }));
    };

    const handleReplyChange = (qId, value) => {
        setReplyContent(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmitReply = async (qId) => {
        const content = replyContent[qId];
        if (!content || !content.trim()) return;

        try {
            const response = await addAnswer(qId, content);
            if (response.success) {
                // Update local list
                setQuestions(prev => prev.map(q =>
                    q._id === qId ? response.data : q
                ));
                setReplyContent(prev => ({ ...prev, [qId]: '' }));
            }
        } catch (error) {
            console.error("Failed to submit reply", error);
            alert("Failed to submit reply");
        }
    };

    const handleToggleStatus = async (qId, currentStatus) => {
        const newStatus = currentStatus === 'open' ? 'completed' : 'open';
        try {
            const response = await toggleStatus(qId, newStatus);
            if (response.success) {
                setQuestions(prev => prev.map(q =>
                    q._id === qId ? { ...q, status: newStatus } : q
                ));
            }
        } catch (error) {
            console.error("Failed to toggle status", error);
            alert("Failed to update status");
        }
    };

    const filteredQuestions = questions.filter(q => {
        if (activeFilter === 'all') return true;
        return q.status === activeFilter;
    });

    return (
        <div className="teacher-comm-container">
            <TeacherSidebar />

            <div className="comm-sub-sidebar">
                <div className="sub-menu-item active">Q n A</div>
                <Link to="/teacher/assignments" className="sub-menu-item">Assignments</Link>
                <Link to="/teacher/announcements" className="sub-menu-item">Announcements</Link>
            </div>

            <main className="comm-main">
                <header className="comm-header">
                    <div className="header-title">
                        <h1>Q n A</h1>
                        <div className="course-dropdown-wrapper">
                            <select
                                value={selectedCourseId}
                                onChange={handleCourseChange}
                                className="course-select"
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                            >
                                <option value="" disabled>Select Course</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                <div className="comm-content">
                    {/* Overview & Filter Panel */}
                    <div className="filter-bar" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setActiveFilter('all')}
                            style={{
                                padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd',
                                background: activeFilter === 'all' ? '#000' : '#fff', color: activeFilter === 'all' ? '#fff' : '#333', cursor: 'pointer'
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter('open')}
                            style={{
                                padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd',
                                background: activeFilter === 'open' ? 'var(--accent-color)' : '#fff', color: activeFilter === 'open' ? '#fff' : '#333', cursor: 'pointer'
                            }}
                        >
                            Open
                        </button>
                        <button
                            onClick={() => setActiveFilter('completed')}
                            style={{
                                padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd',
                                background: activeFilter === 'completed' ? '#10b981' : '#fff', color: activeFilter === 'completed' ? '#fff' : '#333', cursor: 'pointer'
                            }}
                        >
                            Completed
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading questions...</div>
                    ) : filteredQuestions.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                            <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No questions found.</p>
                        </div>
                    ) : (
                        <div className="question-list">
                            {filteredQuestions.map(q => {
                                const isOpen = expandedQuestions[q._id];
                                return (
                                    <div key={q._id} className="question-card" style={{ display: 'block' }}>
                                        <div
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                            onClick={() => toggleQuestion(q._id)}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: q.status === 'completed' ? '#dcfce7' : '#e0e7ff',
                                                        color: q.status === 'completed' ? '#166534' : '#4338ca',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {q.status}
                                                    </span>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{q.title}</h3>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                    By {q.student?.name} ({q.student?.email}) • {new Date(q.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '0.9rem' }}>
                                                    <MessageCircle size={16} /> {q.answers.length}
                                                </div>
                                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>

                                        {isOpen && (
                                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <p style={{ whiteSpace: 'pre-wrap', color: '#333', fontSize: '1rem' }}>{q.description}</p>
                                                    {q.imageUrl && (
                                                        <div style={{ marginTop: '1rem' }}>
                                                            <img
                                                                src={q.imageUrl.startsWith('http') ? q.imageUrl : `${BASE_URL}${q.imageUrl}`}
                                                                alt="Attachment"
                                                                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #eee' }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                                    <button
                                                        onClick={() => handleToggleStatus(q._id, q.status)}
                                                        style={{
                                                            padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {q.status === 'open' ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                                                        {q.status === 'open' ? 'Mark as Completed' : 'Re-open Question'}
                                                    </button>
                                                </div>

                                                <div style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '1.5rem' }}>
                                                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#666' }}>Discussion</h4>

                                                    {q.answers.map(ans => (
                                                        <div key={ans._id} style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
                                                            <div style={{
                                                                width: '32px', height: '32px', borderRadius: '50%',
                                                                backgroundColor: ans.user?.role === 'teacher' ? 'var(--accent-color)' : '#ccc',
                                                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0, overflow: 'hidden'
                                                            }}>
                                                                {ans.user?.image ? (
                                                                    <img
                                                                        src={ans.user.image.startsWith('http') ? ans.user.image : `${BASE_URL}${ans.user.image}`}
                                                                        alt={ans.user.name}
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    />
                                                                ) : (
                                                                    ans.user?.name?.charAt(0) || 'U'
                                                                )}
                                                            </div>
                                                            <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee', flex: 1 }}>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {ans.user?.name}
                                                                    {ans.user?.role === 'teacher' && <span style={{ fontSize: '0.7rem', background: 'var(--accent-color)', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>Instructor</span>}
                                                                </div>
                                                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}>{ans.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                                                        <input
                                                            type="text"
                                                            value={replyContent[q._id] || ''}
                                                            onChange={(e) => handleReplyChange(q._id, e.target.value)}
                                                            placeholder="Type your answer..."
                                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                                        />
                                                        <button
                                                            onClick={() => handleSubmitReply(q._id)}
                                                            style={{
                                                                background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '0 1.2rem', borderRadius: '8px', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: '6px'
                                                            }}
                                                        >
                                                            <Send size={18} /> Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherCommunication;
