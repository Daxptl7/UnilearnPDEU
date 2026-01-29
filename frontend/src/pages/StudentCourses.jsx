import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyCourses } from '../api/student.api';
import { Play, Video, Clock, BookOpen, ChevronRight, Hash } from 'lucide-react';
import { io } from 'socket.io-client';
import { config } from '../config';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const socketRef = useRef();

    useEffect(() => {
        // Fetch enrolled courses
        const fetchCourses = async () => {
            try {
                const response = await fetchMyCourses();
                if (response.success) {
                    setCourses(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();

        // Socket connection for live status
        socketRef.current = io(config.SOCKET_URL);

        return () => socketRef.current.disconnect();
    }, []);

    const handleJoinLive = (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        socketRef.current.emit('check-live-status', joinCode, (response) => {
            if (response.isLive) {
                navigate(`/live/${joinCode}`);
            } else {
                alert("No live session found with this code, or session has ended.");
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
                        <p className="text-gray-600">Manage your courses and join live sessions</p>
                    </div>

                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Video size={20} />
                        Join Live Class
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
                        <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900">No courses enrolled yet</h3>
                        <p className="text-gray-500 mt-2">Explore our catalog to start learning</p>
                        <button onClick={() => navigate('/courses')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Browse Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
                                <div className="relative aspect-video overflow-hidden">
                                    <img src={course.thumbnail} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 text-indigo-600 text-xs font-medium rounded-full shadow-sm">
                                            {course.category || 'Development'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{course.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description || "No description available."}</p>

                                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-[10px]">
                                                {course.instructor?.name?.[0] || 'T'}
                                            </div>
                                            <span className="font-medium text-gray-700">{course.instructor?.name || 'Instructor'}</span>
                                        </div>
                                        <button onClick={() => navigate(`/course/${course.slug}`)} className="flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                                            Continue <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Join Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl mx-auto flex items-center justify-center mb-4">
                                <Video size={32} className="text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Join Live Session</h2>
                            <p className="text-gray-500 text-sm mt-2">Enter the code shared by your instructor</p>
                        </div>

                        <form onSubmit={handleJoinLive}>
                            <div className="mb-6 relative">
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Meeting Code</label>
                                <div className="relative">
                                    <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        placeholder="e.g. 8a2f-..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all">
                                Join Now
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
