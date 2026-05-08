const express = require('express');
const resumeController = require('../controllers/resume.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const {
  resumeDocumentValidation,
  resumeUpdateValidation,
  resumeTemplateValidation,
  uuidValidation
} = require('../validators/resume.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/templates', resumeController.listTemplates);
router.post('/templates', validate(resumeTemplateValidation), resumeController.createTemplate);
router.get('/templates/:id', validate([uuidValidation()]), resumeController.getTemplate);

router.get('/', resumeController.listResumes);
router.post('/', validate(resumeDocumentValidation), resumeController.createResume);
router.get('/:id', validate([uuidValidation()]), resumeController.getResume);
router.patch('/:id', validate(resumeUpdateValidation), resumeController.updateResume);
router.delete('/:id', validate([uuidValidation()]), resumeController.deleteResume);

router.get('/:id/versions', validate([uuidValidation()]), resumeController.listVersions);

module.exports = router;
