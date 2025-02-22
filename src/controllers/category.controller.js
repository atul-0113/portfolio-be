import { Category } from '../models/Category.model.js';
import { ApiError } from '../utils/ApiError.js';

export const categoryController = {
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