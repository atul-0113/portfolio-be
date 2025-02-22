const { Category } = require('../models/Category.model.js');
const { ApiError } = require('../utils/ApiError.js');

const categoryController = {
  async getCategory(req, res, next) {
    try {
      const category = await Category.findById(req.user.id);
      if (!category) {
        throw new ApiError(404, 'User not found');
      }

      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;
