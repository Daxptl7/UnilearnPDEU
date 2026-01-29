import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, school } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'User already exists');
    }

    // Create user
    const personId = 'PDEU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      school,
      personId
    });

    // Generate token
    const token = generateToken(user._id);

    sendSuccess(res, 201, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
      token
    }, 'User registered successfully');

  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id);

    sendSuccess(res, 200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
      token
    }, 'Login successful');

  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses', 'name slug thumbnail');
    
    sendSuccess(res, 200, user, 'User retrieved successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'Email already registered');
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP to DB (upsert: update if exists, insert if not)
    // Dynamic import for Otp model to avoid circular dependency issues if any, or just standard import
    // Assuming standard import works if we add it to the top
    const Otp = (await import('../models/Otp.js')).default;
    
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // TODO: Send email
    // For now, log to console
    console.log(`--------------------------------`);
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`--------------------------------`);

    sendSuccess(res, 200, { email }, 'OTP sent successfully to your email');
  } catch (error) {
    console.error('Send OTP error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Verify OTP and Register
// @route   POST /api/auth/verify-otp-register
// @access  Public
export const verifyOtpRegister = async (req, res) => {
  try {
    const { email, otp, name, password, role } = req.body;

    const Otp = (await import('../models/Otp.js')).default;

    // Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return sendError(res, 400, 'Invalid or expired OTP');
    }

    // Check if user exists (double check)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'User already exists');
    }

    // Create user
    const personId = 'PDEU-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'teacher', // Default to teacher for this flow
      personId
    });

    // Delete OTP used
    await Otp.deleteOne({ email });

    // Generate token
    const token = generateToken(user._id);

    sendSuccess(res, 201, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }, 'User registered successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email, // Allow email update? Usually requires verify. Let's allow for now as per "changeable".
        phone: req.body.phone,
        address: req.body.address,
        school: req.body.school,
        socialLinks: req.body.socialLinks
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    sendSuccess(res, 200, user, 'Profile updated successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
