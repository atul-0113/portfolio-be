const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload')

const router = express.Router();

router.use(authMiddleware);

router.get('/', authMiddleware,categoryController.getCategory);
router.post('/', authMiddleware,upload.single('categoryImage'),categoryController.createCategory)
router.put('/:id',authMiddleware,upload.single('categoryImage'), categoryController.updateCategory);
module.exports = router;
