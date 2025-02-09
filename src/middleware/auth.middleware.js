import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized to access this route');
    }

    try {
      const decoded = verifyToken(token);
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      throw new ApiError(401, 'Token is invalid or expired');
    }
  } catch (error) {
    next(error);
  }
};