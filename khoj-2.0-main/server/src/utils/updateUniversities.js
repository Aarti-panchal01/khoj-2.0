const University = require('../models/University');
const universitiesData = require('../data/universities');

/**
 * Update existing universities with new data from universities.js
 * This script will update the university name and campuses
 */
const updateUniversities = async () => {
  console.log('Starting university update...');
  
  for (const uniData of universitiesData) {
    try {
      // Find university by slug
      const existing = await University.findOne({ slug: uniData.slug });
      
      if (existing) {
        // Update existing university
        existing.name = uniData.name;
        existing.campuses = uniData.campuses;
        await existing.save();
        console.log(`✓ Updated: ${uniData.name}`);
      } else {
        // Create new university if it doesn't exist
        await University.create(uniData);
        console.log(`✓ Created: ${uniData.name}`);
      }
    } catch (error) {
      console.error(`✗ Error updating ${uniData.name}:`, error.message);
    }
  }
  
  console.log('University update completed!');
};

module.exports = updateUniversities;
