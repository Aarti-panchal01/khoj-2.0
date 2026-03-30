const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const { itemSchema } = require('../utils/validators');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const requireUniversity = require('../middleware/requireUniversity');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const router = express.Router();

const ALLOWED_TYPES = new Set(['found', 'lost']);
const ALLOWED_STATUSES = new Set(['active', 'resolved']);
const SEARCH_MAX_LENGTH = 200;

const PROTECTED_ITEM_FIELDS = [
  'user',
  'userName',
  'userEmail',
  'userPhone',
  'universityId',
  'campusId',
  'universityName',
  'campusName',
  'status',
];

/** Strip direct contact fields for guest responses */
const stripContactFields = (item) => {
  const clone = { ...item };
  delete clone.userEmail;
  delete clone.userPhone;
  delete clone.email;
  delete clone.phone;
  return clone;
};

/**
 * Contact visibility: prefer denormalized item fields, then User. Respect contactPreference.
 */
const attachPosterContact = (item, poster, viewerUserId) => {
  const itemObj = typeof item.toObject === 'function' ? item.toObject() : { ...item };

  // Owner never gets direct contact details
  if (String(itemObj.user) === String(viewerUserId)) {
    const copy = { ...itemObj };
    delete copy.userEmail;
    delete copy.userPhone;
    return copy;
  }

  const pref = itemObj.contactPreference || 'both';
  const posterEmail = poster?.email ? String(poster.email).trim() : '';
  const posterPhone = poster?.phone ? String(poster.phone).trim() : '';

  const userEmail = pref === 'phone' ? null : (posterEmail || null);
  const userPhone = pref === 'email' ? null : (posterPhone || null);

  return {
    ...itemObj,
    userEmail,
    userPhone,
  };
};

const enrichItemsWithContact = async (items, viewerUserId) => {
  if (!items.length) return items;
  const userIds = [...new Set(items.map((i) => String(i.user)))];
  const posters = await User.find({ _id: { $in: userIds } }).select('email phone').lean();
  const map = Object.fromEntries(posters.map((p) => [String(p._id), p]));
  return items.map((it) => attachPosterContact(it, map[String(it.user)], viewerUserId));
};

function scopedAndFilter(user, clauses) {
  const parts = [...clauses];
  if (user?.universityId) parts.push({ universityId: user.universityId });
  if (!parts.length) return {};
  if (parts.length === 1) return parts[0];
  return { $and: parts };
}

async function buildListingFilter(req) {
  const { type, category, status, search, campusId } = req.query;
  const query = {};

  // Logged-in feed is always scoped to the user's university.
  if (req.user?.universityId) {
    query.universityId = req.user.universityId;
  }

  if (type) {
    if (!ALLOWED_TYPES.has(type)) {
      const err = new Error('Invalid type filter');
      err.status = 400;
      throw err;
    }
    query.type = type;
  }

  if (status) {
    if (!ALLOWED_STATUSES.has(status)) {
      const err = new Error('Invalid status filter');
      err.status = 400;
      throw err;
    }
    query.status = status;
  }

  if (category) {
    query.category = String(category).slice(0, 100);
  }

  if (campusId) {
    if (!mongoose.Types.ObjectId.isValid(campusId)) {
      const err = new Error('Invalid campusId');
      err.status = 400;
      throw err;
    }
    query.campusId = new mongoose.Types.ObjectId(campusId);
  }

  if (search) {
    const trimmed = String(search).trim().slice(0, SEARCH_MAX_LENGTH);
    if (trimmed) {
      const safe = escapeRegex(trimmed);
      query.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];
    }
  }

  return query;
}

// ─── GET /items — guest: all universities (no contact); authed + onboarding: scoped + contact ─

router.get('/', optionalAuth, async (req, res) => {
  try {
    if (req.user && !req.user.universityId) {
      return res.status(403).json({ message: 'Complete onboarding to view your campus feed.' });
    }

    let filters;
    try {
      filters = await buildListingFilter(req);
    } catch (err) {
      return res.status(err.status || 400).json({ message: err.message });
    }

    let items = await Item.find(filters).sort({ createdAt: -1 }).limit(100).lean();

    if (req.user?.universityId) {
      items = await enrichItemsWithContact(items, req.user._id);
      return res.json(items);
    }

    return res.json(items.map(stripContactFields));
  } catch (error) {
    console.error('Get items error', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

router.use(authMiddleware);
router.use(requireUniversity);

router.get('/mine', async (req, res) => {
  try {
    const filter = scopedAndFilter(req.user, [{ user: req.user._id }]);
    const items = await Item.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (error) {
    console.error('Get user items error', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.user?.universityId || !req.user?.campusId) {
      return res.status(400).json({ message: 'Complete onboarding first' });
    }

    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before posting items.',
        requiresVerification: true,
      });
    }

    const payload = itemSchema.parse(req.body);

    const pref = payload.contactPreference || 'both';
    const userPhone = req.user.phone ? String(req.user.phone).trim() : '';
    if ((pref === 'phone' || pref === 'both') && !userPhone) {
      return res.status(400).json({
        message: 'Phone number required for selected contact preference. Add a phone number in your profile first.',
      });
    }

    const item = await Item.create({
      ...payload,
      user: req.user._id,
      userName: req.user.name,
      universityId: req.user.universityId,
      campusId: req.user.campusId,
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

router.get('/:id', async (req, res) => {
  try {
    const filter = scopedAndFilter(req.user, [{ _id: req.params.id }]);
    const item = await Item.findOne(filter).lean();

    if (!item) return res.status(404).json({ message: 'Item not found' });

    const poster = await User.findById(item.user).select('email phone').lean();
    const withContact = attachPosterContact(item, poster, req.user._id);
    res.json(withContact);
  } catch (error) {
    console.error('Get item error', error);
    res.status(500).json({ message: 'Failed to fetch item' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = itemSchema.partial().parse(req.body);

    PROTECTED_ITEM_FIELDS.forEach((f) => delete payload[f]);

    const filter = scopedAndFilter(req.user, [{ _id: req.params.id, user: req.user._id }]);
    const item = await Item.findOne(filter);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    const mergedPref = payload.contactPreference !== undefined ? payload.contactPreference : item.contactPreference;
    const pref = mergedPref || 'both';
    const userPhone = req.user.phone ? String(req.user.phone).trim() : '';
    if ((pref === 'phone' || pref === 'both') && !userPhone) {
      return res.status(400).json({
        message: 'Phone number required for selected contact preference. Add a phone number in your profile first.',
      });
    }

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

router.delete('/:id', async (req, res) => {
  try {
    const filter = scopedAndFilter(req.user, [{ _id: req.params.id, user: req.user._id }]);
    const item = await Item.findOne(filter);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete item error', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

module.exports = router;
