const { ApiError } = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.token) {
      token = req.headers.token;
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

module.exports = { authMiddleware };
