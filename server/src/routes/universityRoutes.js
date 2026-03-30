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
    res.json(
      universities.map((u) => ({
        _id: u._id,
        name: u.name,
        campuses: (u.campuses || []).map((c) => ({
          _id: c._id,
          name: c.name,
        })),
      }))
    );
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

/**
 * POST /api/universities/fix-dsi
 * One-time fix for Dayananda Sagar Institutions
 */
router.post('/fix-dsi', async (_req, res) => {
  try {
    const result = await University.findOneAndUpdate(
      { slug: 'dayananda-sagar-institutions' },
      {
        name: 'Dayananda Sagar Institutions',
        slug: 'dayananda-sagar-institutions',
        campuses: [
          { name: 'DSU' },
          { name: 'DSCE' },
          { name: 'DSATM' }
        ]
      },
      { new: true }
    );
    
    if (result) {
      res.json({ 
        message: 'DSI updated successfully',
        university: {
          name: result.name,
          campuses: result.campuses.map(c => c.name)
        }
      });
    } else {
      res.status(404).json({ message: 'DSI not found' });
    }
  } catch (error) {
    console.error('Fix DSI error', error);
    res.status(500).json({ message: 'Failed to fix DSI' });
  }
});

module.exports = router;
