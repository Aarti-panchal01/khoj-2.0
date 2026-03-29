const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const { itemSchema } = require('../utils/validators');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = new Set(['found', 'lost']);
const ALLOWED_STATUSES = new Set(['active', 'resolved']);
const SEARCH_MAX_LENGTH = 200;

// Fields that must never be overwritten via client input
const PROTECTED_ITEM_FIELDS = ['user', 'userName', 'universityId', 'campusId', 'universityName', 'campusName', 'status'];

// ─── Helper: build the base university filter ─────────────────────────────────

/**
 * Returns a MongoDB filter object scoped to the authenticated user's university.
 * universityId is ALWAYS taken from req.user — never from the request body/query.
 *
 * If ?campusId=<ObjectId> is provided, it is validated as a real ObjectId and
 * added as an optional filter. Campus is a filter, NOT a restriction.
 */
const buildUniversityFilter = (req) => {
  // Core isolation: always scope to the authenticated user's university
  const filter = { universityId: req.user.universityId };

  const { campusId } = req.query;
  if (campusId) {
    // Validate it's a real ObjectId — prevents injection via malformed strings
    if (!mongoose.Types.ObjectId.isValid(campusId)) {
      const err = new Error('Invalid campusId');
      err.status = 400;
      throw err;
    }
    filter.campusId = new mongoose.Types.ObjectId(campusId);
  }

  return filter;
};

// ─── GET /items — university-wide feed with optional filters ──────────────────

router.get('/', async (req, res) => {
  try {
    let filters;
    try {
      filters = buildUniversityFilter(req);
    } catch (err) {
      return res.status(err.status || 400).json({ message: err.message });
    }

    const { type, category, status, search } = req.query;

    if (type) {
      if (!ALLOWED_TYPES.has(type)) return res.status(400).json({ message: 'Invalid type filter' });
      filters.type = type;
    }
    if (status) {
      if (!ALLOWED_STATUSES.has(status)) return res.status(400).json({ message: 'Invalid status filter' });
      filters.status = status;
    }
    if (category) filters.category = String(category).slice(0, 100);

    if (search) {
      const trimmed = String(search).trim().slice(0, SEARCH_MAX_LENGTH);
      if (trimmed) filters.$text = { $search: trimmed };
    }

    const query = Item.find(filters);

    if (filters.$text) {
      query.sort({ score: { $meta: 'textScore' }, createdAt: -1 });
    } else {
      query.sort({ createdAt: -1 });
    }

    const items = await query.limit(100).lean();
    res.json(items);
  } catch (error) {
    console.error('Get items error', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

// ─── GET /items/mine ──────────────────────────────────────────────────────────

router.get('/mine', async (req, res) => {
  try {
    // Scoped to user AND university — consistent with the rest of the API
    const items = await Item.find({
      user: req.user._id,
      universityId: req.user.universityId,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (error) {
    console.error('Get user items error', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

// ─── POST /items ──────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before posting items.',
        requiresVerification: true,
      });
    }

    const payload = itemSchema.parse(req.body);

    const item = await Item.create({
      ...payload,
      user: req.user._id,
      userName: req.user.name,
      // universityId + campusId always come from the authenticated user — never from payload
      universityId: req.user.universityId,
      campusId: req.user.campusId || null,
      universityName: req.user.universityName,
      campusName: req.user.campusName || '',
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error', error);
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const field = firstError.path.join('.');
      return res.status(400).json({ message: `${field}: ${firstError.message}`, field, errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create item' });
  }
});

// ─── GET /items/:id ───────────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    // universityId scoping prevents cross-university enumeration
    const item = await Item.findOne({
      _id: req.params.id,
      universityId: req.user.universityId,
    }).lean();

    if (!item) return res.status(404).json({ message: 'Item not found' });

    const isOwner = String(item.user) === String(req.user._id);
    if (isOwner) return res.json(item);

    // Non-owner: attach contact info per poster's preference
    const poster = await User.findById(item.user).select('email phone').lean();
    const contact = {};
    if (poster) {
      if (item.contactPreference === 'both' || item.contactPreference === 'email') {
        contact.userEmail = poster.email;
      }
      if (item.contactPreference === 'both' || item.contactPreference === 'phone') {
        contact.userPhone = poster.phone;
      }
    }

    res.json({ ...item, ...contact });
  } catch (error) {
    console.error('Get item error', error);
    res.status(500).json({ message: 'Failed to fetch item' });
  }
});

// ─── PUT /items/:id ───────────────────────────────────────────────────────────

router.put('/:id', async (req, res) => {
  try {
    const payload = itemSchema.partial().parse(req.body);

    // Strip protected fields — client cannot change ownership or university
    PROTECTED_ITEM_FIELDS.forEach(f => delete payload[f]);

    const item = await Item.findOne({
      _id: req.params.id,
      user: req.user._id,
      universityId: req.user.universityId,
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });

    Object.assign(item, payload);
    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Update item error', error);
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const field = firstError.path.join('.');
      return res.status(400).json({ message: `${field}: ${firstError.message}`, field, errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update item' });
  }
});

// ─── DELETE /items/:id ────────────────────────────────────────────────────────

router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      user: req.user._id,
      universityId: req.user.universityId,
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete item error', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

module.exports = router;
