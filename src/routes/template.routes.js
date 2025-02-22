const express = require('express');
const templateController = require('../controllers/template.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', templateController.getTemplate);

module.exports = router;
