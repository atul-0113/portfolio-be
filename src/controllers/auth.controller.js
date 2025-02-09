import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/jwt.js';

export const authController = {
  async signup(req, res, next) {
    try {
      const { email, password, name } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new ApiError(400, 'User already exists');
      }

      const user = await User.create({
        email,
        password,
        name
      });

      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name
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
          name: user.name
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