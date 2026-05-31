'use strict';

const isDev = process.env.NODE_ENV !== 'production';

// ─── Error Handler Middleware ─────────────────────────────────────────────────

/**
 * Global Express error-handling middleware.
 * Must be the LAST middleware registered in server.js.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  // Log error in development
  if (isDev) {
    console.error('\n[ErrorHandler]', {
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else {
    // In production, log without stack trace
    console.error(`[ErrorHandler] ${err.name}: ${err.message}`);
  }

  // Build default error shape
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = undefined;

  // ── Mongoose CastError (invalid ObjectId) ──────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: "${err.value}" is not a valid ID.`;
  }

  // ── Mongoose ValidationError ───────────────────────────────────────────────
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed. Please check the provided fields.';
    errors = Object.entries(err.errors).reduce((acc, [field, errorObj]) => {
      acc[field] = errorObj.message;
      return acc;
    }, {});
  }

  // ── Mongoose Duplicate Key Error (code 11000) ──────────────────────────────
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : 'value';
    message = `A record with ${field} "${value}" already exists.`;
  }

  // ── JWT Errors ─────────────────────────────────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  } else if (err.name === 'NotBeforeError') {
    statusCode = 401;
    message = 'Authentication token is not yet valid.';
  }

  // ── Express Body Parser Errors ─────────────────────────────────────────────
  else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large. Maximum allowed size is 10mb.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body.';
  }

  // ── Build Response ─────────────────────────────────────────────────────────
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace only in development
  if (isDev && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
