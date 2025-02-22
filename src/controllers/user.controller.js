const User = require('../models/user.model.js');
const ApiError = require('../utils/ApiError.js');

const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      res.status(200).json({
        user: {
          id: user._id,
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
      const user = await User.findById(req.user.id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          throw new ApiError(400, 'Email already in use');
        }
        user.email = email;
      }

      if (name) {
        user.name = name;
      }

      await user.save();

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name, 
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
