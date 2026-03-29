/**
 * One-time script to fix Dayananda Sagar Institutions data
 * Run this with: node server/src/scripts/fixDSI.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const University = require('../models/University');

const fixDSI = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Find and update Dayananda Sagar
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
      console.log('✓ Updated Dayananda Sagar Institutions');
      console.log('  Name:', result.name);
      console.log('  Campuses:', result.campuses.map(c => c.name).join(', '));
    } else {
      console.log('✗ University not found');
    }

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

fixDSI();
