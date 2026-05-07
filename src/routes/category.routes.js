const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload')

const router = express.Router();

router.use(authMiddleware);

router.get('/', authMiddleware, categoryController.getCategory);
router.post('/', authMiddleware, adminMiddleware, upload.single('categoryImage'), categoryController.createCategory)
router.patch('/:id', authMiddleware, adminMiddleware, upload.single('categoryImage'), categoryController.updateCategory);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('categoryImage'), categoryController.updateCategory);
module.exports = router;
