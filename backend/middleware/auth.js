'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract Bearer token from the Authorization header.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

// ─── protect ─────────────────────────────────────────────────────────────────

/**
 * Middleware to verify JWT and populate req.user.
 * Rejects with 401 if token is missing, invalid, or the user no longer exists.
 */
async function protect(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Automatically grant Pro plan to specifically allowed email (case-insensitive)
    if (user.email && user.email.toLowerCase() === 'ankitkr1841@gmail.com') {
      user.plan = 'pro';
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// ─── requirePro ──────────────────────────────────────────────────────────────

/**
 * Middleware to restrict access to Pro plan users only.
 * Must be used AFTER the protect middleware.
 * Returns 403 with UPGRADE_REQUIRED error code if the user is on the free plan.
 */
function requirePro(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.plan !== 'pro') {
    return res.status(403).json({
      success: false,
      error: 'UPGRADE_REQUIRED',
      feature: req.featureName || 'this feature',
      message: `Upgrade to Pro to access ${req.featureName || 'this feature'}.`,
    });
  }

  next();
}

// ─── setFeature ───────────────────────────────────────────────────────────────

/**
 * Returns a middleware that sets req.featureName before passing to requirePro.
 * Use this to label which feature is being gate-kept for better error messages.
 *
 * @param {string} name - Human-readable feature name, e.g. 'Challenge Mode'
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/:id/challenge', protect, setFeature('Challenge Mode'), requirePro, handler);
 */
function setFeature(name) {
  return function featureGate(req, res, next) {
    req.featureName = name;
    next();
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { protect, requirePro, setFeature };
