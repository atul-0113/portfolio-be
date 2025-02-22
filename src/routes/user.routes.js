const express = require('express');
const userController  = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

module.exports = router;
