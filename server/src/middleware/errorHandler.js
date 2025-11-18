const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  // Specific error types
  if (err.code === 'SQLITE_CONSTRAINT') {
    status = 400;
    if (err.message.includes('UNIQUE')) {
      message = 'A record with this information already exists';
    } else {
      message = 'Database constraint violation';
    }
  }

  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  }

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON payload';
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFound
};
