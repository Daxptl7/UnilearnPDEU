import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './TeacherSignup.css';

const TeacherSignup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Simplified State - No OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'teacher'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Directly call register instead of OTP flow
            const response = await api.post('/auth/register', {
                ...formData
            });

            if (response.data.success) {
                login(response.data.data);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="teacher-signup-container">
            <div className="signup-card">
                <h2>Become a instructor</h2>
                <p className="subtitle">Discover a community<br />of online instructors</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Create Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="signup-btn" disabled={loading}>
                        {loading ? 'Sign Up' : 'Sign Up'}
                    </button>
                </form>

                <p className="login-link">
                    Already Registered? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default TeacherSignup;
