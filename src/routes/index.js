const express = require('express');

const authRoutes = require('../modules/auth');
const userRoutes = require('../modules/users');
const portfolioRoutes = require('../modules/portfolios');
const templateRoutes = require('../modules/templates');
const categoryRoutes = require('./category.routes');
const resumeRoutes = require('../modules/resumes');
const aiRoutes = require('../modules/ai');
const billingRoutes = require('../modules/billing');
const adminRoutes = require('../modules/admin');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/portfolios', portfolioRoutes);
router.use('/categories', categoryRoutes);
router.use('/templates', templateRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ai', aiRoutes);
router.use('/billing', billingRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
