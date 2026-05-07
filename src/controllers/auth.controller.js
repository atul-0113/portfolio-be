const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError.js');
const { generateToken } = require('../utils/jwt.js');

const authController = {
  async signup(req, res, next) {
    try {
      const { email, password, name } = req.body;

      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        throw new ApiError(400, 'User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER'
        }
      });

      const token = generateToken(user.id);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          token
        },
        
      });
    } catch (error) {
      next(error);
    }
  },

  async register(req, res, next) {
    return authController.signup(req, res, next);
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ApiError(401, 'Invalid email or password');
      }

      const token = generateToken(user.id);

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          token
        },
        
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
