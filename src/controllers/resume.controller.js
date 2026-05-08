const { resumeService } = require('../services/resume.service');

const resumeController = {
  async listResumes(req, res, next) {
    try {
      const resumes = await resumeService.listResumes(req.user);
      res.status(200).json(resumes);
    } catch (error) {
      next(error);
    }
  },

  async createResume(req, res, next) {
    try {
      const resume = await resumeService.createResume(req.user, req.body);
      res.status(201).json({
        message: 'Resume created successfully',
        resume
      });
    } catch (error) {
      next(error);
    }
  },

  async getResume(req, res, next) {
    try {
      const resume = await resumeService.getResume(req.params.id, req.user);
      res.status(200).json(resume);
    } catch (error) {
      next(error);
    }
  },

  async updateResume(req, res, next) {
    try {
      const resume = await resumeService.updateResume(req.params.id, req.user, req.body);
      res.status(200).json({
        message: 'Resume updated successfully',
        resume
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteResume(req, res, next) {
    try {
      await resumeService.deleteResume(req.params.id, req.user);
      res.status(200).json({
        message: 'Resume deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async listVersions(req, res, next) {
    try {
      const versions = await resumeService.listVersions(req.params.id, req.user);
      res.status(200).json(versions);
    } catch (error) {
      next(error);
    }
  },

  async listTemplates(req, res, next) {
    try {
      const templates = await resumeService.listTemplates(req.user);
      res.status(200).json(templates);
    } catch (error) {
      next(error);
    }
  },

  async createTemplate(req, res, next) {
    try {
      const template = await resumeService.createTemplate(req.user, req.body);
      res.status(201).json({
        message: 'Resume template created successfully',
        template
      });
    } catch (error) {
      next(error);
    }
  },

  async getTemplate(req, res, next) {
    try {
      const template = await resumeService.getTemplate(req.params.id, req.user);
      res.status(200).json(template);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = resumeController;
