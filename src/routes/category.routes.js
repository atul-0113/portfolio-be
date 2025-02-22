const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', categoryController.getCategory);

module.exports = router;
