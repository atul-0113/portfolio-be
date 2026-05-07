const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError.js');
const fs = require('fs');
const path = require('path');

const categoryController = {
  async getCategory(req, res, next) {
    try {
      const category = await prisma.category.findMany();

      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  },
  async createCategory(req, res , next) {
    try {
      const { categoryName, isActive } = req.body;
      const categoryImagePath = req.file ? `uploads/${req.file.filename}` : null;

      if (!categoryName) {
        throw new ApiError(400, 'categoryName is required');
      }
  
      const category = await prisma.category.create({
        data: {
          categoryName,
          ...(typeof isActive !== 'undefined' ? { isActive: isActive === true || isActive === 'true' } : {}),
          categoryImagePath,
          createdById: req.user.id
        }
      });
  
      res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      next(error);
    }
  },
  async updateCategory(req, res, next) {
    try {
      const { categoryName, isActive } = req.body;
      const categoryId = req.params.id;
  
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      const data = {};
      if (categoryName) {
        data.categoryName = categoryName;
      }

      if (typeof isActive !== 'undefined') {
        data.isActive = isActive === true || isActive === 'true';
      }
  
      if (req.file) {
        const oldImagePath = category.categoryImagePath;
        if (oldImagePath) {
          const oldImageFilePath = path.join(__dirname, '../../', 'public', oldImagePath);
          if (fs.existsSync(oldImageFilePath)) {
            fs.unlinkSync(oldImageFilePath);
          }
        }
  
        data.categoryImagePath = `uploads/${req.file.filename}`;
      }
  
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data
      });
  
      res.status(200).json({
        message: 'Category updated successfully',
        category: updatedCategory
      });
    } catch (error) {
      next(error);
    }
  }
  
};

module.exports = categoryController;
