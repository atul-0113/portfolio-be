const express = require('express');
const { prisma } = require('../../config/prisma');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalCategories,
      activeCategories,
      inactiveCategories,
      totalTemplates,
      activeTemplates
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: false } }),
      prisma.template.count(),
      prisma.template.count({ where: { isActive: true } })
    ]);

    res.status(200).json({
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers
      },
      categories: {
        total: totalCategories,
        active: activeCategories,
        inactive: inactiveCategories
      },
      templates: {
        total: totalTemplates,
        active: activeTemplates
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
