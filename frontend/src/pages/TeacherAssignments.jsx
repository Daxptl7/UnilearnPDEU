import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChevronDown,
    Plus,
    FileText,
    Calendar,
    Upload,
    X,
    Filter,
    Download,
    CheckCircle,
    User
} from 'lucide-react';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { fetchTeacherCourses } from '../api/teacher.api';
import { createAssignment, getAssignments, getSubmissions } from '../api/assignment.api';
import { config } from '../config';
import './TeacherCommunication.css';

const BASE_URL = config.API_URL.replace('/api', '');

const TeacherAssignments = () => {
    const { user } = useAuth();

    // Data State
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [currentAssignmentTitle, setCurrentAssignmentTitle] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        assignmentFile: null
    });

    // Fetch Courses on Mount
    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchTeacherCourses();
                if (response.success && response.data.length > 0) {
                    setCourses(response.data);
                    setSelectedCourseId(response.data[0]._id); // Select first by default
                }
            } catch (error) {
                console.error("Failed to load courses", error);
            }
        };
        loadCourses();
    }, []);

    // Fetch Assignments when Course changes
    useEffect(() => {
        if (selectedCourseId) {
            const loadAssignments = async () => {
                setLoading(true);
                try {
                    const response = await getAssignments(selectedCourseId);
                    if (response.success) {
                        setAssignments(response.data);
                    }
                } catch (error) {
                    console.error("Failed to load assignments", error);
                } finally {
                    setLoading(false);
                }
            };
            loadAssignments();
        }
    }, [selectedCourseId]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) {
            alert("Please select a course first");
            return;
        }

        try {
            setCreateLoading(true);
            const data = new FormData();
            data.append('courseId', selectedCourseId);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('dueDate', formData.dueDate);
            if (formData.assignmentFile) {
                data.append('assignmentFile', formData.assignmentFile);
            }

            const response = await createAssignment(data);
            if (response.success) {
                alert("Assignment created successfully");
                setIsModalOpen(false);
                setFormData({ title: '', description: '', dueDate: '', assignmentFile: null });
                // Refresh list
                const refreshed = await getAssignments(selectedCourseId);
                if (refreshed.success) setAssignments(refreshed.data);
            }
        } catch (error) {
            console.error("Failed to create assignment", error);
            alert("Failed to create assignment");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleViewSubmissions = async (assignmentId, title) => {
        setCurrentAssignmentTitle(title);
        setIsSubmissionModalOpen(true);
        setSubmissionsLoading(true);
        try {
            const response = await getSubmissions(assignmentId);
            if (response.success) {
                setSubmissions(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch submissions", error);
            alert("Failed to load submissions");
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        setSelectedCourseId(e.target.value);
    };

    return (
        <div className="teacher-comm-container">
            <TeacherSidebar />

            <div className="comm-sub-sidebar">
                <Link to="/teacher/communication" className="sub-menu-item">Q n A</Link>
                <div className="sub-menu-item active">Assignments</div>
                <Link to="/teacher/announcements" className="sub-menu-item">Announcements</Link>
            </div>

            <main className="comm-main">
                <header className="comm-header">
                    <div className="header-title">
                        <h1>Assignments</h1>
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
                    <button
                        className="btn-create"
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: 'var(--accent-color)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={18} /> Create Assignment
                    </button>
                </header>

                <div className="comm-content">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : assignments.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                            <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No assignments found for this course.</p>
                        </div>
                    ) : (
                        <div className="question-list">
                            {assignments.map((assign) => (
                                <div key={assign._id} className="question-card" style={{ display: 'block' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{assign.title}</h3>
                                        <span style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> Due: {new Date(assign.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{assign.description}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
                                        <div>
                                            {assign.fileUrl && (
                                                <a
                                                    href={assign.fileUrl.startsWith('http') ? assign.fileUrl : `${BASE_URL}${assign.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', textDecoration: 'none', fontSize: '0.9rem' }}
                                                >
                                                    <Download size={14} /> Attached File
                                                </a>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleViewSubmissions(assign._id, assign.title)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #ddd',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                color: '#333'
                                            }}
                                        >
                                            View Submissions
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Assignment Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '2rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Create Assignment</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleCreateSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                                    placeholder="Assignment Title"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '100px' }}
                                    placeholder="Instructions for students..."
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Due Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Attachment (Optional)</label>
                                <div style={{ border: '1px dashed #ccc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <input
                                        type="file"
                                        id="modal-file-upload"
                                        onChange={(e) => setFormData({ ...formData, assignmentFile: e.target.files[0] })}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="modal-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <Upload size={24} style={{ color: '#666' }} />
                                        <span style={{ color: 'var(--accent-color)', fontWeight: '500' }}>
                                            {formData.assignmentFile ? formData.assignmentFile.name : 'Click to upload file'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createLoading}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: 'var(--accent-color)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: createLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {createLoading ? 'Creating...' : 'Create Assignment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Submissions Modal */}
            {isSubmissionModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '12px', width: '700px', maxWidth: '90%', padding: '2rem', maxHeight: '80vh', overflowY: 'auto',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Submissions</h2>
                                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>{currentAssignmentTitle}</p>
                            </div>
                            <button onClick={() => setIsSubmissionModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        {submissionsLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading submissions...</div>
                        ) : submissions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#666' }}>
                                <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <p>No submissions yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {submissions.map((sub, idx) => (
                                    <div key={sub._id || idx} style={{
                                        border: '1px solid #efefef', borderRadius: '8px', padding: '1rem',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        backgroundColor: '#fafafa'
                                    }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold' }}>
                                                {sub.student?.name?.charAt(0) || <User size={20} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{sub.student?.name || 'Unknown Student'}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{sub.student?.email}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>
                                                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <a
                                                href={sub.fileUrl.startsWith('http') ? sub.fileUrl : `${BASE_URL}${sub.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '8px 16px',
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    textDecoration: 'none',
                                                    color: '#333',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                <Download size={16} /> Download
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAssignments;
