import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Sun, Moon, User } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleTheme, isDarkMode, user, toggleLogin, viewMode, toggleViewMode }) => {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">UniLearn</span>
                    <span className="logo-sub">by PDPU</span>
                </Link>
                <Link to="/my-learning" className="nav-link">My Learning</Link>
                <Link to="/teach" className="nav-link">Teach on Unilearn</Link>
            </div>

            <div className="navbar-center">
                <div className="search-bar">
                    <Search className="search-icon" size={20} />
                    <input type="text" placeholder="Search" />
                </div>
            </div>

            <div className="navbar-right">
                {user?.role === 'teacher' && (
                    <button className="view-toggle-btn" onClick={toggleViewMode}>
                        {viewMode === 'student' ? 'Switch to Teacher View' : 'Switch to Student View'}
                    </button>
                )}

                <Link to="/cart" className="icon-btn" aria-label="Cart">
                    <ShoppingCart size={24} />
                </Link>
                <button className="icon-btn" aria-label="Wishlist">
                    <Heart size={24} />
                </button>

                {user ? (
                    <div className="user-profile">
                        <span className="user-name">Welcome, {user.name}</span>
                        <div className="avatar__placeholder">
                            <User size={20} />
                        </div>
                        <Link to="/" className="auth-btn secondary" onClick={toggleLogin}>Log Out</Link>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="auth-btn secondary">LOG IN</Link>
                        <Link to="/signup" className="auth-btn primary">SIGN UP</Link>
                    </div>
                )}

                <button className="icon-btn theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                </button>

                {/* Helper visual for Avatar A circle from wireframe */}
                <div className="avatar-circle">
                    <span>A</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
