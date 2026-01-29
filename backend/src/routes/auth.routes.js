import express from 'express';
import { register, login, getMe, sendOtp, verifyOtpRegister, updateDetails } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/send-otp', sendOtp);
router.post('/verify-otp-register', verifyOtpRegister);
router.put('/update-details', protect, updateDetails);

export default router;
