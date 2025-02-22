const { User } = require('../models/user.model.js');
const { ApiError } = require('../utils/ApiError.js');
const { generateToken } = require('../utils/jwt.js');

const authController = {
  async signup(req, res, next) {
    try {
      const { email, password, name, role = 'USER' } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new ApiError(400, 'User already exists');
      }

      const user = await User.create({
        email,
        password,
        name,
        role
      });

      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        throw new ApiError(401, 'Invalid email or password');
      }

      const token = generateToken(user._id);

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    res.status(200).json({
      message: 'Logged out successfully'
    });
  }
};

module.exports = authController;
