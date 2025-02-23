const Category  = require('../models/Category.model.js');
const { ApiError } = require('../utils/ApiError.js');
const path = require('path')
const categoryController = {
  async getCategory(req, res, next) {
    try {
      const category = await Category.find();
      if (!category) {
        throw new ApiError(404, 'No Category found');
      }

      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  },
  async createCategory(req, res , next) {
    try {
      const { categoryName } = req.body;
      const categoryImagePath = req.file ? `uploads/${req.file.filename}` : null; // Save path in DB
  
      const category = new Category({
        categoryName,
        categoryImagePath,
        createdById : req.user.id
      });
  
      await category.save();
  
      res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async updateCategory(req, res, next) {
    try {
      const { categoryName } = req.body;
      const categoryId = req.params.id; // Assuming the category id is in the URL params
  
      // Find the category by ID
      const category = await Category.findById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Update category name if provided
      if (categoryName) {
        category.categoryName = categoryName;
      }
  
      // If a new image is uploaded, update the categoryImagePath
      if (req.file) {
        // Delete the old image file if it exists
        const oldImagePath = category.categoryImagePath;
        if (oldImagePath) {
          const fs = require('fs');
          const oldImageFilePath = path.join(__dirname, '../../', 'public', oldImagePath); // Path to old image file
          fs.unlinkSync(oldImageFilePath); // Delete old file
        }
  
        // Save the new image path in the DB
        category.categoryImagePath = `uploads/${req.file.filename}`;
      }
  
      // Save the updated category
      await category.save();
  
      res.status(200).json({
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
  
};

module.exports = categoryController;
