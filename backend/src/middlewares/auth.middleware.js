import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return sendError(res, 401, 'Not authorized to access this route');
    }

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized to access this route');
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};
