import express from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const authValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

router.post('/signup', validate(authValidation), authController.signup);
router.post('/login', validate(authValidation), authController.login);
router.post('/logout', authController.logout);

export default router;