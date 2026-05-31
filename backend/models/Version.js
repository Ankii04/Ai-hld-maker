'use strict';

const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

const versionSchema = new Schema(
  {
    designId: {
      type: Types.ObjectId,
      ref: 'Design',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    commitMessage: {
      type: String,
      default: 'Manual save snapshot',
      trim: true,
      maxlength: 500,
    },
    hld: {
      type: Schema.Types.Mixed,
    },
    lld: {
      type: Schema.Types.Mixed,
    },
    database: {
      type: Schema.Types.Mixed,
    },
    scalability: {
      type: Schema.Types.Mixed,
    },
    uiux: {
      type: Schema.Types.Mixed,
    },
    authorId: {
      type: Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for retrieval
versionSchema.index({ designId: 1, versionNumber: -1 });

module.exports = mongoose.model('Version', versionSchema);
