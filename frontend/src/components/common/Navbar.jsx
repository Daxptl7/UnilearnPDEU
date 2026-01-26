import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Video, MonitorPlay, Moon, Sun } from 'lucide-react';
import './Navbar.css';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ user, toggleLogin, viewMode, toggleViewMode }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);

    const { theme, toggleTheme } = useTheme();

    // Ref for closing dropdown on click outside
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCreateDropdownOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [scrolled]);

    const handleLogout = () => {
        toggleLogin();
        navigate('/');
    };

    const isHome = location.pathname === '/';
    // Transparent only if on Home Page AND NOT in teacher mode
    const isTransparent = isHome && viewMode !== 'teacher' && !scrolled;
    const navClass = isTransparent ? 'transparent' : 'scrolled';

    return (
        <header className={`headerContainer ${navClass} dark:bg-gray-900 dark:border-b dark:border-gray-800`}>
            <div className="nav-container">
                {/* Logo Section */}
                <Link to="/" className="logoGroup">
                    <img src="/logo.png" alt="PDEU Logo" style={{ height: '80px', width: 'auto' }} />
                </Link>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-4"
                    aria-label="Toggle Dark Mode"
                >
                    {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-700 dark:text-gray-300" />}
                </button>

                {/* Hamburger for Mobile */}
                <button className="hamburger dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                {/* Menu */}
                <ul className={`menu ${mobileMenuOpen ? 'show' : ''} dark:bg-gray-900`}>
                    <li>
                        <Link
                            to="/"
                            className="menuLink dark:text-gray-300 dark:hover:text-white"
                            onClick={() => {
                                if (viewMode === 'teacher') toggleViewMode();
                            }}
                        >
                            Home
                        </Link>
                    </li>
                    <li><Link to="/courses" className="menuLink dark:text-gray-300 dark:hover:text-white">Courses</Link></li>

                    {user ? (
                        <>
                            {user.role === 'teacher' && (
                                <>


                                    <li>
                                        <span
                                            onClick={() => {
                                                toggleViewMode();
                                                if (viewMode !== 'teacher') {
                                                    navigate('/teacher/courses');
                                                } else {
                                                    navigate('/');
                                                }
                                            }}
                                            className="menuLink dark:text-gray-300 dark:hover:text-white"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {viewMode === 'teacher' ? 'Switch to Student' : 'Switch to Teacher'}
                                        </span>
                                    </li>
                                </>
                            )}
                            <li><Link to="/profile" className="menuLink dark:text-gray-300 dark:hover:text-white">Profile</Link></li>
                            {user.role === 'teacher' && viewMode === 'teacher' ? (
                                <li><Link to="/teacher/courses" className="menuLink dark:text-gray-300 dark:hover:text-white">Dashboard</Link></li>
                            ) : (
                                <>
                                    <li><Link to="/my-courses" className="menuLink dark:text-gray-300 dark:hover:text-white">My Courses</Link></li>
                                    <li><Link to="/cart" className="menuLink dark:text-gray-300 dark:hover:text-white">My Cart</Link></li>
                                </>
                            )}
                            <li>
                                <button onClick={handleLogout} className="auth-btn dark:bg-red-600 dark:text-white">Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className="menuLink dark:text-gray-300 dark:hover:text-white">Login</Link></li>
                            <li><Link to="/signup" className="auth-btn dark:bg-indigo-600 dark:text-white">Sign Up</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </header>
    );
};

export default Navbar;
