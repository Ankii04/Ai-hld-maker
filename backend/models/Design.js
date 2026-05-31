'use strict';

const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

// ─── Sub-Schemas ──────────────────────────────────────────────────────────────

const constraintsSchema = new Schema(
  {
    scale: { type: String, default: '' },
    budget: { type: String, default: '' },
    techPreferences: { type: [String], default: [] },
    expectedUsers: { type: String, default: '' },
  },
  { _id: false }
);

const hldSchema = new Schema(
  {
    summary: { type: String, default: '' },
    nodes: { type: [Schema.Types.Mixed], default: [] },
    edges: { type: [Schema.Types.Mixed], default: [] },
    scalabilityNotes: { type: [String], default: [] },
    tradeoffs: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const lldSchema = new Schema(
  {
    services: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const databaseSchema = new Schema(
  {
    type: { type: String, default: '' },
    rationale: { type: String, default: '' },
    tables: { type: [Schema.Types.Mixed], default: [] },
    cachingStrategy: { type: String, default: '' },
    shardingStrategy: { type: String, default: '' },
  },
  { _id: false }
);

const scalabilitySchema = new Schema(
  {
    loadBalancing: { type: String, default: '' },
    caching: { type: [Schema.Types.Mixed], default: [] },
    sharding: { type: String, default: '' },
    cdnStrategy: { type: String, default: '' },
    estimatedRPS: { type: Number, default: 0 },
    estimatedUsers: { type: String, default: '' },
  },
  { _id: false }
);

const uiuxSchema = new Schema(
  {
    userFlows: { type: [Schema.Types.Mixed], default: [] },
    screens: { type: [Schema.Types.Mixed], default: [] },
    components: { type: [Schema.Types.Mixed], default: [] },
    designSystem: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const challengeModeSchema = new Schema(
  {
    bottlenecks: { type: [Schema.Types.Mixed], default: [] },
    spofs: { type: [Schema.Types.Mixed], default: [] },
    recommendations: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const designSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    summary: {
      type: String,
      default: '',
      maxlength: [2000, 'Summary cannot exceed 2000 characters'],
    },

    status: {
      type: String,
      enum: {
        values: ['draft', 'generating', 'generated', 'error'],
        message: 'Status must be draft, generating, generated, or error',
      },
      default: 'draft',
    },

    productName: {
      type: String,
      trim: true,
      default: '',
    },

    requirements: {
      type: String,
      default: '',
    },

    constraints: {
      type: constraintsSchema,
      default: () => ({}),
    },

    hld: {
      type: hldSchema,
      default: () => ({}),
    },

    lld: {
      type: lldSchema,
      default: () => ({}),
    },

    database: {
      type: databaseSchema,
      default: () => ({}),
    },

    scalability: {
      type: scalabilitySchema,
      default: () => ({}),
    },

    uiux: {
      type: uiuxSchema,
      default: () => ({}),
    },

    challengeMode: {
      type: challengeModeSchema,
      default: () => ({}),
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    shareId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values (not shared designs)
    },

    tags: {
      type: [String],
      default: [],
    },

    systemFlow: {
      type: String,
      default: '',
    },

    designDecisions: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    failureHandling: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    security: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    observability: {
      type: [Schema.Types.Mixed],
      default: [],
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

// ─── Indexes ──────────────────────────────────────────────────────────────────

designSchema.index({ userId: 1, createdAt: -1 });
designSchema.index({ tags: 1 });
designSchema.index({ isPublic: 1, shareId: 1 });

// ─── Pre-Save Hook: Auto-Generate Tags ───────────────────────────────────────

designSchema.pre('save', function (next) {
  try {
    const tags = new Set();

    // Tags from techPreferences
    const techPrefs = this.constraints?.techPreferences || [];
    for (const tech of techPrefs) {
      if (tech && typeof tech === 'string') {
        tags.add(tech.toLowerCase().trim());
      }
    }

    // Tags from scale
    const scale = this.constraints?.scale;
    if (scale && typeof scale === 'string') {
      const scaleLower = scale.toLowerCase().trim();
      tags.add(scaleLower);

      // Add normalized scale tier tags
      if (scaleLower.includes('large') || scaleLower.includes('enterprise')) {
        tags.add('large-scale');
      } else if (scaleLower.includes('medium') || scaleLower.includes('mid')) {
        tags.add('medium-scale');
      } else if (scaleLower.includes('small') || scaleLower.includes('startup')) {
        tags.add('small-scale');
      }
    }

    // Tags from database type
    const dbType = this.database?.type;
    if (dbType && typeof dbType === 'string') {
      tags.add(dbType.toLowerCase().trim());
    }

    // Tags from HLD node types
    const nodes = this.hld?.nodes || [];
    const nodeTypes = new Set(nodes.map((n) => n?.type).filter(Boolean));
    for (const nodeType of nodeTypes) {
      tags.add(nodeType.toLowerCase());
    }

    // Tags from product name words
    const productName = this.productName;
    if (productName && typeof productName === 'string') {
      const words = productName
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      for (const word of words) {
        tags.add(word);
      }
    }

    // Filter and deduplicate — max 20 tags
    this.tags = [...tags].filter((t) => t.length > 1 && t.length <= 50).slice(0, 20);

    next();
  } catch (err) {
    next(err);
  }
});

// ─── Model ────────────────────────────────────────────────────────────────────

const Design = mongoose.model('Design', designSchema);

module.exports = Design;
