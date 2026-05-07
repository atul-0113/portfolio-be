const express = require('express');

const createTodoRouter = (featureName) => {
  const router = express.Router();

  router.all('*', (req, res) => {
    res.status(501).json({
      message: `${featureName} is marked TODO Later and will be wired in a future iteration.`
    });
  });

  return router;
};

module.exports = { createTodoRouter };
