import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="profile-container">Loading profile...</div>;
    }

    const isStudent = user.role === 'student' || user.role === 'Student';

    return (
        <div className="profile-container">
            <div className={`profile-card ${isStudent ? 'student-theme' : ''}`}>
                <div className="profile-header">
                    <div className="profile-image-wrapper">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="profile-image" />
                        ) : (
                            <div className="profile-placeholder">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h2 className="profile-name">{user.name}</h2>
                    <p className="profile-role">{user.role}</p>
                </div>

                <div className="profile-details">
                    {/* Show School for Students */}
                    {isStudent && (
                        <div className="detail-item">
                            <span className="detail-label">School</span>
                            <span className="detail-value" style={{ color: '#A6192E', fontWeight: 'bold' }}>
                                {user.school || 'Not Assigned'}
                            </span>
                        </div>
                    )}

                    <div className="detail-item">
                        <span className="detail-label">Person ID</span>
                        <span className="detail-value id-value">{user.personId || 'Not Assigned'}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{user.email}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{user.phone || 'Not Provided'}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{user.address || 'Not Provided'}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Birthday</span>
                        <span className="detail-value">
                            {user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Not Provided'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
