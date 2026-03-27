const University = require('../models/University');
const universitiesData = require('../data/universities');

const seedUniversities = async () => {
  const count = await University.countDocuments();
  if (count > 0) {
    // Already seeded — skip. To re-seed, drop the universities collection manually.
    return;
  }

  await University.insertMany(universitiesData);
  console.log(`Seeded ${universitiesData.length} universities`);
};

module.exports = seedUniversities;
