const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/ApiError');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => err.msg);
    throw new ApiError(400, extractedErrors[0]);
  };
};

module.exports = { validate };
