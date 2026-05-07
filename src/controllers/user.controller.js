const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError.js');

const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (email && email !== user.email) {
        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) {
          throw new ApiError(400, 'Email already in use');
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(email ? { email } : {}),
          ...(name ? { name } : {})
        }
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        }
      });
    } catch (error) {
      next(error);
    }
  },
  async getUsers(req,res,next){
    try {
      const user_list = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isSubscribed: true,
          mobileNumber: true,
          createdAt: true
        }
      });

      res.status(200).json(user_list);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
