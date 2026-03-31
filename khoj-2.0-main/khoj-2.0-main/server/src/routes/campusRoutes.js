const express = require('express');
const College = require('../models/College');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Requires authentication — prevents public enumeration of all colleges/campuses
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    console.error('Fetch colleges error', error);
    res.status(500).json({ message: 'Failed to fetch colleges' });
  }
});

module.exports = router;
