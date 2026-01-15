import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
            const response = await loginAPI(formData);

            if (response.success) {
                // Update auth context
                login(response.data);
                // Navigate to home
                navigate('/');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Failed to connect to server. Please make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneLogin = () => {
        setError('Phone login is not yet implemented');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Welcome Back.....</h1>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <button className="phone-login-btn" onClick={handlePhoneLogin} disabled={loading}>
                    Log in with phone number
                </button>

                <p className="signup-link">
                    Not Registered?<Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
