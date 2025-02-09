import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: 'error',
      message: err.message
    });
  }

  console.error(err);
  
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};