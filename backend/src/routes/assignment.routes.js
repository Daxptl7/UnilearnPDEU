import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { 
    createAssignment, 
    getAssignments, 
    submitAssignment, 
    getSubmissions 
} from '../controllers/assignment.controller.js';

const router = express.Router();

// Teacher: Create Assignment
router.post('/create', protect, authorize('teacher'), upload.single('assignmentFile'), createAssignment);

// Public/Student (Auth): Get Assignments for a course (Student gets submission status too)
router.get('/:courseId', protect, getAssignments);

// Student: Submit Assignment
router.post('/:assignmentId/submit', protect, authorize('student'), upload.single('submissionFile'), submitAssignment);

// Teacher: Get Submissions for an assignment
router.get('/:assignmentId/submissions', protect, authorize('teacher'), getSubmissions);

export default router;
