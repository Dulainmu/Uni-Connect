// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}


// Async error handler wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error response formatter
const errorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Validation error formatter
const formatValidationErrors = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  return {
    success: false,
    message: 'Validation Error',
    errors
  };
};

// Duplicate key error formatter
const formatDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  return {
    success: false,
    message: `Duplicate field value: ${field} = ${value}. Please use another value.`
  };
};

// Cast error formatter (invalid ObjectId)
const formatCastError = (error) => {
  return {
    success: false,
    message: `Invalid ${error.path}: ${error.value}`
  };
};

// JWT error formatter
const formatJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return {
      success: false,
      message: 'Invalid token. Please log in again.'
    };
  }
  if (error.name === 'TokenExpiredError') {
    return {
      success: false,
      message: 'Your token has expired. Please log in again.'
    };
  }
  return {
    success: false,
    message: 'Token error. Please log in again.'
  };
};

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // Development error response
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production error response
    let error = { ...err };
    error.message = err.message;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const formattedError = formatValidationErrors(err);
      return res.status(400).json(formattedError);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
      const formattedError = formatDuplicateKeyError(err);
      return res.status(400).json(formattedError);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
      const formattedError = formatCastError(err);
      return res.status(400).json(formattedError);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      const formattedError = formatJWTError(err);
      return res.status(401).json(formattedError);
    }

    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
};

module.exports = {
  AppError,
  catchAsync,
  errorResponse,
  globalErrorHandler,
  formatValidationErrors,
  formatDuplicateKeyError,
  formatCastError,
  formatJWTError
}; 