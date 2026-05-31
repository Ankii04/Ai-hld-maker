'use strict';

const express = require('express');
const { nanoid } = require('nanoid');
const Design = require('../models/Design');
const User = require('../models/User');
const Version = require('../models/Version');
const { protect, requirePro, setFeature } = require('../middleware/auth');
const { generateDesign, generateChallenge } = require('../services/aiService');

const router = express.Router();

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_PLAN_MONTHLY_LIMIT = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verify that a design belongs to the requesting user.
 * Returns the design document or sends a 404/403 response.
 *
 * @param {string} designId
 * @param {string} userId
 * @param {import('express').Response} res
 * @returns {Promise<import('mongoose').Document|null>} Design doc or null if response was sent
 */
async function findOwnedDesign(designId, userId, res) {
  const design = await Design.findById(designId);
  if (!design) {
    res.status(404).json({ success: false, message: 'Design not found.' });
    return null;
  }
  if (design.userId.toString() !== userId.toString()) {
    res.status(403).json({ success: false, message: 'You do not have permission to access this design.' });
    return null;
  }
  return design;
}

// ─── Apply protect to all routes below (except public share) ──────────────────
// Note: /public/:shareId is defined BEFORE the protect middleware application

// ─── GET /api/designs/public/:shareId  (NO AUTH) ──────────────────────────────

