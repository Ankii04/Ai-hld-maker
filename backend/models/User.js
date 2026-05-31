'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },

    plan: {
      type: String,
      enum: {
        values: ['free', 'pro'],
        message: 'Plan must be either free or pro',
      },
      default: 'free',
    },

    designsGeneratedThisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },

    monthlyResetDate: {
      type: Date,
      default: Date.now,
    },

    totalDesigns: {
      type: Number,
      default: 0,
      min: 0,
    },

    shareLinks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Pre-Save Hook: Password Hashing ─────────────────────────────────────────

userSchema.pre('save', async function (next) {
  // Only hash when password has actually been modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare a plain-text candidate password against the stored hash.
 * @param {string} candidatePassword - The plain-text password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('Password field not selected. Use .select("+password") in your query.');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Static Methods ───────────────────────────────────────────────────────────

/**
 * Check and reset the monthly design generation count if a new month has started.
 * Returns the updated user document.
 * @param {string|ObjectId} userId
 * @returns {Promise<import('mongoose').Document>}
 */
userSchema.statics.checkMonthlyLimit = async function (userId) {
  const user = await this.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const lastReset = new Date(user.monthlyResetDate);

  const isNewMonth =
    now.getFullYear() > lastReset.getFullYear() ||
    (now.getFullYear() === lastReset.getFullYear() && now.getMonth() > lastReset.getMonth());

  if (isNewMonth) {
    user.designsGeneratedThisMonth = 0;
    user.monthlyResetDate = now;
    await user.save();
  }

  return user;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const User = mongoose.model('User', userSchema);

module.exports = User;
