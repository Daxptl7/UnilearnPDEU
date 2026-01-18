import User from '../models/User.js';
import Course from '../models/Course.js';

// Get teacher profile
export const getTeacherProfile = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id).select('-password');
        res.json({ success: true, data: teacher });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get teacher's courses
export const getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id });
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get teacher dashboard stats
export const getTeacherStats = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id });
        const students = await User.find({ enrollments: { $in: courses.map(c => c._id) } });
        
        const stats = {
            totalCourses: courses.length,
            totalStudents: students.length, // Simplified
            totalReviews: courses.reduce((acc, curr) => acc + (curr.stats.reviews || 0), 0),
            averageRating: 4.8 // Mock for now
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
