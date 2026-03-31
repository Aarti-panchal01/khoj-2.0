const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const University = require('../models/University');
const { itemSchema } = require('../utils/validators');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const requireUniversity = require('../middleware/requireUniversity');
const { escapeRegex } = require('../utils/universityScope');

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

/** Contact visibility: use item.userEmail / item.userPhone only. Respect contactPreference. */
const attachPosterContact = (item, viewerUserId) => {
  const itemObj = typeof item.toObject === 'function' ? item.toObject() : { ...item };

  if (String(itemObj.user) === String(viewerUserId)) {
    delete itemObj.userEmail;
    delete itemObj.userPhone;
    return itemObj;
  }

  const pref = itemObj.contactPreference || 'both';
  const itemEmail = itemObj.userEmail ? String(itemObj.userEmail).trim() : '';
  const itemPhone = itemObj.userPhone ? String(itemObj.userPhone).trim() : '';

  let userEmail = null;
  let userPhone = null;

  if (pref === 'email' || pref === 'both') {
    userEmail = itemEmail || null;
  }
  if (pref === 'phone' || pref === 'both') {
    userPhone = itemPhone || null;
  }

  return {
    ...itemObj,
    userEmail,
    userPhone,
  };
};

const enrichItemsWithContact = (items, viewerUserId) => items.map((it) => attachPosterContact(it, viewerUserId));

async function buildListingFilter(req) {
  const u = req.user;
  const { type, category, status, search, campusId: campusIdParam } = req.query;
  const andParts = [];

  if (u && u.universityId) {
    andParts.push({ universityId: u.universityId });
  }

  if (type) {
    if (!ALLOWED_TYPES.has(type)) {
      const err = new Error('Invalid type filter');
      err.status = 400;
      throw err;
    }
    andParts.push({ type });
  }

  if (status) {
    if (!ALLOWED_STATUSES.has(status)) {
      const err = new Error('Invalid status filter');
      err.status = 400;
      throw err;
    }
    andParts.push({ status });
  }

  if (category) {
    andParts.push({ category: String(category).slice(0, 100) });
  }

  if (search) {
    const trimmed = String(search).trim().slice(0, SEARCH_MAX_LENGTH);
    if (trimmed) {
      const safe = escapeRegex(trimmed);
      andParts.push({
        $or: [
          { title: { $regex: safe, $options: 'i' } },
          { description: { $regex: safe, $options: 'i' } },
          { location: { $regex: safe, $options: 'i' } },
        ],
      });
    }
  }

  if (campusIdParam) {
    if (!mongoose.Types.ObjectId.isValid(campusIdParam)) {
      const err = new Error('Invalid campusId');
      err.status = 400;
      throw err;
    }
    const oid = new mongoose.Types.ObjectId(campusIdParam);
    andParts.push({ campusId: oid });
  }

  if (!andParts.length) return {};
  if (andParts.length === 1) return andParts[0];
  return { $and: andParts };
}

// ─── GET /items — guest: all universities (no contact); authed + onboarding: scoped + contact ─

router.get('/', optionalAuth, async (req, res) => {
  try {
    const u = req.user;
    const { campusId: campusIdParam } = req.query;

    if (u && !u.universityId) {
      return res.status(403).json({ message: 'Complete onboarding to view your campus feed.' });
    }

    if (campusIdParam && u?.universityId) {
      if (!mongoose.Types.ObjectId.isValid(campusIdParam)) {
        return res.status(400).json({ message: 'Invalid campusId' });
      }
      const uni = await University.findById(u.universityId).select('campuses').lean();
      const ok = uni?.campuses?.some((c) => String(c._id) === String(campusIdParam));
      if (!ok) {
        return res.json([]);
      }
    }

    if (campusIdParam && !u?.universityId) {
      if (!mongoose.Types.ObjectId.isValid(campusIdParam)) {
        return res.status(400).json({ message: 'Invalid campusId' });
      }
    }

    let filters;
    try {
      filters = await buildListingFilter(req);
    } catch (err) {
      return res.status(err.status || 400).json({ message: err.message });
    }

    let items = await Item.find(filters).sort({ createdAt: -1 }).limit(100).lean();

    if (u && u.universityId) {
      items = await enrichItemsWithContact(items, u._id);
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
    const items = await Item.find({ user: req.user._id, universityId: req.user.universityId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (error) {
    console.error('Get user items error', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

router.post('/', async (req, res) => {
  try {
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

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, universityId: req.user.universityId }).lean();

    if (!item) return res.status(404).json({ message: 'Item not found' });

    const withContact = attachPosterContact(item, req.user._id);
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

    const item = await Item.findOne({
      _id: req.params.id,
      user: req.user._id,
      universityId: req.user.universityId,
    });

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
