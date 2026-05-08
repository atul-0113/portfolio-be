const express = require('express');
const resumeController = require('../controllers/resume.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/templates', resumeController.listTemplates);
router.post('/templates', resumeController.createTemplate);
router.get('/templates/:id', resumeController.getTemplate);

router.get('/', resumeController.listResumes);
router.post('/', resumeController.createResume);
router.get('/:id', resumeController.getResume);
router.patch('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

router.get('/:id/versions', resumeController.listVersions);
router.post('/:id/versions', resumeController.createVersion);

module.exports = router;
