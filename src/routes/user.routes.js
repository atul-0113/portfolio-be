const express = require('express');
const userController  = require('../controllers/user.controller.js');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', authMiddleware,userController.getProfile);
router.patch('/profile', authMiddleware,userController.updateProfile);
router.get('/', authMiddleware, adminMiddleware, userController.getUsers);
module.exports = router;
