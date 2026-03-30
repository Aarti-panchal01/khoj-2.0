const express = require('express');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const requireUniversity = require('../middleware/requireUniversity');

const router = express.Router();
router.use(authMiddleware);
router.use(requireUniversity);

function itemInUniversityScopeFilter(itemId, user) {
  return { _id: itemId, universityId: user.universityId };
}

// POST /claims - Create a new claim
router.post('/', async (req, res) => {
  try {
    const { itemId, whereList, whenList, specificDetails } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: 'itemId is required' });
    }

    const item = await Item.findOne(itemInUniversityScopeFilter(itemId, req.user));

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (String(item.user) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot claim your own item' });
    }

    // Check if user already has a pending claim for this item
    const existingClaim = await Claim.findOne({
      itemId,
      claimerId: req.user._id,
      status: 'pending',
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You already have a pending claim for this item' });
    }

    const claim = await Claim.create({
      itemId,
      ownerId: item.user,
      claimerId: req.user._id,
      whereList: whereList || '',
      whenList: whenList || '',
      specificDetails: specificDetails || '',
      status: 'pending',
    });

    // Create notification for item owner
    await Notification.create({
      userId: item.user,
      type: 'claim_request',
      itemId,
      claimId: claim._id,
      message: `Someone is trying to claim your item.`,
      read: false,
    });

    res.status(201).json(claim);
  } catch (error) {
    console.error('Create claim error', error);
    res.status(500).json({ message: 'Failed to create claim' });
  }
});

// GET /claims/item/:itemId - Get all claims for an item (owner only)
router.get('/item/:itemId', async (req, res) => {
  try {
    const item = await Item.findOne(
      itemInUniversityScopeFilter(req.params.itemId, req.user)
    );
    if (!item || String(item.user) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Item not found or you are not the owner' });
    }

    const claims = await Claim.find({ itemId: req.params.itemId })
      .populate('claimerId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(claims);
  } catch (error) {
    console.error('Get item claims error', error);
    res.status(500).json({ message: 'Failed to fetch claims' });
  }
});

// GET /claims/mine - Get all claims for items owned by the current user
router.get('/mine', async (req, res) => {
  try {
    const claims = await Claim.find({ ownerId: req.user._id })
      .populate('itemId', 'title type category images')
      .populate('claimerId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(claims);
  } catch (error) {
    console.error('Get user claims error', error);
    res.status(500).json({ message: 'Failed to fetch claims' });
  }
});

// PUT /claims/:id/approve - Approve a claim (owner only)
router.put('/:id/approve', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (String(claim.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the item owner can approve claims' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ message: 'Claim already processed' });
    }

    claim.status = 'approved';
    await claim.save();

    // Update item status to resolved
    await Item.findByIdAndUpdate(claim.itemId, { status: 'resolved' });

    // Award reputation points: +10 for finder (claimer) only
    const User = require('../models/User');
    await User.findByIdAndUpdate(claim.claimerId, { $inc: { reputation: 10 } });

    // Create notification for claimer
    await Notification.create({
      userId: claim.claimerId,
      type: 'claim_approved',
      itemId: claim.itemId,
      claimId: claim._id,
      message: 'Your claim has been approved! You earned +10 reputation points.',
      read: false,
    });

    res.json(claim);
  } catch (error) {
    console.error('Approve claim error', error);
    res.status(500).json({ message: 'Failed to approve claim' });
  }
});

// PUT /claims/:id/reject - Reject a claim (owner only)
router.put('/:id/reject', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (String(claim.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the item owner can reject claims' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ message: 'Claim already processed' });
    }

    claim.status = 'rejected';
    await claim.save();

    // Create notification for claimer
    await Notification.create({
      userId: claim.claimerId,
      type: 'claim_rejected',
      itemId: claim.itemId,
      claimId: claim._id,
      message: 'Your claim has been rejected.',
      read: false,
    });

    res.json(claim);
  } catch (error) {
    console.error('Reject claim error', error);
    res.status(500).json({ message: 'Failed to reject claim' });
  }
});

module.exports = router;
