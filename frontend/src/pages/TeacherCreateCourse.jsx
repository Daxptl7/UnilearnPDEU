import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { createCourse } from '../api/teacher.api';
import './TeacherCommunication.css';

const TeacherCreateCourse = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subtitle: '',
        description: '',
        price: '',
        category: 'SOT',
        duration: '',
        thumbnail: '',
        whatYouLearn: '', // Comma separated for now
        slug: '' // Generated or manual
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Basic slug generation
            const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            // Format whatYouLearn
            const whatYouLearnArray = formData.whatYouLearn.split(',').map(s => s.trim()).filter(s => s);

            const payload = {
                ...formData,
                slug,
                whatYouLearn: whatYouLearnArray,
                price: Number(formData.price)
            };

            const response = await createCourse(payload);
            if (response.success) {
                navigate(`/teacher/courses/${response.data.slug}`); // Go to manage page
            }
        } catch (error) {
            console.error("Failed to create course", error);
            alert("Failed to create course. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="teacher-comm-container">
            <TeacherSidebar />
            <main className="comm-main" style={{ padding: '20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1>Create New Course</h1>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>

                        <div className="form-group">
                            <label>Course Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>

                        <div className="form-group">
                            <label>Subtitle (Short Description)</label>
                            <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>

                        <div className="form-group">
                            <label>Detailed Description</label>
                            <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}></textarea>
                        </div>

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>Price ($)</label>
                                <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                    <option value="SOT">SOT (School of Technology)</option>
                                    <option value="SOET">SOET (School of Engineering & Technology)</option>
                                    <option value="SLS">SLS (School of Liberal Studies)</option>
                                    <option value="SOL">SOL (School of Law)</option>
                                    <option value="SPM">SPM (School of Petroleum Management)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Duration (e.g. "10 hours")</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>

                        <div className="form-group">
                            <label>Thumbnail URL</label>
                            <input type="text" name="thumbnail" placeholder="http://..." value={formData.thumbnail} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            {/* In real app, use file upload input here */}
                        </div>

                        <div className="form-group">
                            <label>What You Will Learn (comma separated)</label>
                            <textarea name="whatYouLearn" placeholder="React, Node.js, ..." value={formData.whatYouLearn} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}></textarea>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            backgroundColor: '#6C63FF', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                        }}>
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default TeacherCreateCourse;
