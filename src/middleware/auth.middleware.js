const { ApiError } = require('../utils/ApiError');
const { prisma } = require('../config/prisma');
const { verifyToken } = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.headers.token;

    if (!token) {
      throw new ApiError(401, 'Not authorized to access this route');
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User is not authorized');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token is invalid or expired'));
    }

    return next(error);
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Admin access required'));
  }

  return next();
};

module.exports = { authMiddleware, adminMiddleware };
