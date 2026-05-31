'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sign a JWT for the given user ID.
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {string} Signed JWT token
 */
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Send validation errors as a 422 response if express-validator found issues.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {boolean} true if errors were sent, false if clean
 */
function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the provided fields.',
      errors: errors.array().reduce((acc, err) => {
        acc[err.path] = err.msg;
        return acc;
      }, {}),
    });
    return true;
  }
  return false;
}

// ─── Validation Rules ─────────────────────────────────────────────────────────

const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .isLength({ max: 128 })
    .withMessage('Password cannot exceed 128 characters.'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required.'),
];

// ─── POST /api/auth/signup ─────────────────────────────────────────────────────

router.post('/signup', signupValidation, async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { name, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user — password hashing is handled in User pre-save hook
    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.email && user.email.toLowerCase() === 'ankitkr1841@gmail.com' ? 'pro' : user.plan,
        designsGeneratedThisMonth: user.designsGeneratedThisMonth,
        totalDesigns: user.totalDesigns,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', loginValidation, async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email, password } = req.body;

    // Explicitly select password field (it's excluded by default via select: false)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Return generic message to avoid email enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.email && user.email.toLowerCase() === 'ankitkr1841@gmail.com' ? 'pro' : user.plan,
        designsGeneratedThisMonth: user.designsGeneratedThisMonth,
        totalDesigns: user.totalDesigns,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

router.get('/me', protect, async (req, res, next) => {
  try {
    // Re-fetch to ensure fresh data (protect only grabs essentials)
    const user = await User.findById(req.user._id).select(
      'name email plan designsGeneratedThisMonth totalDesigns monthlyResetDate shareLinks createdAt updatedAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.email && user.email.toLowerCase() === 'ankitkr1841@gmail.com' ? 'pro' : user.plan,
        designsGeneratedThisMonth: user.designsGeneratedThisMonth,
        totalDesigns: user.totalDesigns,
        monthlyResetDate: user.monthlyResetDate,
        shareLinks: user.shareLinks,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
