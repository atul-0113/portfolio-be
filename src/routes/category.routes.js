import express from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', categoryController.getCategory);

export default router;