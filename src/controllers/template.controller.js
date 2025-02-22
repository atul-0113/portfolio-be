import { Template } from '../models/Template.model.js';
import { ApiError } from '../utils/ApiError.js';

export const templateController = {
    async getTemplate(req, res, next) {
      try {
        const template = await Template.findById(req.user.id);
        if (!template) {
          throw new ApiError(404, 'template not found');
        }
  
        res.status(200).json(template);
      } catch (error) {
        next(error);
      }
    }
  };