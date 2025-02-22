const Template = require('../models/Template.model.js');
const ApiError = require('../utils/ApiError.js');

const templateController = {
  async getTemplate(req, res, next) {
    try {
      const template = await Template.findById(req.user.id);
      if (!template) {
        throw new ApiError(404, 'Template not found');
      }

      res.status(200).json(template);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = templateController;
