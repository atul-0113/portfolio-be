const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError.js');

const templateController = {
  async getTemplate(req, res, next) {
    try {
      const templates = await prisma.template.findMany({
        where: { createdById: req.user.id }
      });

      if (!templates.length) {
        throw new ApiError(404, 'Template not found');
      }

      res.status(200).json(templates);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = templateController;