router.get('/public/:shareId', async (req, res, next) => {
  try {
    const { shareId } = req.params;

    const design = await Design.findOne({ shareId, isPublic: true }).lean();
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Shared design not found or is no longer public.',
      });
    }

    res.status(200).json({
      success: true,
      data: design,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Apply protect middleware to all subsequent routes ────────────────────────

router.use(protect);

// ─── GET /api/designs  ────────────────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const designs = await Design.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('title summary status productName tags createdAt updatedAt isPublic shareId')
      .lean();

    res.status(200).json({
      success: true,
      data: designs,
      count: designs.length,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/designs  ───────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
  try {
    const {
      productName = '',
      title,
      requirements = '',
      constraints = {},
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
      });
    }

    const design = await Design.create({
      userId: req.user._id,
      title: title.trim(),
      productName: productName.trim(),
      requirements,
      constraints,
      status: req.body.status || 'draft',
      hld: req.body.hld || {},
      lld: req.body.lld || {},
      database: req.body.database || {},
      scalability: req.body.scalability || {},
      uiux: req.body.uiux || {},
      challengeMode: req.body.challengeMode || {},
    });

    // Increment user's total designs counter
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalDesigns: 1 } });

    res.status(201).json({
      success: true,
      message: 'Design created successfully.',
      data: design,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/designs/:id  ────────────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
  try {
    const design = await findOwnedDesign(req.params.id, req.user._id, res);
    if (!design) return;

    res.status(200).json({
      success: true,
      data: design,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/designs/:id  ────────────────────────────────────────────────────

router.put('/:id', async (req, res, next) => {
  try {
    const design = await findOwnedDesign(req.params.id, req.user._id, res);
    if (!design) return;

    // Allowed fields for manual update (whiteboard saves, metadata edits)
    const {
      title,
      requirements,
      constraints,
      productName,
      isPublic,
    } = req.body;

    // Partial update — only update provided fields
    if (title !== undefined) design.title = title.trim();
    if (requirements !== undefined) design.requirements = requirements;
    if (constraints !== undefined) design.constraints = { ...design.constraints, ...constraints };
    if (productName !== undefined) design.productName = productName.trim();
    if (isPublic !== undefined && typeof isPublic === 'boolean') design.isPublic = isPublic;

    // Allow direct HLD node/edge overrides (whiteboard drag saves)
    if (req.body.hld) {
      const { nodes, edges, summary, scalabilityNotes, tradeoffs } = req.body.hld;
      if (nodes !== undefined) design.hld.nodes = nodes;
      if (edges !== undefined) design.hld.edges = edges;
      if (summary !== undefined) design.hld.summary = summary;
      if (scalabilityNotes !== undefined) design.hld.scalabilityNotes = scalabilityNotes;
      if (tradeoffs !== undefined) design.hld.tradeoffs = tradeoffs;
    }

    await design.save();

    res.status(200).json({
      success: true,
      message: 'Design updated successfully.',
      data: design,
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/designs/:id  ─────────────────────────────────────────────────

router.delete('/:id', async (req, res, next) => {
  try {
    const design = await findOwnedDesign(req.params.id, req.user._id, res);
    if (!design) return;

    await design.deleteOne();

    // Decrement user's total designs counter (floor at 0)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDesigns: -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Design deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/designs/:id/generate  ─────────────────────────────────────────

router.post('/:id/generate', async (req, res, next) => {
  try {
    const design = await findOwnedDesign(req.params.id, req.user._id, res);
    if (!design) return;

    // ── Monthly limit check for free plan ────────────────────────────────────
    if (req.user.plan === 'free') {
      // Check and reset monthly counter if new month
      const freshUser = await User.checkMonthlyLimit(req.user._id);

      if (freshUser.designsGeneratedThisMonth >= FREE_PLAN_MONTHLY_LIMIT) {
        return res.status(403).json({
          success: false,
          error: 'MONTHLY_LIMIT_REACHED',
          message: `Free plan allows ${FREE_PLAN_MONTHLY_LIMIT} AI generations per month. Upgrade to Pro for unlimited access.`,
          limit: FREE_PLAN_MONTHLY_LIMIT,
          used: freshUser.designsGeneratedThisMonth,
        });
      }
    }

    // ── Update status to generating ───────────────────────────────────────────
    design.status = 'generating';
    await design.save();

    // ── Merge any updated inputs from the request body ────────────────────────
    const productName = req.body.productName || design.productName || design.title;
    const requirements = req.body.requirements || design.requirements || '';
    const constraints = req.body.constraints || design.constraints || {};

    // ── Call AI service ───────────────────────────────────────────────────────
    let aiResult;
    try {
      aiResult = await generateDesign({ productName, requirements, constraints });
    } catch (aiErr) {
      // Mark design as error before rethrowing
      design.status = 'error';
      await design.save();
      return res.status(502).json({
        success: false,
        message: `AI generation failed: ${aiErr.message}`,
      });
    }

    // ── Persist AI result to design ───────────────────────────────────────────
    design.title = aiResult.title || design.title;
    design.summary = aiResult.summary || '';
    design.hld = aiResult.hld || {};
    design.lld = aiResult.lld || {};
    design.database = aiResult.database || {};
    design.scalability = aiResult.scalability || {};
    design.uiux = aiResult.uiux || {};
    design.challengeMode = aiResult.challengeMode || {};
    design.systemFlow = aiResult.systemFlow || '';
    design.designDecisions = aiResult.designDecisions || [];
    design.failureHandling = aiResult.failureHandling || [];
    design.security = aiResult.security || [];
    design.observability = aiResult.observability || [];
    design.status = 'generated';

    // Update inputs in case they came from the request body
    if (req.body.requirements) design.requirements = requirements;
    if (req.body.constraints) design.constraints = constraints;
    if (req.body.productName) design.productName = productName;

    await design.save();

    // ── Increment monthly counter ─────────────────────────────────────────────
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { designsGeneratedThisMonth: 1 },
    });

    res.status(200).json({
      success: true,
      message: 'Design generated successfully.',
      data: design,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/designs/:id/challenge  ────────────────────────────────────────

router.post(
  '/:id/challenge',
  setFeature('Challenge Mode'),
  requirePro,
  async (req, res, next) => {
    try {
      const design = await findOwnedDesign(req.params.id, req.user._id, res);
      if (!design) return;

      if (design.status !== 'generated') {
        return res.status(400).json({
          success: false,
          message: 'Challenge Mode is only available for fully generated designs. Please generate the design first.',
        });
      }

      // ── Call AI challenge analysis ──────────────────────────────────────────
      let challengeResult;
      try {
        challengeResult = await generateChallenge({
          hld: design.hld,
          lld: design.lld,
          database: design.database,
        });
      } catch (aiErr) {
        return res.status(502).json({
          success: false,
          message: `Challenge Mode AI failed: ${aiErr.message}`,
        });
      }

      // ── Save challenge results ──────────────────────────────────────────────
      design.challengeMode = challengeResult;
      await design.save();

      res.status(200).json({
        success: true,
        message: 'Challenge Mode analysis complete.',
        data: design.challengeMode,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/designs/:id/export  ────────────────────────────────────────────

router.get(
  '/:id/export',
  setFeature('Export'),
  requirePro,
  async (req, res, next) => {
    try {
      const design = await findOwnedDesign(req.params.id, req.user._id, res);
      if (!design) return;

      if (design.status !== 'generated') {
        return res.status(400).json({
          success: false,
          message: 'Only generated designs can be exported.',
        });
      }

      // Build full export object
      const exportData = {
        exportedAt: new Date().toISOString(),
        exportedBy: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        design: {
          id: design._id,
          title: design.title,
          summary: design.summary,
          productName: design.productName,
          requirements: design.requirements,
          constraints: design.constraints,
          hld: design.hld,
          lld: design.lld,
          database: design.database,
          scalability: design.scalability,
          uiux: design.uiux,
          challengeMode: design.challengeMode,
          tags: design.tags,
          createdAt: design.createdAt,
          updatedAt: design.updatedAt,
        },
        meta: {
          version: '1.0.0',
          generator: 'ArchMind',
        },
      };

      res.status(200).json({
        success: true,
        data: exportData,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/designs/:id/share  ────────────────────────────────────────────

router.post(
  '/:id/share',
  setFeature('Share Link'),
  requirePro,
  async (req, res, next) => {
    try {
      const design = await findOwnedDesign(req.params.id, req.user._id, res);
      if (!design) return;

      if (design.status !== 'generated') {
        return res.status(400).json({
          success: false,
          message: 'Only generated designs can be shared.',
        });
      }

      // Generate unique share ID if not already set
      if (!design.shareId) {
        design.shareId = nanoid(12);
      }
      design.isPublic = true;
      await design.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const shareUrl = `${frontendUrl}/share/${design.shareId}`;

      // Track share link on user document (avoid duplicates)
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { shareLinks: shareUrl },
      });

      res.status(200).json({
        success: true,
        message: 'Share link generated successfully.',
        data: {
          shareId: design.shareId,
          shareUrl,
          isPublic: design.isPublic,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/designs/:id/uiux/generate-mockup  ─────────────────────────────
router.post('/:id/uiux/generate-mockup', async (req, res, next) => {
  try {
    const { screenName = '' } = req.body;
    const design = await findOwnedDesign(req.params.id, req.user._id, res);
    if (!design) return;

    if (!design.uiux || !Array.isArray(design.uiux.screens)) {
      return res.status(400).json({
        success: false,
        message: 'UI/UX screens are not generated yet for this design.',
      });
    }

    const name = screenName.toLowerCase().trim();
    let mockupUrl = '/mockups/general.png';

    if (name.includes('dashboard') || name.includes('admin') || name.includes('analytics') || name.includes('stat')) {
      mockupUrl = '/mockups/dashboard.png';
    } else if (name.includes('landing') || name.includes('home') || name.includes('welcome') || name.includes('hero')) {
      mockupUrl = '/mockups/landing.png';
    } else if (name.includes('checkout') || name.includes('cart') || name.includes('payment') || name.includes('bill') || name.includes('transaction')) {
      mockupUrl = '/mockups/checkout.png';
    } else if (name.includes('search') || name.includes('feed') || name.includes('list') || name.includes('explore') || name.includes('product')) {
      mockupUrl = '/mockups/general.png';
    }

    // Update screen in database
    let screenFound = false;
    design.uiux.screens = design.uiux.screens.map((scr) => {
      if (scr.name === screenName) {
        screenFound = true;
        return { ...scr, mockupUrl };
      }
      return scr;
    });

    if (!screenFound && design.uiux.screens.length > 0) {
      const idx = design.uiux.screens.findIndex(s => s.name?.toLowerCase().includes(name) || name.includes(s.name?.toLowerCase()));
      if (idx !== -1) {
        design.uiux.screens[idx] = { ...design.uiux.screens[idx], mockupUrl };
        screenFound = true;
      }
    }

    if (!screenFound && design.uiux.screens.length > 0) {
      design.uiux.screens[0] = { ...design.uiux.screens[0], mockupUrl };
    }

    design.markModified('uiux.screens');
    await design.save();

    res.status(200).json({
      success: true,
      message: 'Visual UI mockup generated successfully.',
      mockupUrl,
      uiux: design.uiux,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/designs/:id/commit  ──────────────────────────────────────────
router.post('/:id/commit', async (req, res, next) => {
  try {
    const design = await findOwnedDesign(req.params.id, req.user._id, res);
    if (!design) return;

    const { commitMessage = 'Manual save snapshot' } = req.body;

    // Find latest version number
    const latest = await Version.findOne({ designId: design._id })
      .sort({ versionNumber: -1 })
      .lean();

    const nextVersion = latest ? latest.versionNumber + 1 : 1;

    const snapshot = await Version.create({
      designId: design._id,
      versionNumber: nextVersion,
      commitMessage: commitMessage.trim().slice(0, 500) || `Save snapshot #${nextVersion}`,
      hld: design.hld,
      lld: design.lld,
      database: design.database,
      scalability: design.scalability,
      uiux: design.uiux,
      authorId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Design snapshot committed successfully.',
      data: snapshot,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/designs/:id/versions  ─────────────────────────────────────────
router.get('/:id/versions', async (req, res, next) => {
  try {
    const design = await findOwnedDesign(req.params.id, req.user._id, res);
    if (!design) return;

    const list = await Version.find({ designId: design._id })
      .sort({ versionNumber: -1 })
      .select('versionNumber commitMessage authorId createdAt')
      .lean();

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/designs/:id/versions/:versionId/rollback  ────────────────────
router.post('/:id/versions/:versionId/rollback', async (req, res, next) => {
  try {
    const design = await findOwnedDesign(req.params.id, req.user._id, res);
    if (!design) return;

    const snapshot = await Version.findOne({
      designId: design._id,
      _id: req.params.versionId,
    });

    if (!snapshot) {
      return res.status(404).json({
        success: false,
        message: 'Version snapshot not found.',
      });
    }

    // Rollback the design document
    if (snapshot.hld) design.hld = snapshot.hld;
    if (snapshot.lld) design.lld = snapshot.lld;
    if (snapshot.database) design.database = snapshot.database;
    if (snapshot.scalability) design.scalability = snapshot.scalability;
    if (snapshot.uiux) design.uiux = snapshot.uiux;

    // Also commit a new rollback message to prevent losing the current state
    const latest = await Version.findOne({ designId: design._id })
      .sort({ versionNumber: -1 })
      .lean();
    const nextVersion = latest ? latest.versionNumber + 1 : 1;

    await Version.create({
      designId: design._id,
      versionNumber: nextVersion,
      commitMessage: `Rollback to Version v${snapshot.versionNumber}`,
      hld: design.hld,
      lld: design.lld,
      database: design.database,
      scalability: design.scalability,
      uiux: design.uiux,
      authorId: req.user._id,
    });

    await design.save();

    res.status(200).json({
      success: true,
      message: `Design successfully rolled back to Version v${snapshot.versionNumber}.`,
      data: design,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
