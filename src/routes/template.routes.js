import express from 'express';
import { templateController } from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', templateController.getTemplate);

export default router;