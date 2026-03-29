const express = require('express');
const University = require('../models/University');
const updateUniversities = require('../utils/updateUniversities');

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

/**
 * POST /api/universities/update
 * Updates universities from the universities.js data file
 * This endpoint can be called to sync database with code changes
 */
router.post('/update', async (_req, res) => {
  try {
    await updateUniversities();
    res.json({ message: 'Universities updated successfully' });
  } catch (error) {
    console.error('Update universities error', error);
    res.status(500).json({ message: 'Failed to update universities' });
  }
});

module.exports = router;
