const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');

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

module.exports = router;
