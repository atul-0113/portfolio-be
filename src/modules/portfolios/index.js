const express = require('express');
const categoryRoutes = require('../../routes/category.routes');

const router = express.Router();

router.use('/categories', categoryRoutes);

router.get('/', (req, res) => {
  res.status(501).json({
    message: 'Portfolio APIs are scaffolded and will be wired in a future iteration.'
  });
});

module.exports = router;
