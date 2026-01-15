import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import CourseDetail from './pages/CourseDetail';
import Cart from './pages/Cart';

import TeacherLanding from './pages/TeacherLanding';
import TeacherSignup from './pages/TeacherSignup';
import TeacherCommunication from './pages/TeacherCommunication';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherAnnouncements from './pages/TeacherAnnouncements';

function App() {
    const { user, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [viewMode, setViewMode] = useState('student'); // 'student' or 'teacher'

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'student' ? 'teacher' : 'student');
    };

    return (
        <Router>
            <div className="app">
                <Navbar
                    toggleTheme={toggleTheme}
                    isDarkMode={isDarkMode}
                    user={user}
                    toggleLogin={logout}
                    viewMode={viewMode}
                    toggleViewMode={toggleViewMode}
                />
                <Routes>
                    <Route path="/" element={<Home user={user} viewMode={viewMode} toggleViewMode={toggleViewMode} />} />
                    <Route path="/signup" element={<Register />} />
                    <Route path="/login" element={<Login />} />

                    {/* Teacher Routes */}
                    <Route path="/teach" element={<TeacherLanding />} />
                    <Route path="/teacher-signup" element={<TeacherSignup />} />
                    <Route path="/teacher/communication" element={<TeacherCommunication />} />
                    <Route path="/teacher/assignments" element={<TeacherAssignments />} />
                    <Route path="/teacher/announcements" element={<TeacherAnnouncements />} />

                    <Route path="/cart" element={<Cart />} />
                    <Route path="/course/:slug" element={<CourseDetail />} />
                    {/* Add other routes as we build them */}
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
