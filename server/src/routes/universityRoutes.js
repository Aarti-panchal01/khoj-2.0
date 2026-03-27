const express = require('express');
const University = require('../models/University');

const router = express.Router();

/**
 * GET /api/universities
 * Returns all universities with their campuses.
 * Used by signup/login forms to populate dropdowns.
 * Public endpoint — no auth required (reference data for unauthenticated signup/login forms).
 */
router.get('/', async (_req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 }).lean();
    res.json(universities);
  } catch (error) {
    console.error('Fetch universities error', error);
    res.status(500).json({ message: 'Failed to fetch universities' });
  }
});

module.exports = router;
