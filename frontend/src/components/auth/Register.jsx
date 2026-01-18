import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        role: '',
        email: '',
        phone: '',
        password: '',
        name: '',
        school: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await registerAPI(formData);

            if (response.success) {
                // Update auth context
                login(response.data);
                // Navigate to home
                navigate('/');
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Failed to connect to server. Please make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1>Sign up</h1>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Choose your role!</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Student/Teacher/Admin</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    {formData.role === 'student' && (
                        <div className="form-group">
                            <label>Select your School</label>
                            <select
                                name="school"
                                value={formData.school}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="form-input"
                                style={{ marginTop: '5px' }}
                            >
                                <option value="">Select School...</option>
                                <option value="SOT">SOT (School of Technology)</option>
                                <option value="SOET">SOET (School of Engineering & Technology)</option>
                                <option value="SLS">SLS (School of Liberal Studies)</option>
                                <option value="SOL">SOL (School of Law)</option>
                                <option value="SPM">SPM (School of Petroleum Management)</option>
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="signup-btn" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                <p className="login-link">
                    Already Registered? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
